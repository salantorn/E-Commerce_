# 🛍️ ShopNext — Production-Ready E-Commerce Web App

> Next.js 14 · TypeScript · TailwindCSS · PostgreSQL · Prisma · NextAuth · Stripe · Cloudinary

---

## ✨ Features

### 👤 User System
- Register / Login / Logout
- Google OAuth + Credentials login
- JWT session (NextAuth)
- Role-based access control (USER / ADMIN)
- Profile management + password change

### 🛍️ Product System
- Product listing with pagination
- Category filtering, price range, search
- Product detail with image gallery
- Related products
- Star ratings & reviews

### 🛒 Cart System
- Zustand local state (persisted to localStorage)
- Slide-out cart drawer
- Add / Remove / Update quantity
- Stock validation

### 💳 Checkout & Payment
- Address form with validation
- Coupon / discount code
- Stripe Checkout Session
- Webhook for payment confirmation
- Order summary with tax & shipping

### 📦 Order System
- Order history per user
- Order detail with status timeline
- Tracking number support

### 🧑‍💼 Admin Dashboard
- Analytics: revenue chart, KPI cards
- Product CRUD (with Cloudinary image upload)
- Order management (status updates)
- Customer list with spending
- Category management
- Low-stock alerts

### 🔧 Advanced
- Wishlist (toggle per product)
- Coupon system (% or fixed, expiry, usage limit)
- Responsive mobile-first UI
- Loading skeletons & error states
- Thai language UI

---

## 🗂️ Project Structure

```
ecommerce-app/
├── app/
│   ├── (admin)/admin/          # Admin pages (dashboard, products, orders…)
│   ├── (auth)/                 # Login / Register pages
│   ├── (shop)/                 # Public shop pages (products, cart, checkout)
│   ├── (user)/                 # Authenticated user pages (profile, orders)
│   ├── api/                    # API routes (REST)
│   │   ├── auth/               # NextAuth + register
│   │   ├── admin/              # Admin-only endpoints
│   │   ├── cart/               # Cart CRUD
│   │   ├── categories/         # Public categories
│   │   ├── coupons/            # Coupon validation
│   │   ├── orders/             # Order creation
│   │   ├── products/           # Public product listing
│   │   ├── reviews/            # Product reviews
│   │   ├── upload/             # Cloudinary upload
│   │   ├── user/               # Profile & password
│   │   └── webhooks/stripe/    # Stripe webhook handler
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                # Homepage
│   ├── not-found.tsx
│   ├── error.tsx
│   └── loading.tsx
│
├── components/
│   ├── admin/                  # Admin-specific components
│   ├── cart/                   # CartDrawer
│   ├── common/                 # Providers, ProfileForm
│   ├── layout/                 # Navbar, Footer
│   ├── products/               # ProductCard, ProductFilters, AddToCartSection
│   └── ui/                     # Skeleton, Rating, Pagination, EmptyState, Badges
│
├── hooks/
│   ├── useCart.ts              # TanStack Query cart hooks
│   └── useProducts.ts          # TanStack Query product hooks
│
├── lib/
│   ├── auth.ts                 # NextAuth config
│   ├── cloudinary.ts           # Cloudinary helpers
│   ├── prisma.ts               # Prisma singleton
│   ├── stripe.ts               # Stripe helpers
│   ├── utils.ts                # formatPrice, formatDate, calculateOrderSummary…
│   └── validations.ts          # All Zod schemas
│
├── middleware.ts               # Route protection (NextAuth middleware)
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
│
├── services/
│   ├── analytics.service.ts   # Dashboard analytics queries
│   ├── order.service.ts        # Order business logic
│   └── product.service.ts      # Product business logic
│
├── store/
│   └── cart-store.ts           # Zustand cart state
│
├── types/
│   └── index.ts                # TypeScript types + NextAuth module augmentation
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd ecommerce-app
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret ≥ 32 chars (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `STRIPE_PUBLIC_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Same as cloud name (public) |
| `NEXT_PUBLIC_APP_URL` | App URL (public) |

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed initial data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@shopnext.th` | `Admin@1234` |
| Customer | `demo@shopnext.th` | `User@1234` |

**Test Coupons:** `WELCOME15` (15% off) · `SAVE100` (฿100 off)

---

## 💳 Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined |
| `4000 0025 0000 3155` | Requires 3DS |

Use any future expiry + any CVC.

### Test Webhooks Locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook secret and set it as `STRIPE_WEBHOOK_SECRET`.

---

## 🌐 Deployment

### Vercel (Frontend + API)

```bash
npm run build   # verify build succeeds locally first
```

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add all environment variables
4. Deploy

### Database (choose one)

| Provider | Notes |
|----------|-------|
| **Supabase** | Free tier, managed PostgreSQL |
| **Railway** | Simple setup, free tier available |
| **Neon** | Serverless PostgreSQL, free tier |

Set `DATABASE_URL` from your chosen provider.

### Post-Deploy

```bash
# Run migrations on production DB
npx prisma migrate deploy
npx prisma db seed
```

---

## 🗄️ Database Schema Overview

```
users ──────── accounts, sessions (NextAuth)
          └──── cart ──── cart_items ──── products
          └──── orders ── order_items ─── products
          └──── reviews ─────────────────────┘
          └──── wishlist_items ──────────────┘
          └──── addresses

products ─── categories (tree)
         ─── product_images
         ─── product_variants
         ─── product_tags ─── tags

orders ──── payments
       ──── addresses
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register new user |
| `GET`  | `/api/products` | — | List products (filter/sort/paginate) |
| `GET`  | `/api/products/:id` | — | Get single product |
| `GET`  | `/api/categories` | — | List categories |
| `GET`  | `/api/cart` | USER | Get user cart |
| `POST` | `/api/cart` | USER | Add item to cart |
| `PATCH`| `/api/cart` | USER | Update item quantity |
| `DELETE`| `/api/cart` | USER | Remove item |
| `GET`  | `/api/orders` | USER | Get user orders |
| `POST` | `/api/orders` | USER | Create order + Stripe session |
| `POST` | `/api/reviews` | USER | Create/update review |
| `GET`  | `/api/wishlist` | USER | Get wishlist |
| `POST` | `/api/wishlist` | USER | Toggle wishlist item |
| `POST` | `/api/coupons/validate` | USER | Validate coupon |
| `PATCH`| `/api/user/profile` | USER | Update profile |
| `PATCH`| `/api/user/password` | USER | Change password |
| `POST` | `/api/upload` | USER | Upload image to Cloudinary |
| `POST` | `/api/webhooks/stripe` | — | Stripe webhook handler |
| `GET`  | `/api/admin/products` | ADMIN | Admin product list |
| `POST` | `/api/admin/products` | ADMIN | Create product |
| `PATCH`| `/api/admin/products/:id` | ADMIN | Update product |
| `DELETE`| `/api/admin/products/:id` | ADMIN | Delete product |
| `GET`  | `/api/admin/orders` | ADMIN | Admin order list |
| `PATCH`| `/api/admin/orders/:id` | ADMIN | Update order status |
| `GET`  | `/api/admin/analytics` | ADMIN | Dashboard analytics |
| `POST` | `/api/admin/categories` | ADMIN | Create category |

---

## 🛠️ Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run db:push      # Push schema (no migration)
npm run db:migrate   # Run migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT sessions via NextAuth
- Admin routes protected by middleware + server-side role check
- Stripe webhooks verified with signature
- Input validation with **Zod** on all endpoints
- SQL injection prevention via Prisma ORM

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v4 |
| Payment | Stripe |
| Storage | Cloudinary |
| State | Zustand |
| Data fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Toast | React Hot Toast |
| Animations | Tailwind keyframes |

---

Built with ❤️ using Next.js & TypeScript
