import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giao Nóng - Đặt đồ ăn Cà Mau",
  description: "Giao đồ ăn tận nơi khu vực Đầm Dơi, Chà Là",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* Giữ lại bùa chống lỗi Hydration, bỏ hết font rườm rà */}
      <body
        className="antialiased min-h-full flex flex-col"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}