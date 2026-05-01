// app/(admin)/admin/orders/page.tsx
import { OrderService } from "@/services/order.service";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "จัดการคำสั่งซื้อ | Admin" };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STATUS_OPTIONS = [
  { value: "",           label: "ทั้งหมด"      },
  { value: "PENDING",    label: "รอดำเนินการ"  },
  { value: "PAID",       label: "ชำระแล้ว"     },
  { value: "PROCESSING", label: "กำลังเตรียม"  },
  { value: "SHIPPED",    label: "จัดส่งแล้ว"   },
  { value: "DELIVERED",  label: "ได้รับแล้ว"   },
  { value: "CANCELLED",  label: "ยกเลิก"       },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; search?: string };
}) {
  const result = await OrderService.adminFindMany({
    page:    parseInt(searchParams.page ?? "1"),
    perPage: 20,
    status:  (searchParams.status as any) || undefined,
    search:  searchParams.search || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">คำสั่งซื้อทั้งหมด</h1>
        <p className="text-text-muted text-sm mt-0.5">{result.total} รายการ</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" className="flex gap-2 flex-1">
          <input name="search" defaultValue={searchParams.search} className="input max-w-xs"
            placeholder="ค้นหาเลขที่คำสั่งซื้อ, ชื่อ..." />
          <input type="hidden" name="status" value={searchParams.status ?? ""} />
        </form>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <Link key={opt.value}
              href={`/admin/orders?status=${opt.value}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
              className={`badge cursor-pointer transition-colors ${
                (searchParams.status ?? "") === opt.value
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary">
              <tr>
                {["เลขที่", "ลูกค้า", "วันที่", "รายการ", "ยอดรวม", "สถานะ", ""].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.items.map((order) => (
                <tr key={order.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-primary-600 font-semibold">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-dark">{order.user?.name ?? "-"}</p>
                    <p className="text-xs text-text-muted">{order.user?.email}</p>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-xs">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-4 text-gray-600">{order.items.length} รายการ</td>
                  <td className="py-3 px-4 font-semibold">{formatPrice(Number(order.total))}</td>
                  <td className="py-3 px-4"><OrderStatusBadge status={order.status} /></td>
                  <td className="py-3 px-4">
                    <Link href={`/admin/orders/${order.id}`}
                      className="btn-secondary btn-sm">รายละเอียด</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result.items.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">ไม่พบคำสั่งซื้อ</p>
          </div>
        )}
      </div>
    </div>
  );
}
