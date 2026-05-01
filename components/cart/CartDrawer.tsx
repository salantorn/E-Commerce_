// components/cart/CartDrawer.tsx
"use client";

import { useCartStore } from "@/store/cart-store";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal } = useCartStore();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-[80] h-full w-full max-w-sm bg-white shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-dark">ตะกร้าสินค้า</h2>
            {items.length > 0 && (
              <span className="badge-primary">{items.length} รายการ</span>
            )}
          </div>
          <button onClick={closeCart} className="btn-ghost btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">ตะกร้าสินค้าว่างเปล่า</p>
              <p className="text-sm text-text-muted mt-1">เริ่มช้อปปิ้งกันเลย!</p>
              <Link href="/products" onClick={closeCart}
                className="btn-primary mt-6">
                ดูสินค้า
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`}
                className="flex gap-3 p-3 rounded-xl hover:bg-surface-secondary transition-colors">
                <div className="relative w-18 h-18 shrink-0 rounded-lg overflow-hidden bg-surface-secondary">
                  <Image src={item.image || "/placeholder.png"} alt={item.name}
                    fill className="object-cover" sizes="72px" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`} onClick={closeCart}
                    className="text-sm font-medium text-dark hover:text-primary-600 line-clamp-2 leading-snug">
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="text-xs text-text-muted mt-0.5">{item.variantName}</p>
                  )}
                  <p className="text-sm font-bold text-primary-600 mt-1">
                    {formatPrice(Number(item.price))}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {/* Qty controls */}
                    <div className="flex items-center gap-1 border border-border rounded-lg">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1, item.variantId)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-surface-secondary rounded-l-lg transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1, item.variantId)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 flex items-center justify-center hover:bg-surface-secondary rounded-r-lg transition-colors disabled:opacity-40">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ยอดรวม</span>
              <span className="text-xl font-bold text-dark">{formatPrice(subtotal())}</span>
            </div>
            <p className="text-xs text-text-muted text-center">
              ยังไม่รวมค่าจัดส่งและภาษี
            </p>
            <Link href="/checkout" onClick={closeCart}
              className="btn-primary w-full btn-lg justify-center">
              ชำระเงิน <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/cart" onClick={closeCart}
              className="btn-secondary w-full justify-center text-sm">
              ดูตะกร้าสินค้า
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
