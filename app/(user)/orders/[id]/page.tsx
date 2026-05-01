// app/(user)/orders/[id]/page.tsx
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { OrderService } from "@/services/order.service";
import { OrderStatusBadge } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Truck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "รายละเอียดคำสั่งซื้อ" };

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const order = await OrderService.findById(params.id, session.user.id);
  if (!order) notFound();

  const STEPS = [
    { status: "PENDING",    label: "รอชำระ",      icon: "📋" },
    { status: "PAID",       label: "ชำระแล้ว",    icon: "✅" },
    { status: "PROCESSING", label: "กำลังเตรียม", icon: "📦" },
    { status: "SHIPPED",    label: "จัดส่งแล้ว",  icon: "🚚" },
    { status: "DELIVERED",  label: "ได้รับแล้ว",  icon: "🎉" },
  ];
  const cancelledOrRefunded = ["CANCELLED", "REFUNDED"].includes(order.status);
  const stepIndex = STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="container-app py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="btn-ghost btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-dark">{order.orderNumber}</h1>
          <p className="text-text-muted text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Progress tracker */}
      {!cancelledOrRefunded && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
              <div
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
            {STEPS.map((step, i) => (
              <div key={step.status} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                  i <= stepIndex
                    ? "bg-primary-600 shadow-glow"
                    : "bg-gray-200"
                }`}>
                  {step.icon}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  i <= stepIndex ? "text-primary-700" : "text-gray-400"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking number */}
      {order.trackingNumber && (
        <div className="card p-4 mb-6 border-primary-200 bg-primary-50 flex items-center gap-3">
          <Truck className="w-5 h-5 text-primary-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary-800">หมายเลขพัสดุ</p>
            <p className="font-mono font-bold text-primary-700">{order.trackingNumber}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Delivery address */}
        {order.address && (
          <div className="card p-5">
            <h2 className="font-semibold text-dark mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-600" /> ที่อยู่จัดส่ง
            </h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-dark">{order.address.name}</p>
              <p>{order.address.phone}</p>
              <p>{order.address.line1} {order.address.line2}</p>
              <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
            </div>
          </div>
        )}

        {/* Payment */}
        {order.payment && (
          <div className="card p-5">
            <h2 className="font-semibold text-dark mb-3">การชำระเงิน</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">วิธีชำระ</span>
                <span className="font-medium">{order.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">สถานะ</span>
                <span className={`font-medium ${
                  order.payment.status === "COMPLETED" ? "text-green-600" : "text-amber-600"
                }`}>{order.payment.status}</span>
              </div>
              {order.payment.paidAt && (
                <div className="flex justify-between">
                  <span className="text-text-muted">ชำระเมื่อ</span>
                  <span>{formatDate(order.payment.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order items */}
      <div className="card p-5">
        <h2 className="font-semibold text-dark mb-4">รายการสินค้า</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-secondary shrink-0">
                {item.productImage
                  ? <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="56px" />
                  : <Package className="w-6 h-6 text-gray-400 m-auto mt-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark truncate">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-text-muted">{item.variantName}</p>
                )}
                <p className="text-sm text-gray-600">
                  {formatPrice(Number(item.price))} × {item.quantity}
                </p>
              </div>
              <p className="font-bold text-dark shrink-0">{formatPrice(Number(item.total))}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-5 pt-4 border-t border-gray-200 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>ยอดสินค้า</span><span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>ส่วนลด{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>-{formatPrice(Number(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>ค่าจัดส่ง</span>
            <span>{Number(order.shipping) === 0 ? "ฟรี" : formatPrice(Number(order.shipping))}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>ภาษี (7%)</span><span>{formatPrice(Number(order.tax))}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
            <span>รวมทั้งหมด</span>
            <span className="text-primary-700">{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="card p-4 mt-4 bg-amber-50 border-amber-200">
          <p className="text-sm font-semibold text-amber-800">หมายเหตุ</p>
          <p className="text-sm text-amber-700 mt-1">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
