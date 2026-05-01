// app/(admin)/admin/categories/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
    sortOrder: 0,
  });

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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "เกิดข้อผิดพลาด");
      }

      toast.success("เพิ่มหมวดหมู่สำเร็จ");
      router.push("/admin/categories");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="btn-secondary btn-icon">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark">เพิ่มหมวดหมู่ใหม่</h1>
          <p className="text-text-muted text-sm">สร้างหมวดหมู่สินค้าใหม่</p>
        </div>
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
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="เช่น อิเล็กทรอนิกส์"
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
              placeholder="electronics"
            />
            <p className="text-xs text-text-muted mt-1">
              จะถูกสร้างอัตโนมัติจากชื่อหมวดหมู่
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="label">คำอธิบาย</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="คำอธิบายสั้นๆ เกี่ยวกับหมวดหมู่นี้"
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
            <p className="text-xs text-text-muted mt-1">
              ตัวเลขน้อยจะแสดงก่อน
            </p>
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
              {loading ? "กำลังบันทึก..." : "บันทึก"}
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
