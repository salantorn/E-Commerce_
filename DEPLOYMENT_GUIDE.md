# 🚀 Deployment Guide - ShopNext E-Commerce

## ✅ โค้ดถูก Push ขึ้น GitHub แล้ว!

Repository: https://github.com/salantorn/E-Commerce_.git

---

## 📋 ขั้นตอนการ Deploy บน Vercel

### 1. เตรียม Database (Supabase)

คุณมี Database อยู่แล้วที่ Supabase:
```
DATABASE_URL="postgresql://postgres:oZA2E1UQNtEmMjyl@db.vylshgacocszzvcowfsu.supabase.co:5432/postgres"
```

✅ Database พร้อมใช้งาน

---

### 2. Deploy บน Vercel

#### ขั้นตอนที่ 1: เข้า Vercel
1. ไปที่ https://vercel.com
2. Login ด้วย GitHub account
3. คลิก "Add New Project"

#### ขั้นตอนที่ 2: Import Repository
1. เลือก repository: `salantorn/E-Commerce_`
2. คลิก "Import"

#### ขั้นตอนที่ 3: Configure Project
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### ขั้นตอนที่ 4: Environment Variables
เพิ่ม Environment Variables ทั้งหมด:

```env
# Database
DATABASE_URL=your_database_url_here

# NextAuth
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name

# App
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_NAME=ShopNext
```

**สำคัญ**: เปลี่ยน `your-app-name.vercel.app` เป็น URL จริงของคุณ

#### ขั้นตอนที่ 5: Deploy
1. คลิก "Deploy"
2. รอ 2-3 นาที
3. เสร็จแล้ว! 🎉

---

### 3. Setup Database บน Production

หลัง Deploy สำเร็จ ต้อง seed database:

#### วิธีที่ 1: ใช้ Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run seed
vercel env pull .env.production
npm run db:seed
```

#### วิธีที่ 2: ใช้ Local + Production DB
```bash
# ใช้ DATABASE_URL ของ production
DATABASE_URL="your-production-db-url" npm run db:seed
```

---

### 4. Setup Stripe Webhook

#### ขั้นตอนที่ 1: สร้าง Webhook Endpoint
1. ไปที่ https://dashboard.stripe.com/webhooks
2. คลิก "Add endpoint"
3. Endpoint URL: `https://your-app-name.vercel.app/api/webhooks/stripe`
4. เลือก Events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

#### ขั้นตอนที่ 2: Copy Webhook Secret
1. คลิกที่ webhook ที่สร้าง
2. คัดลอก "Signing secret" (ขึ้นต้นด้วย `whsec_`)
3. เพิ่มใน Vercel Environment Variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

#### ขั้นตอนที่ 3: Redeploy
1. ไปที่ Vercel Dashboard
2. คลิก "Redeploy"

---

### 5. Setup Google OAuth (Optional)

#### ขั้นตอนที่ 1: Google Cloud Console
1. ไปที่ https://console.cloud.google.com
2. สร้าง Project ใหม่
3. ไปที่ "APIs & Services" → "Credentials"
4. สร้าง "OAuth 2.0 Client ID"

#### ขั้นตอนที่ 2: Configure OAuth
```
Application type: Web application
Authorized JavaScript origins:
  - https://your-app-name.vercel.app

Authorized redirect URIs:
  - https://your-app-name.vercel.app/api/auth/callback/google
```

#### ขั้นตอนที่ 3: เพิ่ม Credentials
1. คัดลอก Client ID และ Client Secret
2. เพิ่มใน Vercel Environment Variables
3. Redeploy

---

## 🔧 Post-Deployment Checklist

### ✅ ตรวจสอบ
- [ ] เว็บเปิดได้ปกติ
- [ ] Login/Register ทำงาน
- [ ] Database connection สำเร็จ
- [ ] สินค้าแสดงผล
- [ ] Cart ทำงาน
- [ ] Checkout ทำงาน (Stripe)
- [ ] Upload รูปภาพได้ (Cloudinary)
- [ ] Admin dashboard เข้าได้

### 🔐 Default Admin Account
```
Email: admin@shopnext.th
Password: Admin@1234
```

**สำคัญ**: เปลี่ยนรหัสผ่านทันทีหลัง deploy!

---

## 🐛 Troubleshooting

### ปัญหา: Build Failed
**แก้ไข**:
1. ตรวจสอบ Environment Variables
2. ตรวจสอบ `package.json` dependencies
3. ดู Build Logs ใน Vercel

### ปัญหา: Database Connection Error
**แก้ไข**:
1. ตรวจสอบ `DATABASE_URL`
2. ตรวจสอบ Supabase connection limit
3. ตรวจสอบ IP whitelist (ถ้ามี)

### ปัญหา: Stripe Webhook ไม่ทำงาน
**แก้ไข**:
1. ตรวจสอบ `STRIPE_WEBHOOK_SECRET`
2. ตรวจสอบ Webhook URL ถูกต้อง
3. ตรวจสอบ Events ที่เลือก

### ปัญหา: Upload รูปภาพไม่ได้
**แก้ไข**:
1. ตรวจสอบ Cloudinary credentials
2. ตรวจสอบ file size limit
3. ตรวจสอบ CORS settings

---

## 📊 Performance Optimization

### 1. Enable Caching
```typescript
// next.config.js
module.exports = {
  images: {
    minimumCacheTTL: 60,
  },
};
```

### 2. Database Connection Pooling
Prisma จัดการ connection pooling อัตโนมัติ

### 3. Image Optimization
- Cloudinary optimize อัตโนมัติ
- Next.js Image component optimize อัตโนมัติ

---

## 🔒 Security Checklist

### ✅ ก่อน Production
- [ ] เปลี่ยนรหัสผ่าน admin
- [ ] ตั้งค่า CORS ให้ถูกต้อง
- [ ] Enable HTTPS only
- [ ] ตั้งค่า Rate limiting
- [ ] Enable Vercel Analytics
- [ ] Setup Error tracking (Sentry)

---

## 📈 Monitoring

### Vercel Analytics
1. ไปที่ Vercel Dashboard
2. เปิด "Analytics" tab
3. ดู metrics: Page views, Performance, etc.

### Stripe Dashboard
1. ไปที่ https://dashboard.stripe.com
2. ดู Payments, Customers, etc.

### Supabase Dashboard
1. ไปที่ Supabase Dashboard
2. ดู Database usage, Queries, etc.

---

## 🎉 เสร็จแล้ว!

เว็บของคุณพร้อม deploy แล้ว! 

### Next Steps:
1. Deploy บน Vercel
2. Setup Stripe Webhook
3. Seed database
4. Test ทุกฟีเจอร์
5. เปลี่ยนรหัสผ่าน admin
6. เริ่มใช้งาน! 🚀

---

**Repository**: https://github.com/salantorn/E-Commerce_.git
**Documentation**: README.md, FIXES_SUMMARY.md, ADMIN_UPDATES.md

**สร้างเมื่อ**: วันที่ 21 เมษายน 2026
