// components/admin/AdminCategoryActions.tsx
"use client";

import { Trash2, Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminCategoryActions({ categoryId }: { categoryId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("ยืนยันการลบหมวดหมู่นี้? สินค้าในหมวดหมู่จะยังคงอยู่")) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("ลบหมวดหมู่สำเร็จ");
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
    <div className="flex items-center gap-1.5">
      <Link 
        href={`/admin/categories/${categoryId}`}
        className="btn-secondary btn-sm btn-icon"
      >
        <Pencil className="w-3.5 h-3.5" />
      </Link>
      <button onClick={handleDelete} disabled={loading} className="btn-danger btn-sm btn-icon">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
