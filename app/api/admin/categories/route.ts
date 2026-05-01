// app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body      = await req.json();
    const validated = categorySchema.parse(body);
    const slug      = validated.name.toLowerCase().trim().replace(/[\s\W-]+/g, "-");

    const category = await prisma.category.create({
      data: { ...validated, slug },
    });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    const status = error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
