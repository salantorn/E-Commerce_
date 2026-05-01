// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Star, Zap } from "lucide-react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import type { ProductWithDetails } from "@/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  const [featured, categories, topSelling] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } }, variants: true, reviews: true },
    }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      take: 6,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { soldCount: "desc" },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } }, variants: true, reviews: true },
    }),
  ]);
  return { featured, categories, topSelling };
}

const FEATURES = [
  { icon: Truck,       title: "จัดส่งฟรี",       desc: "สั่งซื้อครบ ฿500 ขึ้นไป" },
  { icon: ShieldCheck, title: "สินค้าแท้ 100%",   desc: "รับประกันคุณภาพทุกชิ้น" },
  { icon: RefreshCw,   title: "คืนสินค้าได้ 30 วัน", desc: "ไม่ถูกใจ คืนได้ทันที" },
  { icon: Headphones,  title: "บริการตลอด 24 ชม.", desc: "ทีมงานพร้อมช่วยเหลือ" },
];

export default async function HomePage() {
  const { featured, categories, topSelling } = await getData();

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-white">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary-200 blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent-light blur-3xl" />
          </div>
          <div className="container-app relative z-10 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-1.5 text-sm border border-primary-100">
                <Zap className="w-4 h-4 text-primary-600" />
                <span className="text-primary-700 font-medium">ลด 50% สินค้าแนะนำ วันนี้เท่านั้น!</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-slate-900">
                ช้อปปิ้งออนไลน์<br />
                <span className="text-gradient">
                  ง่าย เร็ว คุ้มค่า
                </span>
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                สินค้าคุณภาพนับพันรายการ ราคายุติธรรม จัดส่งรวดเร็ว ทั่วประเทศไทย
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="btn-primary btn-lg">
                  ช้อปเลย <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/products?isFeatured=true" className="btn-secondary btn-lg">
                  ดูสินค้าแนะนำ
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <p className="text-2xl font-bold text-slate-900">10K+</p>
                  <p className="text-xs text-slate-500">สินค้า</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">50K+</p>
                  <p className="text-xs text-slate-500">ลูกค้า</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <p className="text-2xl font-bold text-slate-900">4.9</p>
                  <p className="text-xs text-slate-500 mt-1">คะแนน</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex justify-center animate-scale-in">
              <div className="relative w-full h-[400px]">
                <div className="absolute inset-0 rounded-4xl bg-gradient-to-br from-primary-200/30 to-accent-light/20 blur-2xl" />
                <div className="relative rounded-4xl overflow-hidden border border-slate-200 shadow-2xl w-full h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=800&fit=crop"
                    alt="Shopping"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section className="border-b border-slate-100 bg-white">
          <div className="container-app py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Categories ─────────────────────────────────────── */}
        {categories.length > 0 && (
          <section className="section bg-slate-50">
            <div className="container-app">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-display font-bold text-slate-900">หมวดหมู่สินค้า</h2>
                <p className="text-slate-600 mt-2">เลือกช้อปตามหมวดหมู่ที่คุณชื่นชอบ</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/products?categorySlug=${cat.slug}`}
                    className="group relative flex flex-col items-center justify-end gap-3 p-4 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden h-32 bg-white">
                    {/* Background Image */}
                    {cat.image && (
                      <div className="absolute inset-0 z-0">
                        <Image 
                          src={cat.image} 
                          alt={cat.name} 
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
                      </div>
                    )}
                    {/* Fallback for no image */}
                    {!cat.image && (
                      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <span className="text-4xl opacity-50">📦</span>
                      </div>
                    )}
                    {/* Category Name */}
                    <span className="relative z-10 text-sm font-semibold text-white text-center drop-shadow-lg">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Featured Products ───────────────────────────────── */}
        {featured.length > 0 && (
          <section className="section bg-surface-secondary">
            <div className="container-app">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-display font-bold text-dark">สินค้าแนะนำ</h2>
                  <p className="text-text-muted mt-1">คัดสรรเฉพาะสินค้าคุณภาพเยี่ยม</p>
                </div>
                <Link href="/products?isFeatured=true" className="btn-secondary btn-sm hidden sm:flex">
                  ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={p as ProductWithDetails} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Banner ─────────────────────────────────────────── */}
        <section className="section">
          <div className="container-app">
            <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 p-10 sm:p-16 flex flex-col sm:flex-row items-center justify-between gap-8 text-white">
              <div>
                <p className="text-primary-200 font-medium mb-2">โปรโมชั่นพิเศษ</p>
                <h2 className="text-3xl sm:text-4xl font-display font-bold">รับส่วนลด 15%</h2>
                <p className="text-primary-200 mt-2">สำหรับสมาชิกใหม่ที่สมัครวันนี้</p>
              </div>
              <Link href="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 btn-lg shrink-0 shadow-lg">
                สมัครสมาชิกฟรี
              </Link>
            </div>
          </div>
        </section>

        {/* ── Top Selling ────────────────────────────────────── */}
        {topSelling.length > 0 && (
          <section className="section bg-surface-secondary">
            <div className="container-app">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-display font-bold text-dark">สินค้าขายดี</h2>
                  <p className="text-text-muted mt-1">เป็นที่นิยมของลูกค้าทั่วประเทศ</p>
                </div>
                <Link href="/products?sortBy=popular" className="btn-secondary btn-sm hidden sm:flex">
                  ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {topSelling.map((p) => (
                  <ProductCard key={p.id} product={p as ProductWithDetails} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
