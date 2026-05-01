// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Search, User, Menu, X, Package, Heart, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/products",          label: "สินค้าทั้งหมด" },
  { href: "/products?isFeatured=true", label: "สินค้าแนะนำ" },
  { href: "/products?sortBy=popular",  label: "ขายดี" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const itemCount  = useCartStore((s) => s.itemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);

  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [scrolled,      setScrolled]      = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full bg-white transition-shadow duration-200",
      scrolled && "shadow-md"
    )}>
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="container-app flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-2xl text-dark">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span>Shop<span className="text-gradient">Next</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button onClick={() => setSearchOpen(true)}
              className="btn-ghost btn-icon" aria-label="ค้นหา">
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            {session && (
              <Link href="/wishlist" className="btn-ghost btn-icon relative" aria-label="สิ่งที่อยากได้">
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Cart */}
            <button onClick={toggleCart}
              className="btn-ghost btn-icon relative" aria-label="ตะกร้าสินค้า">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-scale-in">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              {session ? (
                <>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 ml-1 rounded-xl px-2 py-1.5 hover:bg-surface-secondary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center">
                      {session.user.image ? (
                        <Image src={session.user.image} alt={session.user.name ?? ""} width={32} height={32} className="object-cover" />
                      ) : (
                        <span className="text-primary-700 font-semibold text-sm">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-dark max-w-[100px] truncate">
                      {session.user.name}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 card shadow-lg animate-slide-down z-50">
                      <div className="p-3 border-b border-border">
                        <p className="text-sm font-semibold text-dark truncate">{session.user.name}</p>
                        <p className="text-xs text-text-muted truncate">{session.user.email}</p>
                      </div>
                      <div className="p-1.5">
                        {session.user.role === "ADMIN" && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-dark hover:bg-surface-secondary rounded-lg transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-primary-600" />
                            แดชบอร์ด Admin
                          </Link>
                        )}
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-dark hover:bg-surface-secondary rounded-lg transition-colors">
                          <User className="w-4 h-4" /> โปรไฟล์
                        </Link>
                        <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-dark hover:bg-surface-secondary rounded-lg transition-colors">
                          <Package className="w-4 h-4" /> คำสั่งซื้อ
                        </Link>
                        <Link href="/wishlist" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-dark hover:bg-surface-secondary rounded-lg transition-colors">
                          <Heart className="w-4 h-4" /> สิ่งที่อยากได้
                        </Link>
                        <button onClick={() => { signOut({ callbackUrl: "/" }); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1 border-t border-border pt-2">
                          <LogOut className="w-4 h-4" /> ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" className="btn-primary btn-sm ml-1">
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn-ghost btn-icon ml-1">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden border-b border-border bg-white animate-slide-down">
          <div className="container-app py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-surface-secondary">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl card shadow-2xl p-4 animate-slide-down"
            onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาสินค้า..."
                className="input"
              />
              <button type="submit" className="btn-primary px-4">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
