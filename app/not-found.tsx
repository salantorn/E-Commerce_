// app/not-found.tsx
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4">
          <p className="text-8xl font-display font-bold text-gradient mb-4">404</p>
          <h1 className="text-2xl font-bold text-dark mb-2">ไม่พบหน้าที่ต้องการ</h1>
          <p className="text-text-muted mb-8">
            หน้าที่คุณกำลังมองหาอาจถูกลบหรือย้ายไปแล้ว
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-primary btn-lg">
              กลับหน้าแรก
            </Link>
            <Link href="/products" className="btn-secondary btn-lg">
              ดูสินค้า
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
