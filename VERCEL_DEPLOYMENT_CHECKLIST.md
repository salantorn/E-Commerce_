# Vercel Deployment Checklist

## ✅ การแก้ไข Build Error ที่ทำไปแล้ว

### 1. เพิ่ม Dynamic Config ให้ทุก Admin Pages
เพิ่ม `export const dynamic = 'force-dynamic'` และ `export const revalidate = 0` ในไฟล์ต่อไปนี้:
- ✅ `app/(admin)/admin/page.tsx` (Dashboard)
- ✅ `app/(admin)/admin/analytics/page.tsx`
- ✅ `app/(admin)/admin/categories/page.tsx`
- ✅ `app/(admin)/admin/customers/page.tsx`
- ✅ `app/(admin)/admin/orders/page.tsx`
- ✅ `app/(admin)/admin/products/page.tsx`

### 2. เพิ่ม Dynamic Config ให้ API Routes
- ✅ `app/api/admin/analytics/route.ts`
- ✅ `app/api/upload/route.ts`

### 3. ตั้งค่า Cache Headers
- ✅ เพิ่ม headers config ใน `next.config.js` เพื่อป้องกัน cache API routes

## 🔍 สิ่งที่ต้องตรวจสอบใน Vercel Dashboard

### 1. Environment Variables (สำคัญมาก!)
ไปที่ Vercel Dashboard → Project Settings → Environment Variables

ตรวจสอบว่ามีตัวแปรเหล่านี้ครบทั้ง 3 environments (Production, Preview, Development):

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**หมายเหตุ:** 
- `DATABASE_URL` ต้องเป็น connection string ที่เข้าถึงได้จาก Vercel (ไม่ใช่ localhost)
- `NEXTAUTH_URL` ต้องเป็น URL จริงของเว็บไซต์บน Vercel
- `NEXTAUTH_SECRET` สร้างได้จาก: `openssl rand -base64 32`

### 2. Build & Development Settings
ไปที่ Project Settings → General

ตรวจสอบ:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` หรือ `prisma generate && next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x หรือ 20.x

### 3. Prisma Configuration
ถ้าใช้ Prisma ต้องเพิ่ม build command:

```bash
prisma generate && next build
```

หรือเพิ่มใน `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## 🚀 ขั้นตอนการ Deploy ใหม่

### 1. ตรวจสอบว่า Code ล่าสุดถูก Push แล้ว
```bash
cd ecommerce-app
git status
git log -1
```

### 2. Trigger Redeploy บน Vercel
มี 2 วิธี:

**วิธีที่ 1: Push Code ใหม่**
```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

**วิธีที่ 2: Redeploy ผ่าน Vercel Dashboard**
- ไปที่ Deployments tab
- คลิกที่ deployment ล่าสุด
- คลิก "Redeploy" button

### 3. ตรวจสอบ Build Logs
- ไปที่ Deployments tab
- คลิกที่ deployment ที่กำลัง build
- ดู Build Logs เพื่อตรวจสอบว่ามี error หรือไม่

## 🐛 การแก้ปัญหาเพิ่มเติม

### ถ้ายังมี Error: "Failed to collect page data"

**สาเหตุที่เป็นไปได้:**

1. **Database ไม่สามารถเข้าถึงได้ตอน Build Time**
   - ✅ แก้ไข: เพิ่ม `export const dynamic = 'force-dynamic'` (ทำแล้ว)

2. **Environment Variables ไม่ครบ**
   - ตรวจสอบว่ามี `DATABASE_URL` ใน Vercel
   - ตรวจสอบว่า Database อนุญาตให้ Vercel เข้าถึงได้

3. **Prisma Schema ไม่ตรงกับ Database**
   - Run: `prisma migrate deploy` บน production database
   - หรือเพิ่มใน build command: `prisma migrate deploy && next build`

4. **Database Connection Limit**
   - ใช้ Connection Pooling: เปลี่ยน `DATABASE_URL` เป็น pooled connection
   - ตัวอย่าง Supabase: ใช้ connection string ที่มี `:6543` (pooler) แทน `:5432`

### ถ้ามี Error: "ECONNREFUSED" หรือ "Connection timeout"

Database ไม่อนุญาตให้ Vercel เข้าถึง:
- ตรวจสอบ Firewall rules ของ Database
- เพิ่ม Vercel IP ranges ใน whitelist
- หรือใช้ Database ที่รองรับ serverless (Supabase, PlanetScale, Neon)

### ถ้ามี Error: "Module not found"

```bash
# ลบ node_modules และ lock file แล้ว install ใหม่
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "update dependencies"
git push
```

## 📝 Commit ล่าสุด

```
commit b34bca3
fix: add dynamic config to all admin pages to fix Vercel build error

- Added export const dynamic = 'force-dynamic' to all admin pages
- Added export const revalidate = 0 to prevent caching
- This prevents Next.js from trying to pre-render pages at build time
- Fixes "Failed to collect page data for /api/admin/analytics" error
```

## 🎯 Next Steps

1. ✅ Code ถูก push ไปที่ GitHub แล้ว
2. ⏳ รอให้ Vercel auto-deploy (หรือ trigger manual redeploy)
3. 🔍 ตรวจสอบ Environment Variables ใน Vercel Dashboard
4. 📊 ดู Build Logs เพื่อยืนยันว่า build สำเร็จ
5. ✨ ทดสอบเว็บไซต์หลัง deploy สำเร็จ

## 📞 ถ้ายังมีปัญหา

ให้ส่ง Build Logs จาก Vercel มาให้ดู โดยเฉพาะส่วน:
- Build Output
- Error Messages
- Environment Variables (ไม่ต้องส่งค่าจริง แค่บอกว่ามีตัวไหนบ้าง)
