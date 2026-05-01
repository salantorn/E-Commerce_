// app/(admin)/admin/orders/[id]/page.tsx
import { OrderService } from "@/services/order.service";
import { notFound } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui";
import AdminOrderStatusForm from "@/components/admin/AdminOrderStatusForm";
import Image from "next/image";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await OrderService.findById(params.id);
  if (!order) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">คำสั่งซื้อ: {order.orderNumber}</h1>
          <p className="text-text-muted text-sm mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer info */}
        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-3">ข้อมูลลูกค้า</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">ชื่อ</span>
              <span className="font-medium">{order.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">อีเมล</span>
              <span className="font-medium">{order.user?.email}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        {order.address && (
          <div className="card p-5">
            <h2 className="font-semibold text-dark mb-3">ที่อยู่จัดส่ง</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-dark">{order.address.name}</p>
              <p>{order.address.phone}</p>
              <p>{order.address.line1} {order.address.line2}</p>
              <p>{order.address.city} {order.address.state} {order.address.postalCode}</p>
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="card p-5">
        <h2 className="font-semibold text-dark mb-4">รายการสินค้า</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
              {item.productImage && (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-surface-secondary shrink-0">
                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="56px" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-dark">{item.productName}</p>
                {item.variantName && <p className="text-xs text-text-muted">{item.variantName}</p>}
                <p className="text-sm text-gray-600">x{item.quantity} × {formatPrice(Number(item.price))}</p>
              </div>
              <p className="font-semibold">{formatPrice(Number(item.total))}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600"><span>ยอดสินค้า</span><span>{formatPrice(Number(order.subtotal))}</span></div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-green-600"><span>ส่วนลด</span><span>-{formatPrice(Number(order.discount))}</span></div>
          )}
          <div className="flex justify-between text-gray-600"><span>ค่าจัดส่ง</span><span>{formatPrice(Number(order.shipping))}</span></div>
          <div className="flex justify-between text-gray-600"><span>ภาษี</span><span>{formatPrice(Number(order.tax))}</span></div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
            <span>รวมทั้งหมด</span><span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Update status */}
      <AdminOrderStatusForm order={order} />
    </div>
  );
}
