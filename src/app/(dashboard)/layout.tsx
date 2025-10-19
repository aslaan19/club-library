import type React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
