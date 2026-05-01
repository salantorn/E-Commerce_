// components/products/AddToCartSection.tsx
"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { getProductPrimaryImage } from "@/lib/utils";
import toast from "react-hot-toast";
import type { ProductWithDetails } from "@/types";
import { cn } from "@/lib/utils";

export default function AddToCartSection({ product }: { product: ProductWithDetails }) {
  const [qty,         setQty]         = useState(1);
  const [wishlisted,  setWishlisted]  = useState(false);
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const isOutOfStock = product.stock === 0;
  const maxQty       = Math.min(product.stock, 10);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      id:        product.id,
      productId: product.id,
      name:      product.name,
      slug:      product.slug,
      image:     getProductPrimaryImage(product.images),
      price:     Number(product.price),
      quantity:  qty,
      stock:     product.stock,
    });
    openCart();
    toast.success(`เพิ่ม ${product.name} ในตะกร้าแล้ว`);
  };

  const handleWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId: product.id }),
      });
      const json = await res.json();
      setWishlisted(json.inWishlist);
      toast.success(json.message);
    } catch {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-dark">จำนวน</label>
        <div className="flex items-center border border-border rounded-xl overflow-hidden">
          <button onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-surface-secondary transition-colors disabled:opacity-40"
            disabled={qty <= 1}>
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-semibold border-x border-border py-2">{qty}</span>
          <button onClick={() => setQty(Math.min(maxQty, qty + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-surface-secondary transition-colors disabled:opacity-40"
            disabled={qty >= maxQty || isOutOfStock}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Variant selector (if has variants) */}
      {product.variants.length > 0 && (
        <div>
          <label className="text-sm font-medium text-dark block mb-2">ตัวเลือก</label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button key={v.id}
                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors">
                {v.value}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn("btn btn-lg flex-1",
            isOutOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "btn-primary"
          )}>
          <ShoppingCart className="w-5 h-5" />
          {isOutOfStock ? "สินค้าหมด" : "หยิบใส่ตะกร้า"}
        </button>
        <button
          onClick={handleWishlist}
          className={cn("btn btn-secondary btn-lg",
            wishlisted && "text-red-500 border-red-200 bg-red-50")}>
          <Heart className={cn("w-5 h-5", wishlisted && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
