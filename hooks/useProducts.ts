// hooks/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import type { ProductFilters, PaginatedResponse, ProductWithDetails } from "@/types";

export function useProducts(filters: ProductFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });

  return useQuery<PaginatedResponse<ProductWithDetails>>({
    queryKey:  ["products", filters],
    queryFn:   async () => {
      const res  = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: string) {
  return useQuery<ProductWithDetails>({
    queryKey: ["product", id],
    queryFn:  async () => {
      const res  = await fetch(`/api/products/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 5 * 60_000,
    enabled:   !!id,
  });
}

export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn:  async () => {
      const res  = await fetch("/api/wishlist");
      const json = await res.json();
      return json.data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useOrders(page = 1) {
  return useQuery({
    queryKey: ["orders", page],
    queryFn:  async () => {
      const res  = await fetch(`/api/orders?page=${page}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 30_000,
  });
}
