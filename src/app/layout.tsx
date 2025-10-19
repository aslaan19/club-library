import type React from "react";
import type { Metadata } from "next";
import { Amiri, Tajawal } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Toaster } from "sonner"; // Don't forget this if you're using toasts

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
      <body
        className={`${amiri.variable} ${tajawal.variable} font-sans antialiased`}
      >
        <Header /> {/* Moved inside body */}
        {children}
        <Toaster position="top-center" richColors /> {/* Add if using sonner */}
      </body>
    </html>
  );
}
