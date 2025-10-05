"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "تاريخ",
  "روايات",
  "دين",
  "سياسة",
  "تطوير ذات",
  "علوم",
  "فلسفة",
];

export default function AddBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author,
        description,
        category,
        coverImage: coverImage || null,
      }),
    });

    if (res.ok) {
      alert("تمت إضافة الكتاب بنجاح!");
      router.push("/books");
    } else {
      const error = await res.json();
      alert(error.error || "حدث خطأ");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl animate-in fade-in duration-500">
      <Button variant="ghost" asChild className="mb-6 -mr-4">
        <Link href="/books" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للمكتبة
        </Link>
      </Button>

      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">إضافة كتاب تطوعًا</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          ساهم في إثراء مكتبة النادي بإضافة كتاب جديد
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>معلومات الكتاب</CardTitle>
          <CardDescription>يرجى ملء جميع الحقول المطلوبة بدقة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">
                عنوان الكتاب <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setTitle(e.target.value)}
                placeholder="مثال: البداية والنهاية"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="text-base">
                المؤلف <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author"
                type="text"
                required
                value={author}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setAuthor(e.target.value)}
                placeholder="مثال: ابن كثير"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-base">
                الفئة <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="اختر فئة الكتاب" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-lg">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">
                الوصف
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setDescription(e.target.value)}
                placeholder="وصف مختصر للكتاب وأهم محتوياته..."
                className="min-h-32 text-base resize-none"
              />
              <p className="text-sm text-muted-foreground">
                {description.length} / 500 حرف
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="coverImage" className="text-base">
                رابط صورة الغلاف
              </Label>
              <Input
                id="coverImage"
                type="url"
                value={coverImage}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setCoverImage(e.target.value)}
                placeholder="https://example.com/book-cover.jpg"
                className="h-12"
              />

              {coverImage && (
                <Card className="overflow-hidden border-2">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      معاينة الصورة:
                    </p>
                    <div className="relative aspect-[3/4] max-w-xs mx-auto rounded-lg overflow-hidden">
                      <img
                        src={coverImage || "/placeholder.svg"}
                        alt="معاينة الغلاف"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "";
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {!coverImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                  <ImageIcon className="h-4 w-4" />
                  <span>يمكنك ترك هذا الحقل فارغًا إذا لم تكن لديك صورة</span>
                </div>
              )}
            </div>

            <div className="pt-4 space-y-4">
              <Button
                type="submit"
                disabled={loading || !title || !author || !category}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    جاري الإضافة...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    إضافة الكتاب
                  </span>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                بإضافة الكتاب، أنت توافق على أن المعلومات المقدمة صحيحة
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
