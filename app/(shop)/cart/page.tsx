// app/(shop)/cart/page.tsx
"use client";

import { useCartStore } from "@/store/cart-store";
import { formatPrice, calculateOrderSummary } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCartStore();
  const summary = calculateOrderSummary({ subtotal: subtotal() });

  if (items.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-dark">ตะกร้าสินค้าว่าง</h2>
        <p className="text-text-muted mt-2">เพิ่มสินค้าเพื่อเริ่มช้อปปิ้ง</p>
        <Link href="/products" className="btn-primary mt-6 inline-flex btn-lg">
          ดูสินค้าทั้งหมด <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="text-3xl font-display font-bold text-dark mb-8">
        ตะกร้าสินค้า <span className="text-text-muted font-normal text-lg">({items.length} รายการ)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`}
              className="card p-4 flex gap-4 items-start">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-secondary shrink-0">
                <Image src={item.image || "/placeholder.png"} alt={item.name}
                  fill className="object-cover" sizes="96px" />
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`}
                  className="font-semibold text-dark hover:text-primary-600 line-clamp-2 transition-colors">
                  {item.name}
                </Link>
                {item.variantName && (
                  <p className="text-sm text-text-muted mt-0.5">{item.variantName}</p>
                )}
                <p className="text-primary-600 font-bold mt-1">{formatPrice(Number(item.price))}</p>

                <div className="flex items-center justify-between mt-3">
                  {/* Qty */}
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1, item.variantId)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-surface-secondary transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold border-x border-border">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1, item.variantId)}
                      disabled={item.quantity >= item.stock}
                      className="w-9 h-9 flex items-center justify-center hover:bg-surface-secondary transition-colors disabled:opacity-40">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-dark">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button onClick={() => removeItem(item.productId, item.variantId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link href="/products" className="btn-secondary inline-flex">
            ← ช้อปปิ้งต่อ
          </Link>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5 space-y-3 sticky top-24">
            <h2 className="font-semibold text-dark text-lg">สรุปคำสั่งซื้อ</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>ยอดสินค้า ({items.length} รายการ)</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ค่าจัดส่ง</span>
                <span className={summary.shipping === 0 ? "text-green-600 font-medium" : ""}>
                  {summary.shipping === 0 ? "ฟรี!" : formatPrice(summary.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ภาษี (7%)</span>
                <span>{formatPrice(summary.tax)}</span>
              </div>
            </div>

            {summary.shipping > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                🚚 สั่งซื้อเพิ่มอีก <strong>{formatPrice(500 - summary.subtotal)}</strong> เพื่อรับจัดส่งฟรี!
              </div>
            )}

            <div className="flex justify-between font-bold text-xl pt-2 border-t border-border">
              <span>รวมทั้งหมด</span>
              <span className="text-primary-700">{formatPrice(summary.total)}</span>
            </div>

            <Link href="/checkout"
              className="btn-primary w-full btn-lg justify-center shadow-glow">
              ดำเนินการชำระเงิน <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-xs text-text-muted text-center">
              🔒 ชำระผ่าน Stripe — ปลอดภัย 100%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
