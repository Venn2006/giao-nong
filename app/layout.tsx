import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

// 1. CÀI ĐẶT THÔNG TIN APP (HIỆN LÊN KHI KHÁCH CHIA SẺ LINK)
export const metadata: Metadata = {
  title: "Giao Nóng - Đồ Ăn Cà Mau",
  description: "Giao đồ ăn siêu tốc Cà Mau - Đầm Dơi. Gom chuyến tiết kiệm, phí ship cực rẻ!",
  icons: {
    icon: "/favicon.ico",
  },
};

// 2. ĐÂY LÀ KHÚC "THẦN CHÚ" TRỊ BỆNH ZOOM MÀN HÌNH NÈ SẾP
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Khóa không cho zoom to
  userScalable: false, // Cấm khách dùng 2 ngón tay zoom
  themeColor: "#09090b", // Đổi màu thanh trạng thái (cục pin/sóng) thành màu Than chì cho hợp Darkmode
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}