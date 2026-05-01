// hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/cart-store";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function useServerCart() {
  const { data: session } = useSession();

  return useQuery({
    queryKey:  ["cart"],
    queryFn:   async () => {
      const res  = await fetch("/api/cart");
      const json = await res.json();
      return json.data;
    },
    enabled: !!session,
    staleTime: 30_000,
  });
}

export function useAddToCart() {
  const qc      = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);

  return useMutation({
    mutationFn: async (payload: {
      productId: string;
      quantity:  number;
      variantId?: string;
      // local store data
      name: string; slug: string; image: string; price: number; stock: number;
    }) => {
      const { name, slug, image, price, stock, ...apiPayload } = payload;
      const res  = await fetch("/api/cart", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(apiPayload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // Also update local store
      addItem({ id: payload.productId, productId: payload.productId, name, slug, image, price, quantity: payload.quantity, stock });
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("เพิ่มสินค้าในตะกร้าแล้ว");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      const res  = await fetch("/api/cart", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ cartItemId, quantity }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      const res  = await fetch(`/api/cart?itemId=${cartItemId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("ลบสินค้าออกจากตะกร้าแล้ว");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
