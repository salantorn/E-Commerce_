// app/(admin)/admin/customers/page.tsx
import prisma from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "จัดการลูกค้า | Admin" };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page    = parseInt(searchParams.page ?? "1");
  const perPage = 20;
  const search  = searchParams.search;

  const where: any = { role: "USER" };
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * perPage,
      take:    perPage,
      include: {
        _count:  { select: { orders: true } },
        orders:  {
          where:   { status: { in: ["PAID","PROCESSING","SHIPPED","DELIVERED"] } },
          select:  { total: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">ลูกค้าทั้งหมด</h1>
          <p className="text-text-muted text-sm">{total} คน</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET">
        <input name="search" defaultValue={search}
          className="input max-w-sm" placeholder="ค้นหาชื่อ, อีเมล..." />
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary">
              <tr>
                {["ลูกค้า", "อีเมล", "สมัครเมื่อ", "คำสั่งซื้อ", "ยอดรวม"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce(
                  (sum, o) => sum + Number(o.total), 0
                );
                return (
                  <tr key={customer.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                          {customer.image
                            ? <img src={customer.image} alt="" className="w-full h-full rounded-full object-cover" />
                            : <span className="text-primary-700 font-bold text-sm">
                                {customer.name?.charAt(0).toUpperCase() ?? "?"}
                              </span>}
                        </div>
                        <span className="font-medium text-dark">{customer.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{customer.email}</td>
                    <td className="py-3 px-4 text-text-muted text-xs">{formatDate(customer.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span className="badge-primary">{customer._count.orders}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {totalSpent > 0 ? formatPrice(totalSpent) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">ไม่พบลูกค้า</p>
          </div>
        )}
      </div>
    </div>
  );
}
