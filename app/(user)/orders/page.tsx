// app/(user)/orders/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrderService } from "@/services/order.service";
import { OrderStatusBadge } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "คำสั่งซื้อของฉัน" };

export default async function OrdersPage({ searchParams }: { searchParams: { page?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const page   = parseInt(searchParams.page ?? "1");
  const result = await OrderService.findByUser(session.user.id, page, 10);

  return (
    <div className="container-app py-8">
      <h1 className="text-3xl font-display font-bold text-dark mb-6">คำสั่งซื้อของฉัน</h1>

      {result.items.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark">ยังไม่มีคำสั่งซื้อ</h3>
          <p className="text-text-muted mt-1">เริ่มช้อปปิ้งกันเลย!</p>
          <Link href="/products" className="btn-primary mt-6 inline-flex">ดูสินค้า</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {result.items.map((order) => (
            <div key={order.id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-dark">{order.orderNumber}</p>
                  <p className="text-sm text-text-muted">{formatDate(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">{order.items.length} รายการ</p>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-dark">{formatPrice(Number(order.total))}</p>
                  <Link href={`/orders/${order.id}`} className="btn-secondary btn-sm">
                    รายละเอียด <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
