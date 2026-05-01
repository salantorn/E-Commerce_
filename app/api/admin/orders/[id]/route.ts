// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import { updateOrderStatusSchema } from "@/lib/validations";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body      = await req.json();
    const { status, trackingNumber } = updateOrderStatusSchema.parse(body);

    const order = await OrderService.updateStatus(params.id, status as any, trackingNumber);
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    const s = error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status: s });
  }
}
