// app/(admin)/admin/products/[id]/page.tsx
import { ProductService } from "@/services/product.service";
import { notFound } from "next/navigation";
import AdminProductForm from "@/components/admin/AdminProductForm";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "แก้ไขสินค้า | Admin" };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    ProductService.findById(params.id),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-dark mb-6">แก้ไขสินค้า: {product.name}</h1>
      <AdminProductForm
        categories={categories}
        initialData={{
          id:           product.id,
          name:         product.name,
          description:  product.description,
          price:        Number(product.price),
          comparePrice: Number(product.comparePrice) || undefined,
          costPrice:    Number(product.costPrice) || undefined,
          sku:          product.sku || undefined,
          stock:        product.stock,
          categoryId:   product.categoryId,
          isActive:     product.isActive,
          isFeatured:   product.isFeatured,
          weight:       product.weight || undefined,
          images:       product.images.map((i) => i.url),
        }}
      />
    </div>
  );
}
