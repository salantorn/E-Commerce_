// components/products/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, getDiscountPercentage, getProductPrimaryImage } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ProductWithDetails } from "@/types";

interface Props {
  product: ProductWithDetails;
  className?: string;
}

export default function ProductCard({ product, className }: Props) {
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const image      = getProductPrimaryImage(product.images);
  const discount   = getDiscountPercentage(Number(product.price), Number(product.comparePrice));
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    setAddingToCart(true);
    try {
      addItem({
        id:        product.id,
        productId: product.id,
        name:      product.name,
        slug:      product.slug,
        image,
        price:     Number(product.price),
        quantity:  1,
        stock:     product.stock,
      });
      openCart();
      toast.success("เพิ่มสินค้าในตะกร้าแล้ว");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    try {
      const res  = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId: product.id }),
      });
      const json = await res.json();
      setIsWishlisted(json.inWishlist);
      toast.success(json.message);
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  return (
    <Link href={`/products/${product.slug}`}
      className={cn("group block", className)}>
      <div className="card-hover overflow-hidden transition-all duration-300 hover:-translate-y-1">
        {/* Image container */}
        <div className="relative aspect-square bg-surface-secondary overflow-hidden">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge bg-red-500 text-white">-{discount}%</span>
            )}
            {isOutOfStock && (
              <span className="badge bg-gray-700 text-white">หมด</span>
            )}
            {product.isFeatured && !isOutOfStock && (
              <span className="badge-primary">แนะนำ</span>
            )}
          </div>

          {/* Wishlist btn */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center",
              "bg-white/90 backdrop-blur-sm shadow transition-all duration-200",
              "opacity-0 group-hover:opacity-100 hover:scale-110",
              isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
            )}
            aria-label="เพิ่มใน Wishlist"
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>

          {/* Quick add */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-2",
            "translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          )}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className={cn(
                "w-full py-2 text-sm font-semibold rounded-xl transition-colors",
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              )}
            >
              <ShoppingCart className="w-4 h-4 inline mr-1.5" />
              {isOutOfStock ? "สินค้าหมด" : "หยิบใส่ตะกร้า"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <p className="text-xs text-text-muted mb-1">{product.category.name}</p>
          <h3 className="text-sm font-semibold text-dark line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-600">
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-bold text-dark">
              {formatPrice(Number(product.price))}
            </span>
            {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
              <span className="text-xs text-text-muted line-through">
                {formatPrice(Number(product.comparePrice))}
              </span>
            )}
          </div>

          {/* Stock warning */}
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-500 mt-1.5 font-medium">
              เหลือเพียง {product.stock} ชิ้น!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
