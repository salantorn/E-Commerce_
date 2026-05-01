// components/layout/Footer.tsx
import Link from "next/link";
import { Package, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-400 mt-auto">
      <div className="container-app py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              ShopNext
            </Link>
            <p className="text-sm leading-relaxed">
              ร้านค้าออนไลน์ที่คุณไว้วางใจได้ สินค้าคุณภาพ ราคายุติธรรม จัดส่งรวดเร็วทั่วประเทศ
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-dark-secondary flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon className="w-4 h-4 text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-white font-semibold mb-4">ช้อปปิ้ง</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["สินค้าทั้งหมด", "/products"],
                ["สินค้าแนะนำ",  "/products?isFeatured=true"],
                ["ขายดี",        "/products?sortBy=popular"],
                ["สินค้าใหม่",   "/products?sortBy=newest"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-white font-semibold mb-4">บัญชีของฉัน</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["โปรไฟล์",    "/profile"],
                ["คำสั่งซื้อ", "/orders"],
                ["Wishlist",   "/wishlist"],
                ["เข้าสู่ระบบ", "/login"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">ติดต่อเรา</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-400 shrink-0" />
                <span>123 ถนนสุขุมวิท แขวงคลองเตย กรุงเทพฯ 10110</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <span>02-000-0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <span>support@shopnext.th</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-dark-secondary">
        <div className="container-app py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ShopNext. สงวนลิขสิทธิ์</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-300 transition-colors">นโยบายความเป็นส่วนตัว</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">เงื่อนไขการให้บริการ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
