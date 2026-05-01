// components/common/ProfileForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations";
import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, User, Lock, Camera } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { z } from "zod";

type ProfileData  = z.infer<typeof updateProfileSchema>;
type PasswordData = z.infer<typeof changePasswordSchema>;

interface Props {
  user: { id: string; name: string | null; email: string; phone: string | null; image: string | null; createdAt: Date };
}

export default function ProfileForm({ user }: Props) {
  const { update } = useSession();
  const [tab, setTab] = useState<"profile" | "security">("profile");

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name ?? "", phone: user.phone ?? "" },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const updateProfile = async (data: ProfileData) => {
    setLoadingProfile(true);
    try {
      const res  = await fetch("/api/user/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        await update({ name: data.name });
        toast.success("อัปเดตโปรไฟล์สำเร็จ");
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoadingProfile(false);
    }
  };

  const changePassword = async (data: PasswordData) => {
    setLoadingPassword(true);
    try {
      const res  = await fetch("/api/user/password", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
        passwordForm.reset();
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar + info */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 overflow-hidden flex items-center justify-center">
            {user.image
              ? <img src={user.image} alt="" className="w-full h-full object-cover" />
              : <span className="text-3xl font-bold text-primary-700">{user.name?.charAt(0).toUpperCase()}</span>}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white shadow">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <h2 className="font-bold text-dark text-lg">{user.name}</h2>
          <p className="text-text-muted text-sm">{user.email}</p>
          <p className="text-xs text-text-muted mt-1">สมาชิกตั้งแต่ {formatDate(user.createdAt)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-secondary rounded-xl p-1 w-fit">
        {(["profile", "security"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white shadow text-dark" : "text-text-muted hover:text-dark"
            }`}>
            {t === "profile" ? <><User className="w-4 h-4" /> ข้อมูลส่วนตัว</> : <><Lock className="w-4 h-4" /> รหัสผ่าน</>}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <form onSubmit={profileForm.handleSubmit(updateProfile)} className="card p-6 space-y-4">
          <h3 className="font-semibold text-dark">ข้อมูลส่วนตัว</h3>
          <div>
            <label className="label">ชื่อ-นามสกุล</label>
            <input {...profileForm.register("name")} className={`input ${profileForm.formState.errors.name ? "input-error" : ""}`} />
            {profileForm.formState.errors.name && <p className="error-msg">{profileForm.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="label">อีเมล</label>
            <input value={user.email} disabled className="input opacity-60 cursor-not-allowed" />
            <p className="text-xs text-text-muted mt-1">ไม่สามารถเปลี่ยนอีเมลได้</p>
          </div>
          <div>
            <label className="label">เบอร์โทรศัพท์</label>
            <input {...profileForm.register("phone")} className="input" placeholder="0xx-xxx-xxxx" />
            {profileForm.formState.errors.phone && <p className="error-msg">{profileForm.formState.errors.phone.message}</p>}
          </div>
          <button type="submit" disabled={loadingProfile} className="btn-primary">
            {loadingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </form>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <form onSubmit={passwordForm.handleSubmit(changePassword)} className="card p-6 space-y-4">
          <h3 className="font-semibold text-dark">เปลี่ยนรหัสผ่าน</h3>
          {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
            <div key={field}>
              <label className="label">
                {field === "currentPassword" ? "รหัสผ่านปัจจุบัน"
                  : field === "newPassword" ? "รหัสผ่านใหม่"
                  : "ยืนยันรหัสผ่านใหม่"}
              </label>
              <input {...passwordForm.register(field)} type="password"
                className={`input ${passwordForm.formState.errors[field] ? "input-error" : ""}`}
                placeholder="••••••••" />
              {passwordForm.formState.errors[field] && (
                <p className="error-msg">{passwordForm.formState.errors[field]?.message}</p>
              )}
            </div>
          ))}
          <button type="submit" disabled={loadingPassword} className="btn-primary">
            {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "เปลี่ยนรหัสผ่าน"}
          </button>
        </form>
      )}
    </div>
  );
}
