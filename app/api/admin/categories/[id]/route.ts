// app/api/admin/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });
    
    if (!category) {
      return NextResponse.json({ success: false, error: "ไม่พบหมวดหมู่" }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error: any) {
    const status = error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.category.update({
      where: { id: params.id },
      data:  { isActive: false },
    });
    return NextResponse.json({ success: true, message: "ลบหมวดหมู่สำเร็จ" });
  } catch (error: any) {
    const status = error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const category = await prisma.category.update({
      where: { id: params.id },
      data:  body,
    });
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
