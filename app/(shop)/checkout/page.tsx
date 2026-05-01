// app/(shop)/checkout/page.tsx
"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema } from "@/lib/validations";
import { formatPrice, calculateOrderSummary } from "@/lib/utils";
import Image from "next/image";
import toast from "react-hot-toast";
import { ArrowRight, Tag, Loader2, MapPin, Package } from "lucide-react";
import type { z } from "zod";

type AddressForm = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router    = useRouter();
  const items     = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [couponCode,   setCouponCode]   = useState("");
  const [coupon,       setCoupon]       = useState<any>(null);
  const [couponError,  setCouponError]  = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [notes,        setNotes]        = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "TH" },
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const summary  = calculateOrderSummary({ subtotal, coupon });

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res  = await fetch("/api/coupons/validate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: couponCode, subtotal }),
      });
      const json = await res.json();
      if (json.success) {
        setCoupon(json.data.coupon);
        toast.success(`ใช้โค้ด "${couponCode}" สำเร็จ!`);
      } else {
        setCouponError(json.error);
      }
    } catch {
      setCouponError("เกิดข้อผิดพลาด");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const onSubmit = async (address: AddressForm) => {
    if (!session) { router.push("/login"); return; }
    if (items.length === 0) { toast.error("ตะกร้าสินค้าว่างเปล่า"); return; }

    setSubmitting(true);
    try {
      const res  = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          address,
          saveAddress:  true,
          couponCode:   coupon?.code,
          notes,
        }),
      });
      const json = await res.json();

      if (json.success) {
        clearCart();
        window.location.href = json.data.checkoutUrl;
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <Package className="w-20 h-20 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-dark">ตะกร้าว่างเปล่า</h2>
        <p className="text-text-muted mt-2">กรุณาเพิ่มสินค้าก่อนชำระเงิน</p>
        <a href="/products" className="btn-primary mt-6 inline-flex">ดูสินค้า</a>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="text-3xl font-display font-bold text-dark mb-8">ชำระเงิน</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left – Address */}
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold text-dark text-lg mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" /> ที่อยู่จัดส่ง
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">ชื่อ-นามสกุล *</label>
                  <input {...register("name")} className={`input ${errors.name ? "input-error" : ""}`} placeholder="กรอกชื่อ-นามสกุล" />
                  {errors.name && <p className="error-msg">{errors.name.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="label">เบอร์โทรศัพท์ *</label>
                  <input {...register("phone")} className={`input ${errors.phone ? "input-error" : ""}`} placeholder="0xx-xxx-xxxx" />
                  {errors.phone && <p className="error-msg">{errors.phone.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="label">ที่อยู่ *</label>
                  <input {...register("line1")} className={`input ${errors.line1 ? "input-error" : ""}`} placeholder="บ้านเลขที่ ซอย ถนน" />
                  {errors.line1 && <p className="error-msg">{errors.line1.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="label">ที่อยู่เพิ่มเติม</label>
                  <input {...register("line2")} className="input" placeholder="ชั้น อาคาร หมู่บ้าน (ถ้ามี)" />
                </div>
                <div>
                  <label className="label">เมือง/เขต *</label>
                  <input {...register("city")} className={`input ${errors.city ? "input-error" : ""}`} placeholder="เมือง" />
                  {errors.city && <p className="error-msg">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="label">จังหวัด *</label>
                  <input {...register("state")} className={`input ${errors.state ? "input-error" : ""}`} placeholder="จังหวัด" />
                  {errors.state && <p className="error-msg">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="label">รหัสไปรษณีย์ *</label>
                  <input {...register("postalCode")} className={`input ${errors.postalCode ? "input-error" : ""}`} placeholder="10000" maxLength={5} />
                  {errors.postalCode && <p className="error-msg">{errors.postalCode.message}</p>}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card p-6">
              <h2 className="font-semibold text-dark mb-3">หมายเหตุ (ถ้ามี)</h2>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3} className="input resize-none" placeholder="ข้อความถึงผู้ขาย..." />
            </div>
          </div>

          {/* Right – Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Items */}
            <div className="card p-5">
              <h2 className="font-semibold text-dark mb-4">รายการสินค้า ({items.length})</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-secondary">
                      <Image src={item.image || "/placeholder.png"} alt={item.name}
                        fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark line-clamp-1">{item.name}</p>
                      <p className="text-xs text-text-muted">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-dark shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="card p-5">
              <h2 className="font-semibold text-dark mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary-600" /> โค้ดส่วนลด
              </h2>
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                  <span className="text-sm font-semibold text-green-700">{coupon.code}</span>
                  <button type="button" onClick={() => { setCoupon(null); setCouponCode(""); }}
                    className="text-xs text-red-500 hover:underline">ลบ</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="input" placeholder="COUPONCODE" />
                  <button type="button" onClick={handleCoupon} disabled={validatingCoupon}
                    className="btn-secondary btn-sm shrink-0 px-4">
                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "ใช้"}
                  </button>
                </div>
              )}
              {couponError && <p className="error-msg mt-1">{couponError}</p>}
            </div>

            {/* Summary */}
            <div className="card p-5 space-y-3">
              <h2 className="font-semibold text-dark mb-1">สรุปคำสั่งซื้อ</h2>
              {[
                { label: "ยอดสินค้า",  value: summary.subtotal  },
                { label: "ส่วนลด",     value: -summary.discount, hide: summary.discount === 0 },
                { label: "ค่าจัดส่ง",  value: summary.shipping  },
                { label: "ภาษี (7%)",  value: summary.tax       },
              ].filter((r) => !r.hide).map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{row.label}</span>
                  <span className={row.value < 0 ? "text-green-600 font-medium" : "text-dark"}>
                    {row.value < 0 ? `-${formatPrice(-row.value)}` : formatPrice(row.value)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                <span>รวมทั้งหมด</span>
                <span className="text-primary-700">{formatPrice(summary.total)}</span>
              </div>
              {summary.shipping === 0 && (
                <p className="text-xs text-green-600 text-center font-medium">🎉 ได้รับค่าจัดส่งฟรี!</p>
              )}
            </div>

            <button type="submit" disabled={submitting}
              className="btn-primary w-full btn-lg justify-center shadow-glow">
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังดำเนินการ...</>
                : <>ชำระเงิน {formatPrice(summary.total)} <ArrowRight className="w-4 h-4" /></>
              }
            </button>
            <p className="text-xs text-text-muted text-center">🔒 ชำระเงินผ่าน Stripe — ปลอดภัย 100%</p>
          </div>
        </div>
      </form>
    </div>
  );
}
