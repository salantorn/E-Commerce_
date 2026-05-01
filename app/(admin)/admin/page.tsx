// app/(admin)/admin/page.tsx
import { AnalyticsService } from "@/services/analytics.service";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui";
import RevenueChart from "@/components/admin/RevenueChart";
import { TrendingUp, TrendingDown, ShoppingBag, Users, Package, DollarSign, AlertTriangle, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const [stats, chartData, topProducts, recentOrders] = await Promise.all([
    AnalyticsService.getDashboardStats(),
    AnalyticsService.getRevenueChart(30),
    AnalyticsService.getTopProducts(5),
    AnalyticsService.getRecentOrders(5),
  ]);

  const statCards = [
    {
      label: "รายได้รวม",
      value: formatPrice(stats.revenue.total),
      sub:   `เดือนนี้ ${formatPrice(stats.revenue.thisMonth)}`,
      icon:  DollarSign,
      color: "text-green-600",
      bg:    "bg-green-50",
      trend: stats.revenue.growth,
    },
    {
      label: "คำสั่งซื้อทั้งหมด",
      value: stats.orders.total.toLocaleString(),
      sub:   `รอดำเนินการ ${stats.orders.pending}`,
      icon:  ShoppingBag,
      color: "text-blue-600",
      bg:    "bg-blue-50",
    },
    {
      label: "ลูกค้าทั้งหมด",
      value: stats.customers.total.toLocaleString(),
      sub:   `ใหม่เดือนนี้ ${stats.customers.newThisMonth}`,
      icon:  Users,
      color: "text-purple-600",
      bg:    "bg-purple-50",
    },
    {
      label: "สินค้าทั้งหมด",
      value: stats.products.total.toLocaleString(),
      sub:   `สต็อกต่ำ ${stats.products.lowStock} | หมด ${stats.products.outOfStock}`,
      icon:  Package,
      color: "text-orange-600",
      bg:    "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark">แดชบอร์ด</h1>
        <p className="text-text-muted text-sm mt-0.5">ภาพรวมธุรกิจ ณ วันนี้</p>
      </div>

      {/* Alerts */}
      {(stats.products.lowStock > 0 || stats.products.outOfStock > 0) && (
        <div className="card border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">แจ้งเตือนสต็อก</p>
            <p className="text-amber-700 text-xs mt-0.5">
              สินค้าสต็อกต่ำ {stats.products.lowStock} รายการ · สินค้าหมด {stats.products.outOfStock} รายการ
              {" "}
              <Link href="/admin/products?filter=low_stock" className="underline">จัดการ →</Link>
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                {"trend" in card && card.trend !== undefined && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${card.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {card.trend >= 0
                      ? <TrendingUp className="w-3.5 h-3.5" />
                      : <TrendingDown className="w-3.5 h-3.5" />}
                    {Math.abs(card.trend)}%
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-dark">{card.value}</p>
              <p className="text-xs text-text-muted mt-1">{card.sub}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart + Top Products */}
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark">รายได้ 30 วันที่ผ่านมา</h2>
          </div>
          <RevenueChart data={chartData} />
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-4">สินค้าขายดี</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-text-muted w-5 shrink-0">{i + 1}</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-secondary shrink-0">
                  {p.images[0] && (
                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark truncate">{p.name}</p>
                  <p className="text-xs text-text-muted">ขายแล้ว {p.soldCount} ชิ้น</p>
                </div>
                <p className="text-sm font-semibold text-dark shrink-0">{formatPrice(Number(p.price))}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-dark">คำสั่งซื้อล่าสุด</h2>
          <Link href="/admin/orders" className="text-sm text-primary-600 hover:underline">ดูทั้งหมด →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["เลขที่", "ลูกค้า", "วันที่", "ยอดรวม", "สถานะ"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-surface-secondary transition-colors">
                  <td className="py-3 px-3 font-mono text-xs text-primary-600">
                    <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                  </td>
                  <td className="py-3 px-3">{(order as any).user?.name ?? "-"}</td>
                  <td className="py-3 px-3 text-text-muted text-xs">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-3 font-semibold">{formatPrice(Number(order.total))}</td>
                  <td className="py-3 px-3"><OrderStatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
