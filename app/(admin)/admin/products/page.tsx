// app/(admin)/admin/products/page.tsx
import { ProductService } from "@/services/product.service";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil, Package2, AlertTriangle } from "lucide-react";
import AdminProductActions from "@/components/admin/AdminProductActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "จัดการสินค้า | Admin" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page   = parseInt(searchParams.page ?? "1");
  const search = searchParams.search;
  const result = await ProductService.findMany({ page, perPage: 20, search });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">สินค้าทั้งหมด</h1>
          <p className="text-text-muted text-sm mt-0.5">{result.total} รายการ</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="w-4 h-4" /> เพิ่มสินค้า
        </Link>
      </div>

      {/* Search */}
      <div>
        <form method="GET">
          <input name="search" defaultValue={search} className="input max-w-sm"
            placeholder="ค้นหาชื่อสินค้า, SKU..." />
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary">
              <tr>
                {["สินค้า", "หมวดหมู่", "ราคา", "สต็อก", "สถานะ", ""].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.items.map((product) => (
                <tr key={product.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-secondary overflow-hidden shrink-0">
                        {product.images[0]
                          ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          : <Package2 className="w-5 h-5 text-gray-400 m-auto mt-2.5" />}
                      </div>
                      <div>
                        <p className="font-medium text-dark max-w-[200px] truncate">{product.name}</p>
                        {product.sku && <p className="text-xs text-text-muted">SKU: {product.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{product.category.name}</td>
                  <td className="py-3 px-4 font-semibold">{formatPrice(Number(product.price))}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {product.stock === 0
                        ? <span className="badge-danger">หมด</span>
                        : product.stock <= 5
                        ? <span className="badge-warning flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {product.stock}
                          </span>
                        : <span className="badge-success">{product.stock}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={product.isActive ? "badge-success" : "badge-gray"}>
                      {product.isActive ? "เผยแพร่" : "ซ่อน"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/products/${product.id}`}
                        className="btn-secondary btn-sm btn-icon">
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <AdminProductActions productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result.items.length === 0 && (
          <div className="text-center py-16">
            <Package2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">ไม่พบสินค้า</p>
          </div>
        )}
      </div>
    </div>
  );
}
