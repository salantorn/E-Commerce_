// app/(user)/wishlist/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import { Heart } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { ProductWithDetails } from "@/types";

export const metadata: Metadata = { title: "สิ่งที่อยากได้" };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const items = await prisma.wishlistItem.findMany({
    where:   { userId: session.user.id },
    include: {
      product: {
        include: {
          category: true,
          images:   { orderBy: { sortOrder: "asc" } },
          variants: true,
          reviews:  true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-app py-8">
      <h1 className="text-3xl font-display font-bold text-dark mb-2">
        สิ่งที่อยากได้
      </h1>
      <p className="text-text-muted mb-8">{items.length} รายการ</p>

      {items.length === 0 ? (
        <div className="card p-16 text-center">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark">ยังไม่มีสินค้าในรายการ</h3>
          <p className="text-text-muted mt-1">เพิ่มสินค้าที่ชื่นชอบได้เลย!</p>
          <Link href="/products" className="btn-primary mt-6 inline-flex">
            ดูสินค้า
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <ProductCard key={item.id} product={item.product as ProductWithDetails} />
          ))}
        </div>
      )}
    </div>
  );
}
