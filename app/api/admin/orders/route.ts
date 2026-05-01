// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { OrderService } from "@/services/order.service";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);

    const filters = {
      status:   (searchParams.get("status") as any) || undefined,
      search:   searchParams.get("search") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo:   searchParams.get("dateTo") || undefined,
      page:     parseInt(searchParams.get("page") ?? "1"),
      perPage:  parseInt(searchParams.get("perPage") ?? "20"),
    };

    const result = await OrderService.adminFindMany(filters);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
