// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number | string,
  currency = "THB",
  locale = "th-TH"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style:    "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric", month: "short", year: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("th-TH", options).format(new Date(date));
}

export function formatDatetime(date: string | Date): string {
  return formatDate(date, {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random    = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function truncate(text: string, length = 100): string {
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function getDiscountPercentage(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function calculateOrderSummary({
  subtotal,
  coupon,
  shippingFree = false,
}: {
  subtotal: number;
  coupon?: { discountType: string; discountValue: number; maxDiscount?: number | null } | null;
  shippingFree?: boolean;
}) {
  const SHIPPING_COST     = 60;
  const FREE_SHIP_MINIMUM = 500;
  const TAX_RATE          = 0.07;

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
    } else {
      discount = Number(coupon.discountValue);
    }
    discount = Math.min(discount, subtotal);
  }

  const afterDiscount = subtotal - discount;
  const shipping      = shippingFree || afterDiscount >= FREE_SHIP_MINIMUM ? 0 : SHIPPING_COST;
  const tax           = afterDiscount * TAX_RATE;
  const total         = afterDiscount + shipping + tax;

  return { subtotal, discount, shipping, tax, total };
}

export function getProductPrimaryImage(images: { url: string; isPrimary: boolean }[]): string {
  const primary = images.find((i) => i.isPrimary);
  return primary?.url ?? images[0]?.url ?? "/placeholder.png";
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const total      = items.length;
  const totalPages = Math.ceil(total / perPage);
  const start      = (page - 1) * perPage;
  const end        = start + perPage;
  return { items: items.slice(start, end), total, totalPages, page, perPage };
}

export function parseSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );
}
