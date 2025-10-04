// app/layout.tsx
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ 
  subsets: ["arabic"],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: "مكتبة وعيّن | نظام إدارة الاستعارة",
  description: "نظام إدارة استعارة الكتب لنادي وعيّن",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}