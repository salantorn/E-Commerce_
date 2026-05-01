// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/common/Providers";
import { Toaster } from "react-hot-toast";

// Modern, clean sans-serif font - Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Display font - Space Grotesk (modern & minimal)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-cal",
  display: "swap",
});

export const metadata: Metadata = {
  title: { template: "%s | ShopNext", default: "ShopNext — ช้อปปิ้งออนไลน์" },
  description: "ช้อปปิ้งออนไลน์สินค้าคุณภาพ ราคาดี จัดส่งรวดเร็ว",
  keywords: ["ช้อปปิ้ง", "ออนไลน์", "สินค้า", "ecommerce"],
  authors: [{ name: "ShopNext" }],
  openGraph: {
    type:   "website",
    locale: "th_TH",
    title:  "ShopNext — ช้อปปิ้งออนไลน์",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { 
                fontFamily: "var(--font-inter)", 
                borderRadius: "12px", 
                fontSize: "14px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
