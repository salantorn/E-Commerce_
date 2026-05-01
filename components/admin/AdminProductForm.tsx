// components/admin/AdminProductForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validations";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";
import type { z } from "zod";
import type { Category } from "@prisma/client";

type ProductForm = z.infer<typeof productSchema>;

interface Props {
  categories: Category[];
  initialData?: Partial<ProductForm> & { id?: string; images?: string[] };
}

export default function AdminProductForm({ categories, initialData }: Props) {
  const router  = useRouter();
  const isEdit  = !!initialData?.id;
  const [images,  setImages]  = useState<string[]>(initialData?.images ?? []);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name:        initialData?.name ?? "",
      description: initialData?.description ?? "",
      price:       initialData?.price ?? 0,
      stock:       initialData?.stock ?? 0,
      categoryId:  initialData?.categoryId ?? "",
      isActive:    initialData?.isActive ?? true,
      isFeatured:  initialData?.isFeatured ?? false,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    try {
      const url    = isEdit ? `/api/admin/products/${initialData!.id}` : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...data, images }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(isEdit ? "อัปเดตสินค้าสำเร็จ" : "เพิ่มสินค้าสำเร็จ");
        router.push("/admin/products");
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

  const Field = ({ label, name, error, children }: any) => (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="error-msg">{error.message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Images */}
      <div className="card p-5">
        <h2 className="font-semibold text-dark mb-4 flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-primary-600" /> รูปภาพสินค้า
        </h2>
        <div className="grid grid-cols-4 gap-3 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-secondary border border-border group">
              <img src={img} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 badge bg-primary-600 text-white text-xs">หลัก</span>
              )}
              <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary-400 flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary-600 transition-colors">
            <Upload className="w-5 h-5" />
            <span className="text-xs">อัปโหลด</span>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={handleImageUpload} />
        <p className="text-xs text-text-muted">รองรับ JPG, PNG, WEBP · รูปแรกจะเป็นรูปหลัก</p>
      </div>

      {/* Basic info */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-dark">ข้อมูลพื้นฐาน</h2>
        <Field label="ชื่อสินค้า *" error={errors.name}>
          <input {...register("name")} className={`input ${errors.name ? "input-error" : ""}`}
            placeholder="ชื่อสินค้า..." />
        </Field>
        <Field label="คำอธิบาย *" error={errors.description}>
          <textarea {...register("description")} rows={5}
            className={`input resize-none ${errors.description ? "input-error" : ""}`}
            placeholder="อธิบายรายละเอียดสินค้า..." />
        </Field>
        <Field label="หมวดหมู่ *" error={errors.categoryId}>
          <select {...register("categoryId")} className={`input ${errors.categoryId ? "input-error" : ""}`}>
            <option value="">-- เลือกหมวดหมู่ --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Pricing */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-dark">ราคาและสต็อก</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="ราคาขาย (฿) *" error={errors.price}>
            <input {...register("price", { valueAsNumber: true })} type="number" min={0} step={0.01}
              className={`input ${errors.price ? "input-error" : ""}`} placeholder="0.00" />
          </Field>
          <Field label="ราคาเต็ม (฿)" error={errors.comparePrice}>
            <input {...register("comparePrice", { valueAsNumber: true })} type="number" min={0} step={0.01}
              className="input" placeholder="0.00 (ไม่บังคับ)" />
          </Field>
          <Field label="ต้นทุน (฿)" error={errors.costPrice}>
            <input {...register("costPrice", { valueAsNumber: true })} type="number" min={0} step={0.01}
              className="input" placeholder="0.00 (ไม่บังคับ)" />
          </Field>
          <Field label="จำนวนสต็อก *" error={errors.stock}>
            <input {...register("stock", { valueAsNumber: true })} type="number" min={0}
              className={`input ${errors.stock ? "input-error" : ""}`} placeholder="0" />
          </Field>
          <Field label="SKU" error={errors.sku}>
            <input {...register("sku")} className="input" placeholder="SKU-001" />
          </Field>
          <Field label="น้ำหนัก (กก.)" error={errors.weight}>
            <input {...register("weight", { valueAsNumber: true })} type="number" min={0} step={0.1}
              className="input" placeholder="0.5" />
          </Field>
        </div>
      </div>

      {/* Settings */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-dark">การตั้งค่า</h2>
        {[
          { name: "isActive",   label: "เผยแพร่สินค้า",  desc: "แสดงสินค้าในหน้าร้าน" },
          { name: "isFeatured", label: "สินค้าแนะนำ",    desc: "แสดงในหน้าแรก" },
        ].map((f) => (
          <label key={f.name} className="flex items-start gap-3 cursor-pointer group">
            <input {...register(f.name as any)} type="checkbox"
              className="mt-0.5 w-4 h-4 rounded text-primary-600 border-border focus:ring-primary-500" />
            <div>
              <p className="text-sm font-medium text-dark">{f.label}</p>
              <p className="text-xs text-text-muted">{f.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary btn-lg">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
            : isEdit ? "อัปเดตสินค้า" : "เพิ่มสินค้า"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary btn-lg">
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
