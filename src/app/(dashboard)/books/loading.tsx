import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-foreground shadow-2xl animate-bounce">
            <Image
              src="/image.png"
              alt="Waaeen Logo"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">وعيّن</h2>
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>

        {/* Loading Spinner */}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}
