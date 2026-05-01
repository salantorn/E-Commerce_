// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";
import { productFilterSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = Object.fromEntries(searchParams.entries());
    const filters = productFilterSchema.parse(raw);

    // Convert tags from comma-separated string to array
    const processedFilters = {
      ...filters,
      tags: filters.tags ? filters.tags.split(',').map(t => t.trim()) : undefined,
    };

    const result = await ProductService.findMany(processedFilters);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
