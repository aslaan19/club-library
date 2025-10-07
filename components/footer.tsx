import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/20 mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/dashboard" className="inline-block">
              <div className="bg-black rounded-lg p-3 w-fit hover:scale-105 transition-transform duration-300">
                <Image
                  src="/image.png"
                  alt="وَعْيُنَا"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              نظام إدارة استعارة الكتب لنادي وَعْيُنَا. نسعى لتسهيل الوصول إلى
              المعرفة وتنظيم عملية الاستعارة بكفاءة عالية.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">روابط سريعة</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
              >
                لوحة التحكم
              </Link>
              <Link
                href="/books"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
              >
                تصفح الكتب
              </Link>
              <Link
                href="/my-loans"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
              >
                استعاراتي
              </Link>
              <Link
                href="/books/add"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block"
              >
                إضافة كتاب
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-right">
            © {currentYear} نادي وَعْيُنَا. جميع الحقوق محفوظة.
          </p>
          <a
            href="https://buymeacoffee.com/theaslan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
          >
            <span>by Abdullah Aslan</span>
            <Heart className="h-4 w-4 text-destructive fill-destructive group-hover:scale-110 transition-transform duration-200" />
            <span>Made with</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
