// types/index.ts
import type {
  User,
  Product,
  Category,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Review,
  Address,
  Payment,
  Coupon,
  ProductImage,
  ProductVariant,
  OrderStatus,
  PaymentStatus,
  Role,
} from "@prisma/client";

// ─── Re-export Prisma types ──────────────────────────────────
export type {
  User,
  Product,
  Category,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Review,
  Address,
  Payment,
  Coupon,
  ProductImage,
  ProductVariant,
  OrderStatus,
  PaymentStatus,
  Role,
};

// ─── Extended / Composed types ───────────────────────────────

export type ProductWithDetails = Product & {
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
};

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product & { images: ProductImage[] };
  })[];
};

export type OrderWithDetails = Order & {
  items: OrderItem[];
  payment: Payment | null;
  address: Address | null;
  user: Pick<User, "id" | "name" | "email">;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">;
};

// ─── API Response types ───────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ─── Filter / Query types ─────────────────────────────────────

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "rating" | "popular";
  page?: number;
  perPage?: number;
  tags?: string[];
}

export interface AdminOrderFilters {
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}

// ─── Cart state types ─────────────────────────────────────────

export interface CartItemState {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  variantId?: string;
  variantName?: string;
}

export interface CartState {
  items: CartItemState[];
  isOpen: boolean;
  isLoading: boolean;
}

// ─── Checkout types ───────────────────────────────────────────

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  saveAddress: boolean;
  couponCode?: string;
  notes?: string;
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  coupon?: Coupon;
}

// ─── Admin Dashboard types ────────────────────────────────────

export interface DashboardStats {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

// ─── Next-Auth extended types ─────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }
  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
