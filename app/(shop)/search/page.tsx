// app/(shop)/search/page.tsx
import { Suspense } from "react";
import { ProductService } from "@/services/product.service";
import ProductCard from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/ui";
import { Search } from "lucide-react";
import type { Metadata } from "next";

interface Props { searchParams: { q?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return { title: searchParams.q ? `ค้นหา: "${searchParams.q}"` : "ค้นหาสินค้า" };
}

async function SearchResults({ query }: { query: string }) {
  const result = await ProductService.findMany({ search: query, perPage: 24 });

  return (
    <>
      <p className="text-text-muted text-sm mb-6">
        พบ <strong>{result.total}</strong> รายการ สำหรับ &quot;<strong>{query}</strong>&quot;
      </p>
      {result.items.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark">ไม่พบสินค้าที่ตรงกัน</h3>
          <p className="text-text-muted mt-1">ลองค้นหาด้วยคำอื่น</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {result.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() ?? "";

  return (
    <div className="container-app py-8">
      <h1 className="text-3xl font-display font-bold text-dark mb-6">
        {query ? `ผลการค้นหา` : "ค้นหาสินค้า"}
      </h1>

      {!query ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-text-muted">กรอกคำค้นหาในแถบด้านบน</p>
        </div>
      ) : (
        <Suspense fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        }>
          <SearchResults query={query} />
        </Suspense>
      )}
    </div>
  );
}
