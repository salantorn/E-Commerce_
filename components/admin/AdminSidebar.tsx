// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, BarChart2, Settings, LogOut, Package2, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

const NAV = [
  { href: "/admin",           label: "แดชบอร์ด",       icon: LayoutDashboard, exact: true },
  { href: "/admin/products",  label: "สินค้า",          icon: Package2 },
  { href: "/admin/orders",    label: "คำสั่งซื้อ",     icon: ShoppingBag },
  { href: "/admin/customers", label: "ลูกค้า",         icon: Users },
  { href: "/admin/categories",label: "หมวดหมู่",       icon: Tag },
  { href: "/admin/analytics", label: "รายงาน",         icon: BarChart2 },
];

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-dark-secondary">
        <Link href="/admin" className="flex items-center gap-2 text-white font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span>ShopNext <span className="text-primary-400 text-xs font-normal">Admin</span></span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive(href, exact)
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-400 hover:bg-dark-secondary hover:text-white"
            )}>
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {label}
            {isActive(href, exact) && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
          </Link>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-dark-secondary">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center overflow-hidden shrink-0">
            {user.image
              ? <Image src={user.image} alt={user.name ?? ""} width={36} height={36} className="object-cover" />
              : <span className="text-white font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-gray-500 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="btn bg-dark-secondary text-gray-300 hover:text-white hover:bg-dark-tertiary flex-1 btn-sm justify-center text-xs">
            หน้าร้านค้า
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="btn bg-dark-secondary text-gray-300 hover:text-red-400 btn-sm btn-icon">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-dark rounded-xl flex items-center justify-center text-white shadow-lg">
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-60 bg-dark flex flex-col",
        "transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
