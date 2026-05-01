// services/product.service.ts
import prisma from "@/lib/prisma";
import type { ProductFilters, PaginatedResponse, ProductWithDetails } from "@/types";
import { Prisma } from "@prisma/client";

export class ProductService {
  static async findMany(filters: ProductFilters): Promise<PaginatedResponse<ProductWithDetails>> {
    const {
      search, categoryId, categorySlug, minPrice, maxPrice,
      inStock, isFeatured, sortBy = "newest",
      page = 1, perPage = 12, tags,
    } = filters;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (search) {
      where.OR = [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku:         { contains: search, mode: "insensitive" } },
      ];
    }
    if (categorySlug)  where.category = { slug: categorySlug };
    else if (categoryId) where.categoryId = categoryId;
    if (minPrice !== undefined) where.price = { ...where.price as object, gte: minPrice };
    if (maxPrice !== undefined) where.price = { ...where.price as object, lte: maxPrice };
    if (inStock)    where.stock    = { gt: 0 };
    if (isFeatured) where.isFeatured = true;
    if (tags && tags.length > 0) {
      where.tags = { some: { tag: { slug: { in: tags } } } };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === "price_asc"  ? { price: "asc"  }
      : sortBy === "price_desc" ? { price: "desc" }
      : sortBy === "rating"     ? { rating: "desc" }
      : sortBy === "popular"    ? { soldCount: "desc" }
      : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip:  (page - 1) * perPage,
        take:  perPage,
        include: {
          category: true,
          images:   { orderBy: { sortOrder: "asc" } },
          variants: true,
          reviews:  { select: { rating: true }, take: 5 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items: items as ProductWithDetails[], total, page, perPage, totalPages: Math.ceil(total / perPage) };
  }

  static async findBySlug(slug: string): Promise<ProductWithDetails | null> {
    return prisma.product.findUnique({
      where:   { slug, isActive: true },
      include: {
        category: true,
        images:   { orderBy: { sortOrder: "asc" } },
        variants: true,
        reviews:  {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
        tags: { include: { tag: true } },
      },
    }) as Promise<ProductWithDetails | null>;
  }

  static async findById(id: string): Promise<ProductWithDetails | null> {
    return prisma.product.findUnique({
      where:   { id },
      include: {
        category: true,
        images:   { orderBy: { sortOrder: "asc" } },
        variants: true,
        reviews:  true,
      },
    }) as Promise<ProductWithDetails | null>;
  }

  static async create(data: {
    name: string; description: string; price: number;
    comparePrice?: number; costPrice?: number; sku?: string;
    stock: number; categoryId: string; isActive: boolean;
    isFeatured: boolean; weight?: number;
    images?: { url: string; isPrimary: boolean }[];
  }) {
    const slug = await this.generateUniqueSlug(data.name);
    const { images, ...rest } = data;

    return prisma.product.create({
      data: {
        ...rest,
        slug,
        images: images
          ? { createMany: { data: images.map((img, i) => ({ ...img, sortOrder: i })) } }
          : undefined,
      },
      include: { images: true, category: true },
    });
  }

  static async update(id: string, data: Partial<{
    name: string; description: string; price: number;
    comparePrice: number; costPrice: number; sku: string;
    stock: number; categoryId: string; isActive: boolean;
    isFeatured: boolean; weight: number;
  }>) {
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(data.name ? { slug: await this.generateUniqueSlug(data.name, id) } : {}),
      },
      include: { images: true, category: true, variants: true },
    });
  }

  static async delete(id: string) {
    return prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  static async decreaseStock(items: { productId: string; quantity: number }[]) {
    await Promise.all(
      items.map(({ productId, quantity }) =>
        prisma.product.update({
          where: { id: productId },
          data:  { stock: { decrement: quantity }, soldCount: { increment: quantity } },
        })
      )
    );
  }

  private static async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const base = name.toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "");
    let slug  = base;
    let count = 0;

    while (true) {
      const existing = await prisma.product.findFirst({
        where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      });
      if (!existing) break;
      slug = `${base}-${++count}`;
    }
    return slug;
  }

  static async getFeatured(limit = 8) {
    return prisma.product.findMany({
      where:   { isActive: true, isFeatured: true },
      take:    limit,
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
    });
  }

  static async getRelated(productId: string, categoryId: string, limit = 4) {
    return prisma.product.findMany({
      where:   { isActive: true, categoryId, NOT: { id: productId } },
      take:    limit,
      orderBy: { rating: "desc" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
    });
  }
}
