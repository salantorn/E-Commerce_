// services/analytics.service.ts
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, eachDayOfInterval, format } from "date-fns";

export class AnalyticsService {
  static async getDashboardStats() {
    const now       = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd   = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd   = endOfMonth(subMonths(now, 1));

    const [
      totalRevenue, thisMonthRevenue, lastMonthRevenue,
      totalOrders, pendingOrders, processingOrders, shippedOrders,
      totalCustomers, newCustomers,
      totalProducts, lowStockProducts, outOfStockProducts,
    ] = await Promise.all([
      prisma.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED", paidAt: { gte: thisMonthStart, lte: thisMonthEnd } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED", paidAt: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { amount: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "USER", createdAt: { gte: thisMonthStart } } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { isActive: true, stock: 0 } }),
    ]);

    const thisRevenue = Number(thisMonthRevenue._sum.amount ?? 0);
    const lastRevenue = Number(lastMonthRevenue._sum.amount ?? 0);
    const growth = lastRevenue === 0 ? 100 : ((thisRevenue - lastRevenue) / lastRevenue) * 100;

    return {
      revenue: {
        total:      Number(totalRevenue._sum.amount ?? 0),
        thisMonth:  thisRevenue,
        lastMonth:  lastRevenue,
        growth:     Math.round(growth * 10) / 10,
      },
      orders: {
        total:      totalOrders,
        pending:    pendingOrders,
        processing: processingOrders,
        shipped:    shippedOrders,
      },
      customers: {
        total:        totalCustomers,
        newThisMonth: newCustomers,
      },
      products: {
        total:       totalProducts,
        lowStock:    lowStockProducts,
        outOfStock:  outOfStockProducts,
      },
    };
  }

  static async getRevenueChart(days = 30) {
    const end   = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        status:    { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: start, lte: end },
      },
      select: { createdAt: true, total: true },
    });

    const dateRange = eachDayOfInterval({ start, end });
    return dateRange.map((day) => {
      const dateStr   = format(day, "yyyy-MM-dd");
      const dayOrders = orders.filter(
        (o) => format(o.createdAt, "yyyy-MM-dd") === dateStr
      );
      return {
        date:    dateStr,
        revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
        orders:  dayOrders.length,
      };
    });
  }

  static async getTopProducts(limit = 5) {
    return prisma.product.findMany({
      where:   { isActive: true },
      orderBy: { soldCount: "desc" },
      take:    limit,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
    });
  }

  static async getRecentOrders(limit = 5) {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take:    limit,
      include: {
        user:  { select: { name: true, email: true } },
        items: true,
      },
    });
  }
}
