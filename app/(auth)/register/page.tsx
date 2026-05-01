// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import { signIn } from "next-auth/react";
import { Package, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import type { z } from "zod";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");
  const rules = [
    { ok: password.length >= 8,    label: "อย่างน้อย 8 ตัวอักษร" },
    { ok: /[A-Z]/.test(password),  label: "มีตัวพิมพ์ใหญ่" },
    { ok: /[0-9]/.test(password),  label: "มีตัวเลข" },
  ];

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();

      if (!json.success) { toast.error(json.error); return; }

      // Auto sign in
      await signIn("credentials", {
        email:    data.email,
        password: data.password,
        redirect: false,
      });
      toast.success("สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ 🎉");
      router.push("/");
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-dark">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            Shop<span className="text-gradient">Next</span>
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-display font-bold text-dark mb-1">สมัครสมาชิก</h1>
          <p className="text-text-muted text-sm mb-6">เริ่มช้อปปิ้งกับเราได้เลย!</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">ชื่อ-นามสกุล</label>
              <input {...register("name")} className={`input ${errors.name ? "input-error" : ""}`}
                placeholder="สมชาย ใจดี" autoComplete="name" />
              {errors.name && <p className="error-msg">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">อีเมล</label>
              <input {...register("email")} type="email" className={`input ${errors.email ? "input-error" : ""}`}
                placeholder="your@email.com" autoComplete="email" />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">รหัสผ่าน</label>
              <div className="relative">
                <input {...register("password")} type={showPwd ? "text" : "password"}
                  className={`input pr-10 ${errors.password ? "input-error" : ""}`}
                  placeholder="••••••••" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {password && (
                <div className="mt-2 space-y-1">
                  {rules.map((r) => (
                    <div key={r.label} className={`flex items-center gap-1.5 text-xs ${r.ok ? "text-green-600" : "text-gray-400"}`}>
                      <CheckCircle className={`w-3.5 h-3.5 ${r.ok ? "fill-green-100" : ""}`} />
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">ยืนยันรหัสผ่าน</label>
              <input {...register("confirmPassword")} type="password"
                className={`input ${errors.confirmPassword ? "input-error" : ""}`}
                placeholder="••••••••" autoComplete="new-password" />
              {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg justify-center mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "สมัครสมาชิก"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-5">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
