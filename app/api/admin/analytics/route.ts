// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { AnalyticsService } from "@/services/analytics.service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "stats";

    if (type === "chart") {
      const days = parseInt(searchParams.get("days") ?? "30");
      const data = await AnalyticsService.getRevenueChart(days);
      return NextResponse.json({ success: true, data });
    }

    if (type === "top-products") {
      const data = await AnalyticsService.getTopProducts();
      return NextResponse.json({ success: true, data });
    }

    if (type === "recent-orders") {
      const data = await AnalyticsService.getRecentOrders();
      return NextResponse.json({ success: true, data });
    }

    const data = await AnalyticsService.getDashboardStats();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    const status = error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
