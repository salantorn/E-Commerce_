// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addToCartSchema, updateCartSchema } from "@/lib/validations";

// GET - fetch user cart
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ success: true, data: cart });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - add item to cart
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { productId, quantity, variantId } = addToCartSchema.parse(body);

    // Verify product exists and has stock
    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
    if (!product) return NextResponse.json({ success: false, error: "ไม่พบสินค้า" }, { status: 404 });
    if (product.stock < quantity) {
      return NextResponse.json({ success: false, error: "สินค้าในสต็อกไม่เพียงพอ" }, { status: 400 });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: session.user.id } });

    // Upsert cart item
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId ?? null },
    });

    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, product.stock);
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
    } else {
      await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity, variantId } });
    }

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH - update item quantity
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { cartItemId, quantity } = updateCartSchema.parse(body);

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return NextResponse.json({ success: true, message: "ลบสินค้าออกจากตะกร้าแล้ว" });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true },
    });

    if (!item || item.cart.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "ไม่พบรายการสินค้า" }, { status: 404 });
    }

    if (item.product.stock < quantity) {
      return NextResponse.json({ success: false, error: "สินค้าในสต็อกไม่เพียงพอ" }, { status: 400 });
    }

    await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
    return NextResponse.json({ success: true, message: "อัปเดตตะกร้าสินค้าแล้ว" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - remove item from cart
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("itemId");
    if (!cartItemId) return NextResponse.json({ success: false, error: "Missing itemId" }, { status: 400 });

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "ไม่พบรายการสินค้า" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return NextResponse.json({ success: true, message: "ลบสินค้าออกจากตะกร้าแล้ว" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
