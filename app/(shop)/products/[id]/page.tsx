// app/(shop)/products/[id]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { ProductService } from "@/services/product.service";
import ProductCard from "@/components/products/ProductCard";
import AddToCartSection from "@/components/products/AddToCartSection";
import { Rating, OrderStatusBadge } from "@/components/ui";
import { formatPrice, formatDate, getDiscountPercentage } from "@/lib/utils";
import { Shield, Truck, RotateCcw, Star, Package } from "lucide-react";
import type { Metadata } from "next";
import type { ProductWithDetails } from "@/types";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await ProductService.findBySlug(params.id);
  if (!product) return { title: "ไม่พบสินค้า" };
  return {
    title:       product.name,
    description: product.description.slice(0, 160),
    openGraph:   { images: [product.images[0]?.url ?? ""] },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await ProductService.findBySlug(params.id);
  if (!product) notFound();

  const related  = await ProductService.getRelated(product.id, product.categoryId);
  const discount = getDiscountPercentage(Number(product.price), Number(product.comparePrice));
  const reviews  = (product as any).reviews ?? [];

  return (
    <div className="container-app py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-6 flex items-center gap-1.5">
        <a href="/" className="hover:text-primary-600">หน้าแรก</a>
        <span>/</span>
        <a href="/products" className="hover:text-primary-600">สินค้า</a>
        <span>/</span>
        <a href={`/products?categorySlug=${product.category.slug}`}
          className="hover:text-primary-600">{product.category.name}</a>
        <span>/</span>
        <span className="text-dark font-medium">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface-secondary border border-border">
            <Image
              src={product.images[0]?.url ?? "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {discount > 0 && (
              <div className="absolute top-4 left-4 badge bg-red-500 text-white text-base px-3 py-1">
                -{discount}%
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.slice(0, 5).map((img) => (
                <div key={img.id} className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary-500 cursor-pointer transition-colors">
                  <Image src={img.url} alt={product.name} width={100} height={100}
                    className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-primary-600 mb-1">{product.category.name}</p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-dark">{product.name}</h1>
            {product.sku && <p className="text-sm text-text-muted mt-1">SKU: {product.sku}</p>}
          </div>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <Rating value={product.rating} size="md" />
              <span className="text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.reviewCount} รีวิว)
              </span>
              <span className="text-sm text-text-muted">· ขายแล้ว {product.soldCount} ชิ้น</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-dark">{formatPrice(Number(product.price))}</span>
            {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
              <>
                <span className="text-xl text-text-muted line-through">
                  {formatPrice(Number(product.comparePrice))}
                </span>
                <span className="badge bg-red-100 text-red-600 text-sm">ลด {discount}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-2 text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            <Package className="w-4 h-4" />
            {product.stock > 0
              ? `มีสินค้า ${product.stock} ชิ้น`
              : "สินค้าหมด"}
          </div>

          {/* Add to cart */}
          <AddToCartSection product={product as ProductWithDetails} />

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Shield, label: "สินค้าแท้" },
              { icon: Truck,  label: "จัดส่งรวดเร็ว" },
              { icon: RotateCcw, label: "คืนได้ 30 วัน" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-secondary text-center">
                <Icon className="w-5 h-5 text-primary-600" />
                <span className="text-xs font-medium text-gray-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="border-t border-border pt-5">
            <h3 className="font-semibold text-dark mb-3">รายละเอียดสินค้า</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-display font-bold text-dark mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            รีวิวจากลูกค้า ({product.reviewCount})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.slice(0, 6).map((r: any) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {r.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark">{r.user?.name ?? "ลูกค้า"}</p>
                    <p className="text-xs text-text-muted">{formatDate(r.createdAt)}</p>
                  </div>
                </div>
                <Rating value={r.rating} size="sm" />
                {r.title && <p className="text-sm font-medium text-dark mt-2">{r.title}</p>}
                {r.body  && <p className="text-sm text-gray-600 mt-1 line-clamp-3">{r.body}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-display font-bold text-dark mb-6">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p as ProductWithDetails} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
