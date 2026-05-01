// components/admin/AdminOrderStatusForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import type { OrderWithDetails } from "@/types";

const STATUS_OPTIONS = [
  { value: "PENDING",    label: "รอดำเนินการ" },
  { value: "PAID",       label: "ชำระแล้ว" },
  { value: "PROCESSING", label: "กำลังเตรียม" },
  { value: "SHIPPED",    label: "จัดส่งแล้ว" },
  { value: "DELIVERED",  label: "ได้รับแล้ว" },
  { value: "CANCELLED",  label: "ยกเลิก" },
  { value: "REFUNDED",   label: "คืนเงินแล้ว" },
];

export default function AdminOrderStatusForm({ order }: { order: OrderWithDetails }) {
  const router  = useRouter();
  const [status,  setStatus]  = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [loading, setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/orders/${order.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status, trackingNumber: tracking || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("อัปเดตสถานะสำเร็จ");
        router.refresh();
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-dark mb-4">อัปเดตสถานะ</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">สถานะคำสั่งซื้อ</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}
              className="input">
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">เลขพัสดุ (ถ้ามี)</label>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)}
              className="input" placeholder="TH123456789" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
            : <><Save className="w-4 h-4" /> บันทึก</>}
        </button>
      </form>
    </div>
  );
}
