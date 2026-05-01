// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await ProductService.findById(params.id);
    if (!product) return NextResponse.json({ success: false, error: "ไม่พบสินค้า" }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
