// app/(user)/profile/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileForm from "@/components/common/ProfileForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "โปรไฟล์ของฉัน" };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true, role: true, createdAt: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="container-app py-8 max-w-2xl">
      <h1 className="text-3xl font-display font-bold text-dark mb-6">โปรไฟล์ของฉัน</h1>
      <ProfileForm user={user} />
    </div>
  );
}
