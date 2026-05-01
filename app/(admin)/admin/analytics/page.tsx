// app/(admin)/admin/analytics/page.tsx
import { AnalyticsService } from "@/services/analytics.service";
import { formatPrice } from "@/lib/utils";
import RevenueChart from "@/components/admin/RevenueChart";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "รายงานและวิเคราะห์ | Admin" };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const [stats, chart7, chart30, topProducts] = await Promise.all([
    AnalyticsService.getDashboardStats(),
    AnalyticsService.getRevenueChart(7),
    AnalyticsService.getRevenueChart(30),
    AnalyticsService.getTopProducts(10),
  ]);

  const weekRevenue  = chart7.reduce((s, d) => s + d.revenue, 0);
  const monthRevenue = chart30.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">รายงานและวิเคราะห์</h1>
        <p className="text-text-muted text-sm">ภาพรวมยอดขายและประสิทธิภาพ</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "รายได้รวม",          value: formatPrice(stats.revenue.total),     sub: "ตลอดทั้งหมด" },
          { label: "รายได้เดือนนี้",      value: formatPrice(stats.revenue.thisMonth), sub: `เติบโต ${stats.revenue.growth > 0 ? "+" : ""}${stats.revenue.growth}%`, positive: stats.revenue.growth >= 0 },
          { label: "รายได้สัปดาห์นี้",    value: formatPrice(weekRevenue),            sub: "7 วันที่ผ่านมา" },
          { label: "คำสั่งซื้อทั้งหมด",   value: stats.orders.total.toLocaleString(), sub: `รอดำเนินการ ${stats.orders.pending}` },
        ].map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-sm text-text-muted">{card.label}</p>
            <p className="text-2xl font-bold text-dark mt-1">{card.value}</p>
            <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${
              "positive" in card
                ? card.positive ? "text-green-600" : "text-red-500"
                : "text-text-muted"
            }`}>
              {"positive" in card && (card.positive
                ? <TrendingUp className="w-3.5 h-3.5" />
                : <TrendingDown className="w-3.5 h-3.5" />
              )}
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* 30-day chart */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-dark">รายได้ 30 วันที่ผ่านมา</h2>
          <span className="ml-auto text-sm font-bold text-primary-600">
            {formatPrice(monthRevenue)}
          </span>
        </div>
        <RevenueChart data={chart30} />
      </div>

      {/* 7-day chart */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-5 h-5 text-accent" />
          <h2 className="font-semibold text-dark">รายได้ 7 วันที่ผ่านมา</h2>
          <span className="ml-auto text-sm font-bold text-accent-dark">
            {formatPrice(weekRevenue)}
          </span>
        </div>
        <RevenueChart data={chart7} />
      </div>

      {/* Top products table */}
      <div className="card p-6">
        <h2 className="font-semibold text-dark mb-4">สินค้าขายดีสูงสุด (Top 10)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["อันดับ", "สินค้า", "หมวดหมู่", "ราคา", "ขายแล้ว", "รายได้ประมาณ"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-surface-secondary transition-colors">
                  <td className="py-3 px-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-amber-400 text-white" :
                      i === 1 ? "bg-gray-400 text-white" :
                      i === 2 ? "bg-amber-700 text-white" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] && (
                        <img src={p.images[0].url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      )}
                      <span className="font-medium text-dark max-w-[180px] truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-500">{p.category.name}</td>
                  <td className="py-3 px-3 font-medium">{formatPrice(Number(p.price))}</td>
                  <td className="py-3 px-3">
                    <span className="badge-primary">{p.soldCount} ชิ้น</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-primary-700">
                    {formatPrice(Number(p.price) * p.soldCount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
