// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin user ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const admin = await prisma.user.upsert({
    where:  { email: "admin@shopnext.th" },
    update: {},
    create: {
      name:     "Admin ShopNext",
      email:    "admin@shopnext.th",
      password: adminPassword,
      role:     "ADMIN",
    },
  });
  await prisma.cart.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id } });
  console.log("✅ Admin user created:", admin.email);

  // ─── Demo customer ───────────────────────────────────────────
  const userPassword = await bcrypt.hash("User@1234", 12);
  const user = await prisma.user.upsert({
    where:  { email: "demo@shopnext.th" },
    update: {},
    create: {
      name:     "สมชาย ใจดี",
      email:    "demo@shopnext.th",
      password: userPassword,
      role:     "USER",
    },
  });
  await prisma.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
  console.log("✅ Demo user created:", user.email);

  // ─── Categories ───────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ 
      where: { slug: "electronics" }, 
      update: { image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop" }, 
      create: { 
        name: "อิเล็กทรอนิกส์", 
        slug: "electronics", 
        description: "สินค้าอิเล็กทรอนิกส์", 
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop",
        sortOrder: 1 
      } 
    }),
    prisma.category.upsert({ 
      where: { slug: "fashion" }, 
      update: { image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop" }, 
      create: { 
        name: "แฟชั่น", 
        slug: "fashion", 
        description: "เสื้อผ้า กระเป๋า รองเท้า", 
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop",
        sortOrder: 2 
      } 
    }),
    prisma.category.upsert({ 
      where: { slug: "home" }, 
      update: { image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200&h=200&fit=crop" }, 
      create: { 
        name: "บ้านและสวน", 
        slug: "home", 
        description: "ของใช้ในบ้าน", 
        image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200&h=200&fit=crop",
        sortOrder: 3 
      } 
    }),
    prisma.category.upsert({ 
      where: { slug: "beauty" }, 
      update: { image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop" }, 
      create: { 
        name: "ความงาม", 
        slug: "beauty", 
        description: "เครื่องสำอาง ดูแลผิว", 
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop",
        sortOrder: 4 
      } 
    }),
    prisma.category.upsert({ 
      where: { slug: "sports" }, 
      update: { image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop" }, 
      create: { 
        name: "กีฬา", 
        slug: "sports", 
        description: "อุปกรณ์กีฬา ออกกำลังกาย", 
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop",
        sortOrder: 5 
      } 
    }),
    prisma.category.upsert({ 
      where: { slug: "books" }, 
      update: { image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=200&fit=crop" }, 
      create: { 
        name: "หนังสือ", 
        slug: "books", 
        description: "หนังสือ นิตยสาร", 
        image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=200&fit=crop",
        sortOrder: 6 
      } 
    }),
  ]);
  console.log("✅ Categories created:", categories.length);

  // ─── Products ─────────────────────────────────────────────────
  const products = [
    {
      name: "iPhone 15 Pro Max 256GB",
      slug: "iphone-15-pro-max",
      description: "สมาร์ทโฟนรุ่นใหม่ล่าสุดจาก Apple พร้อมชิป A17 Pro และกล้องระดับมืออาชีพ",
      price: 44900,
      comparePrice: 49900,
      stock: 50,
      categoryId: categories[0].id,
      isFeatured: true,
      soldCount: 120,
      rating: 4.9,
      reviewCount: 45,
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600",
      ],
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-s24-ultra",
      description: "สมาร์ทโฟน Android ชั้นนำ พร้อม S Pen และกล้อง 200MP",
      price: 38900,
      comparePrice: 42900,
      stock: 35,
      categoryId: categories[0].id,
      isFeatured: true,
      soldCount: 89,
      rating: 4.7,
      reviewCount: 32,
      images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600"],
    },
    {
      name: "AirPods Pro (2nd Gen)",
      slug: "airpods-pro-2nd",
      description: "หูฟังไร้สาย ตัดเสียงรบกวน Active Noise Cancellation",
      price: 8490,
      comparePrice: 9990,
      stock: 100,
      categoryId: categories[0].id,
      isFeatured: false,
      soldCount: 200,
      rating: 4.8,
      reviewCount: 78,
      images: ["https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=600"],
    },
    {
      name: "เสื้อยืด Oversize พรีเมียม",
      slug: "oversize-tshirt-premium",
      description: "เสื้อยืดทรง Oversize ผ้า Cotton 100% นุ่มสบาย ระบายอากาศดี",
      price: 399,
      comparePrice: 599,
      stock: 200,
      categoryId: categories[1].id,
      isFeatured: true,
      soldCount: 500,
      rating: 4.6,
      reviewCount: 120,
      images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"],
    },
    {
      name: "กระเป๋าสะพายข้าง Minimal",
      slug: "minimal-crossbody-bag",
      description: "กระเป๋าสะพายข้างดีไซน์มินิมอล วัสดุหนัง PU คุณภาพสูง",
      price: 1290,
      comparePrice: 1890,
      stock: 75,
      categoryId: categories[1].id,
      isFeatured: false,
      soldCount: 150,
      rating: 4.5,
      reviewCount: 56,
      images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"],
    },
    {
      name: "โคมไฟตั้งโต๊ะ LED",
      slug: "led-desk-lamp",
      description: "โคมไฟ LED ปรับแสงได้ 3 ระดับ ช่วยถนอมสายตา",
      price: 890,
      comparePrice: 1290,
      stock: 80,
      categoryId: categories[2].id,
      isFeatured: false,
      soldCount: 95,
      rating: 4.4,
      reviewCount: 34,
      images: ["https://images.unsplash.com/photo-1508423134147-addf71308178?w=600"],
    },
    {
      name: "ครีมกันแดด SPF50+",
      slug: "sunscreen-spf50",
      description: "ครีมกันแดด PA++++ ปกป้อง UVA/UVB ไม่มัน ใช้ได้ทุกวัน",
      price: 349,
      comparePrice: 499,
      stock: 150,
      categoryId: categories[3].id,
      isFeatured: true,
      soldCount: 380,
      rating: 4.7,
      reviewCount: 89,
      images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"],
    },
    {
      name: "ดัมเบลปรับน้ำหนัก 20kg",
      slug: "adjustable-dumbbell-20kg",
      description: "ดัมเบลปรับน้ำหนักได้ 2-20 กก. ประหยัดพื้นที่ เหมาะสำหรับออกกำลังกายที่บ้าน",
      price: 3990,
      comparePrice: 5990,
      stock: 30,
      categoryId: categories[4].id,
      isFeatured: true,
      soldCount: 65,
      rating: 4.8,
      reviewCount: 28,
      images: ["https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600"],
    },
  ];

  for (const p of products) {
    const { images, ...productData } = p;
    await prisma.product.upsert({
      where:  { slug: p.slug },
      update: {},
      create: {
        ...productData,
        images: {
          createMany: {
            data: images.map((url, i) => ({ url, isPrimary: i === 0, sortOrder: i })),
          },
        },
      },
    });
  }
  console.log("✅ Products created:", products.length);

  // ─── Coupons ──────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where:  { code: "WELCOME15" },
    update: {},
    create: {
      code:          "WELCOME15",
      description:   "ส่วนลดสมาชิกใหม่ 15%",
      discountType:  "PERCENTAGE",
      discountValue: 15,
      maxDiscount:   500,
      minOrderValue: 300,
      usageLimit:    1000,
    },
  });
  await prisma.coupon.upsert({
    where:  { code: "SAVE100" },
    update: {},
    create: {
      code:          "SAVE100",
      description:   "ลด 100 บาท เมื่อซื้อครบ 1000 บาท",
      discountType:  "FIXED",
      discountValue: 100,
      minOrderValue: 1000,
    },
  });
  console.log("✅ Coupons created");

  console.log("\n✨ Seeding complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 Admin:    admin@shopnext.th / Admin@1234");
  console.log("👤 Customer: demo@shopnext.th  / User@1234");
  console.log("🎟️ Coupons:  WELCOME15 | SAVE100");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
