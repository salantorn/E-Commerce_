// lib/validations.ts
import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────

export const registerSchema = z.object({
  name:     z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(50),
  email:    z.string().email("รูปแบบอีเมลไม่ถูกต้อง").toLowerCase(),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
             .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
             .regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path:    ["confirmPassword"],
});

export const loginSchema = z.object({
  email:    z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

// ─── Product ──────────────────────────────────────────────────

export const productSchema = z.object({
  name:         z.string().min(1, "กรุณากรอกชื่อสินค้า").max(200),
  description:  z.string().min(1, "กรุณากรอกคำอธิบาย"),
  price:        z.number().positive("ราคาต้องมากกว่า 0"),
  comparePrice: z.number().positive().optional(),
  costPrice:    z.number().positive().optional(),
  sku:          z.string().optional(),
  stock:        z.number().int().min(0, "จำนวนสต็อกต้องไม่ติดลบ"),
  categoryId:   z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  isActive:     z.boolean().default(true),
  isFeatured:   z.boolean().default(false),
  weight:       z.number().positive().optional(),
});

export const categorySchema = z.object({
  name:        z.string().min(1, "กรุณากรอกชื่อหมวดหมู่").max(100),
  description: z.string().optional(),
  parentId:    z.string().optional(),
  isActive:    z.boolean().default(true),
});

// ─── Cart ─────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity:  z.number().int().positive().default(1),
  variantId: z.string().optional(),
});

export const updateCartSchema = z.object({
  cartItemId: z.string().min(1),
  quantity:   z.number().int().min(0),
});

// ─── Checkout / Address ───────────────────────────────────────

export const addressSchema = z.object({
  name:       z.string().min(1, "กรุณากรอกชื่อ"),
  phone:      z.string().regex(/^[0-9]{9,10}$/, "เบอร์โทรไม่ถูกต้อง"),
  line1:      z.string().min(1, "กรุณากรอกที่อยู่"),
  line2:      z.string().optional(),
  city:       z.string().min(1, "กรุณากรอกเมือง"),
  state:      z.string().min(1, "กรุณากรอกจังหวัด"),
  postalCode: z.string().regex(/^[0-9]{5}$/, "รหัสไปรษณีย์ไม่ถูกต้อง"),
  country:    z.string().default("TH"),
  isDefault:  z.boolean().default(false),
});

export const checkoutSchema = z.object({
  addressId:   z.string().optional(),
  address:     addressSchema.optional(),
  couponCode:  z.string().optional(),
  notes:       z.string().max(500).optional(),
  saveAddress: z.boolean().default(false),
});

// ─── Review ───────────────────────────────────────────────────

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating:    z.number().int().min(1).max(5),
  title:     z.string().max(100).optional(),
  body:      z.string().max(2000).optional(),
});

// ─── Coupon ───────────────────────────────────────────────────

export const couponSchema = z.object({
  code:          z.string().min(3).max(20).toUpperCase(),
  description:   z.string().optional(),
  discountType:  z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  maxDiscount:   z.number().positive().optional(),
  usageLimit:    z.number().int().positive().optional(),
  isActive:      z.boolean().default(true),
  expiresAt:     z.string().datetime().optional(),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, "กรุณากรอกโค้ดส่วนลด"),
});

// ─── User Profile ─────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name:  z.string().min(2).max(50),
  phone: z.string().regex(/^[0-9]{9,10}$/).optional().or(z.literal("")),
  image: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8)
                    .regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "รหัสผ่านใหม่ไม่ตรงกัน",
  path:    ["confirmPassword"],
});

// ─── Admin Order Update ───────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  status:         z.enum(["PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"]),
  trackingNumber: z.string().optional(),
});

// ─── Product Filter Query ─────────────────────────────────────

export const productFilterSchema = z.object({
  search:       z.string().optional(),
  categorySlug: z.string().optional(),
  categoryId:   z.string().optional(),
  minPrice:     z.coerce.number().optional(),
  maxPrice:     z.coerce.number().optional(),
  inStock:      z.coerce.boolean().optional(),
  isFeatured:   z.coerce.boolean().optional(),
  sortBy:       z.enum(["price_asc","price_desc","newest","rating","popular"]).optional(),
  page:         z.coerce.number().int().positive().default(1),
  perPage:      z.coerce.number().int().positive().max(100).default(12),
  tags:         z.string().optional(), // comma separated
});
