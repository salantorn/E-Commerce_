// app/(admin)/admin/categories/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import AdminCategoryActions from "@/components/admin/AdminCategoryActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "จัดการหมวดหมู่ | Admin" };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">หมวดหมู่สินค้า</h1>
          <p className="text-text-muted text-sm">{categories.length} หมวดหมู่</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary">
            <tr>
              {["หมวดหมู่", "Slug", "จำนวนสินค้า", "สถานะ", ""].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-surface-secondary/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {cat.image
                      ? <img src={cat.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      : <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-primary-600" />
                        </div>}
                    <span className="font-medium text-dark">{cat.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-text-muted">{cat.slug}</td>
                <td className="py-3 px-4 text-gray-600">{cat._count.products}</td>
                <td className="py-3 px-4">
                  <span className={cat.isActive ? "badge-success" : "badge-gray"}>
                    {cat.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <AdminCategoryActions categoryId={cat.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-16">
            <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">ยังไม่มีหมวดหมู่</p>
          </div>
        )}
      </div>
    </div>
  );
}
