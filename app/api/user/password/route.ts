// app/api/user/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body      = await req.json();
    const validated = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ success: false, error: "บัญชีนี้ใช้ Social Login ไม่มีรหัสผ่าน" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(validated.currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(validated.newPassword, 12);
    await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });

    return NextResponse.json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
