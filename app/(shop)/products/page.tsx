// app/(shop)/products/page.tsx
import { Suspense } from "react";
import { ProductService } from "@/services/product.service";
import ProductCard from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/ui";
import { ClientPagination } from "@/components/ui/ClientPagination";
import ProductFilters from "@/components/products/ProductFilters";
import type { ProductFilters as PF } from "@/types";
import { SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "สินค้าทั้งหมด" };

interface Props {
  searchParams: Record<string, string | undefined>;
}

async function ProductsGrid({ filters }: { filters: PF }) {
  const result = await ProductService.findMany(filters);
  return (
    <>
      <p className="text-sm text-text-muted mb-4">
        พบ <strong>{result.total}</strong> รายการ
      </p>
      {result.items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold text-dark">ไม่พบสินค้า</h3>
          <p className="text-text-muted mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
          {result.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      <ClientPagination page={result.page} totalPages={result.totalPages} />
    </>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const filters: PF = {
    search:       searchParams.search,
    categorySlug: searchParams.categorySlug,
    categoryId:   searchParams.categoryId,
    minPrice:     searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice:     searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    inStock:      searchParams.inStock === "true",
    isFeatured:   searchParams.isFeatured === "true",
    sortBy:       (searchParams.sortBy as PF["sortBy"]) ?? "newest",
    page:         searchParams.page ? Number(searchParams.page) : 1,
    perPage:      12,
  };

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-dark">
          {filters.search ? `ผลลัพธ์: "${filters.search}"` : "สินค้าทั้งหมด"}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <ProductFilters currentFilters={filters} />
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <Suspense fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          }>
            <ProductsGrid filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
