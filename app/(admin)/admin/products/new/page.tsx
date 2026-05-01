// app/(admin)/admin/products/new/page.tsx
import AdminProductForm from "@/components/admin/AdminProductForm";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "เพิ่มสินค้าใหม่ | Admin" };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-dark mb-6">เพิ่มสินค้าใหม่</h1>
      <AdminProductForm categories={categories} />
    </div>
  );
}
