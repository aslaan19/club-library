"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl border-destructive/20">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-foreground shadow-lg">
              <Image
                src="/image.png"
                alt="Waaeen Logo"
                fill
                className="object-contain p-2"
                priority
              />
            </div>
          </div>

          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              حدث خطأ ما!
            </CardTitle>
            <CardDescription className="text-base">
              عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
            </CardDescription>
          </div>
        </CardHeader>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button onClick={reset} className="flex-1 gap-2" size="lg">
            <RefreshCcw className="h-4 w-4" />
            <span>إعادة المحاولة</span>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 gap-2 bg-transparent"
            size="lg"
          >
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              <span>العودة للرئيسية</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
