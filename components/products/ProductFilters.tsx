// components/products/ProductFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductFilters } from "@/types";

const SORT_OPTIONS = [
  { value: "newest",    label: "ใหม่ล่าสุด" },
  { value: "popular",   label: "ขายดีที่สุด" },
  { value: "rating",    label: "คะแนนสูงสุด" },
  { value: "price_asc", label: "ราคา: ต่ำ-สูง" },
  { value: "price_desc",label: "ราคา: สูง-ต่ำ" },
];

interface Props {
  currentFilters: ProductFilters;
}

export default function ProductFilters({ currentFilters }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice?.toString() ?? "");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true, price: true, sort: true, other: true,
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data ?? []));
  }, []);

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const applyPrice = () => {
    const params = new URLSearchParams(window.location.search);
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => {
    setMinPrice(""); setMaxPrice("");
    router.push("/products");
  };

  const toggle = (key: string) =>
    setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const hasFilters = !!(currentFilters.search || currentFilters.categorySlug ||
    currentFilters.minPrice || currentFilters.maxPrice || currentFilters.inStock);

  return (
    <div className="card p-4 space-y-1">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-semibold text-dark">
          <SlidersHorizontal className="w-4 h-4 text-primary-600" />
          ตัวกรอง
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> ล้างทั้งหมด
          </button>
        )}
      </div>

      {/* Sort */}
      <FilterSection title="เรียงตาม" open={openSections.sort} onToggle={() => toggle("sort")}>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.value}
              onClick={() => updateFilter("sortBy", opt.value)}
              className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                currentFilters.sortBy === opt.value
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-gray-600 hover:bg-surface-secondary")}>
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="หมวดหมู่" open={openSections.category} onToggle={() => toggle("category")}>
        <div className="space-y-1">
          <button onClick={() => updateFilter("categorySlug", undefined)}
            className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
              !currentFilters.categorySlug
                ? "bg-primary-50 text-primary-700 font-medium"
                : "text-gray-600 hover:bg-surface-secondary")}>
            ทั้งหมด
          </button>
          {categories.map((cat) => (
            <button key={cat.id}
              onClick={() => updateFilter("categorySlug", cat.slug)}
              className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                currentFilters.categorySlug === cat.slug
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-gray-600 hover:bg-surface-secondary")}>
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="ช่วงราคา" open={openSections.price} onToggle={() => toggle("price")}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label text-xs">ต่ำสุด (฿)</label>
              <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                type="number" placeholder="0" min={0} className="input text-xs py-2" />
            </div>
            <div>
              <label className="label text-xs">สูงสุด (฿)</label>
              <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                type="number" placeholder="∞" min={0} className="input text-xs py-2" />
            </div>
          </div>
          <button onClick={applyPrice} className="btn-primary w-full btn-sm">
            ใช้ตัวกรอง
          </button>
        </div>
      </FilterSection>

      {/* Other */}
      <FilterSection title="อื่นๆ" open={openSections.other} onToggle={() => toggle("other")}>
        <div className="space-y-2">
          {[
            { key: "inStock", label: "มีสินค้าในสต็อก" },
            { key: "isFeatured", label: "สินค้าแนะนำ" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={!!(currentFilters as any)[key]}
                onChange={(e) => updateFilter(key, e.target.checked ? "true" : undefined)}
                className="w-4 h-4 rounded text-primary-600 border-border focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-dark transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title, open, onToggle, children,
}: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-3 pb-1">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between text-sm font-semibold text-dark mb-2 hover:text-primary-600 transition-colors">
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && children}
    </div>
  );
}
