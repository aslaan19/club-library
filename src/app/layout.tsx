import type React from "react";
import type { Metadata } from "next";
import { Amiri, Tajawal } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "مكتبة وعيّنا | نظام إدارة الاستعارة",
  description: "نظام إدارة استعارة الكتب لنادي وعيّن",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <Header />

      <body
        className={`${amiri.variable} ${tajawal.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
