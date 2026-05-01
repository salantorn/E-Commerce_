// services/order.service.ts
import prisma from "@/lib/prisma";
import { generateOrderNumber, calculateOrderSummary } from "@/lib/utils";
import { ProductService } from "./product.service";
import type { OrderWithDetails, AdminOrderFilters, PaginatedResponse } from "@/types";
import type { OrderStatus } from "@prisma/client";

export class OrderService {
  static async createFromCart({
    userId,
    addressId,
    couponCode,
    notes,
  }: {
    userId:     string;
    addressId?: string;
    couponCode?: string;
    notes?:     string;
  }) {
    // Get user cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { images: true } } },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("ตะกร้าสินค้าว่างเปล่า");
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`สินค้า "${item.product.name}" มีสต็อกไม่เพียงพอ`);
      }
    }

    // Get coupon
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code:     couponCode,
          isActive: true,
          OR: [
            { expiresAt: null }, 
            { expiresAt: { gte: new Date() } },
            { usageLimit: null }, 
            { usageCount: { lt: prisma.coupon.fields.usageLimit as never } }
          ],
        },
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    const summary = calculateOrderSummary({ 
      subtotal, 
      coupon: coupon ? {
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      } : null
    });

    if (coupon && coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      throw new Error(`ต้องสั่งซื้อขั้นต่ำ ฿${coupon.minOrderValue} เพื่อใช้โค้ดนี้`);
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId:   addressId || null,
          couponCode:  couponCode || null,
          subtotal:    summary.subtotal,
          discount:    summary.discount,
          tax:         summary.tax,
          shipping:    summary.shipping,
          total:       summary.total,
          notes:       notes || null,
          items: {
            createMany: {
              data: cart.items.map((item) => ({
                productId:    item.productId,
                productName:  item.product.name,
                productImage: item.product.images[0]?.url,
                variantId:    item.variantId,
                quantity:     item.quantity,
                price:        item.product.price,
                total:        Number(item.product.price) * item.quantity,
              })),
            },
          },
        },
        include: { items: true },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount:  summary.total,
          status:  "PENDING",
        },
      });

      // Update coupon usage
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data:  { usageCount: { increment: 1 } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  }

  static async findById(id: string, userId?: string): Promise<OrderWithDetails | null> {
    return prisma.order.findFirst({
      where: { id, ...(userId ? { userId } : {}) },
      include: {
        items:   true,
        payment: true,
        address: true,
        user:    { select: { id: true, name: true, email: true } },
      },
    }) as Promise<OrderWithDetails | null>;
  }

  static async findByUser(userId: string, page = 1, perPage = 10) {
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where:   { userId },
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * perPage,
        take:    perPage,
        include: { items: true, payment: true },
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  }

  static async adminFindMany(filters: AdminOrderFilters): Promise<PaginatedResponse<OrderWithDetails>> {
    const { status, search, dateFrom, dateTo, page = 1, perPage = 20 } = filters;

    const where: any = {};
    if (status)   where.status = status;
    if (dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
    if (dateTo)   where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user:        { email: { contains: search, mode: "insensitive" } } },
        { user:        { name:  { contains: search, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * perPage,
        take:    perPage,
        include: {
          items:   true,
          payment: true,
          address: true,
          user:    { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { items: items as OrderWithDetails[], total, page, perPage, totalPages: Math.ceil(total / perPage) };
  }

  static async updateStatus(id: string, status: OrderStatus, trackingNumber?: string) {
    const data: any = { status };
    if (trackingNumber) data.trackingNumber = trackingNumber;
    if (status === "SHIPPED")   data.shippedAt   = new Date();
    if (status === "DELIVERED") data.deliveredAt  = new Date();

    const order = await prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });

    // Decrease stock when paid
    if (status === "PAID") {
      await ProductService.decreaseStock(
        order.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );
    }

    return order;
  }

  static async markPaid(stripeSessionId: string) {
    const payment = await prisma.payment.findUnique({
      where:   { stripeSessionId },
      include: { order: true },
    });
    if (!payment) throw new Error("Payment not found");

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data:  { status: "COMPLETED", paidAt: new Date() },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data:  { status: "PAID" },
      }),
    ]);

    await ProductService.decreaseStock(
      await prisma.orderItem
        .findMany({ where: { orderId: payment.orderId } })
        .then((items) => items.map((i) => ({ productId: i.productId, quantity: i.quantity })))
    );

    return payment.order;
  }
}
