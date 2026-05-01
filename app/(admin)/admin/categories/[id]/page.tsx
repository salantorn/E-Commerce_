// app/(admin)/admin/categories/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, X, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchCategory();
  }, [params.id]);

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/admin/categories/${params.id}`);
      if (!res.ok) throw new Error("ไม่พบหมวดหมู่");
      
      const data = await res.json();
      setFormData({
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        image: data.image || "",
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      });
      if (data.image) setImagePreview(data.image);
    } catch (error: any) {
      toast.error(error.message);
      router.push("/admin/categories");
    } finally {
      setFetching(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
      setImagePreview(data.url);
      toast.success("อัพโหลดรูปภาพสำเร็จ");
    } catch (error) {
      toast.error("อัพโหลดรูปภาพล้มเหลว");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/categories/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "เกิดข้อผิดพลาด");
      }

      toast.success("อัพเดทหมวดหมู่สำเร็จ");
      router.push("/admin/categories");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?")) return;

    try {
      const res = await fetch(`/api/admin/categories/${params.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "เกิดข้อผิดพลาด");
      }

      toast.success("ลบหมวดหมู่สำเร็จ");
      router.push("/admin/categories");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="btn-secondary btn-icon">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark">แก้ไขหมวดหมู่</h1>
            <p className="text-text-muted text-sm">อัพเดทข้อมูลหมวดหมู่สินค้า</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="btn bg-red-50 text-red-600 hover:bg-red-100"
        >
          <Trash2 className="w-4 h-4" />
          ลบหมวดหมู่
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="label">
              ชื่อหมวดหมู่ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="label">Slug (URL)</label>
            <input
              type="text"
              className="input"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">คำอธิบาย</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Image */}
          <div>
            <label className="label">รูปภาพหมวดหมู่</label>
            {imagePreview ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-border">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setFormData({ ...formData, image: "" });
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-surface-secondary transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-text-muted">คลิกเพื่ออัพโหลดรูปภาพ</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {/* Sort Order */}
          <div>
            <label className="label">ลำดับการแสดงผล</label>
            <input
              type="number"
              className="input max-w-xs"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
              min={0}
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-dark cursor-pointer">
              เผยแพร่หมวดหมู่นี้
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="btn-primary"
            >
              <Save className="w-4 h-4" />
              {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
            <Link href="/admin/categories" className="btn-secondary">
              ยกเลิก
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
