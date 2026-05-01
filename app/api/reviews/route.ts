// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body      = await req.json();
    const validated = reviewSchema.parse(body);

    const review = await prisma.review.upsert({
      where:  { userId_productId: { userId: session.user.id, productId: validated.productId } },
      update: { rating: validated.rating, title: validated.title, body: validated.body },
      create: { ...validated, userId: session.user.id },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    // Recalculate product rating
    const agg = await prisma.review.aggregate({
      where:   { productId: validated.productId },
      _avg:    { rating: true },
      _count:  { rating: true },
    });

    await prisma.product.update({
      where: { id: validated.productId },
      data:  { rating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
