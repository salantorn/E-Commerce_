// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ProductService } from "@/services/product.service";
import { productSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import { uploadProductImage } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page    = parseInt(searchParams.get("page") ?? "1");
    const perPage = parseInt(searchParams.get("perPage") ?? "20");
    const search  = searchParams.get("search") ?? undefined;

    const result = await ProductService.findMany({ page, perPage, search });
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === "Forbidden" ? 403 : error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { images: rawImages, ...productData } = body;

    const validated = productSchema.parse(productData);

    // Upload images to cloudinary
    const uploadedImages: { url: string; isPrimary: boolean }[] = [];
    if (rawImages && Array.isArray(rawImages)) {
      for (let i = 0; i < rawImages.length; i++) {
        const img = rawImages[i];
        if (img.startsWith("data:")) {
          const { url } = await uploadProductImage(img);
          uploadedImages.push({ url, isPrimary: i === 0 });
        } else {
          uploadedImages.push({ url: img, isPrimary: i === 0 });
        }
      }
    }

    const product = await ProductService.create({ ...validated, images: uploadedImages });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    const status = error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
