// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ success: false, error: "กรุณากรอกโค้ด" }, { status: 400 });

    const coupon = await prisma.coupon.findFirst({
      where: {
        code:     code.toUpperCase(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    });

    if (!coupon) {
      return NextResponse.json({ success: false, error: "โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว" }, { status: 404 });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: "โค้ดนี้ถูกใช้งานครบแล้ว" }, { status: 400 });
    }

    if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      return NextResponse.json({
        success: false,
        error:   `ต้องสั่งซื้อขั้นต่ำ ฿${coupon.minOrderValue} เพื่อใช้โค้ดนี้`,
      }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
    } else {
      discount = Number(coupon.discountValue);
    }
    discount = Math.min(discount, subtotal);

    return NextResponse.json({ success: true, data: { coupon, discount } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
