"use client";

import { type SetStateAction, useEffect, useState } from "react";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, BookOpen, Sparkles } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  category: string;
  coverImage: string | null;
  status: string;
  contributor: { name: string; email: string } | null;
  loans: any[];
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchBooks();
  }, [search, category]);

  const fetchBooks = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category !== "all") params.append("category", category);

    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    setBooks(data);
    setLoading(false);
  };

  const isAvailable = (book: Book) => {
    return book.status === "AVAILABLE" && book.loans.length === 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-background via-accent/5 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 py-4 md:py-18 relative">
          <div className="max-w-3xl mx-auto text-center space-y-2 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance animate-slide-up">
              المكتبة
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed text-pretty animate-slide-up animation-delay-100">
              استكشف مجموعتنا المتنوعة من الكتب واختر ما يناسب اهتماماتك
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto mb-12 animate-fade-in animation-delay-200">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg shadow-black/5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="text"
                  placeholder="ابحث عن كتاب أو مؤلف..."
                  value={search}
                  onChange={(e: {
                    target: { value: SetStateAction<string> };
                  }) => setSearch(e.target.value)}
                  className="pr-12 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-base"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-[220px] h-12 bg-background/50 border-border/50 hover:border-primary/50 transition-all">
                  <Filter className="ml-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="كل الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الفئات</SelectItem>
                  <SelectItem value="تاريخ">تاريخ</SelectItem>
                  <SelectItem value="روايات">روايات</SelectItem>
                  <SelectItem value="دين">دين</SelectItem>
                  <SelectItem value="سياسة">سياسة</SelectItem>
                  <SelectItem value="تطوير ذات">تطوير ذات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="bg-muted/50 rounded-2xl h-[400px] border border-border/50" />
                </div>
              ))}
            </div>
          </div>
        ) : books.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book, index) => (
                <div
                  key={book.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BookCard
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    category={book.category}
                    coverImage={book.coverImage}
                    isAvailable={isAvailable(book)}
                    contributorName={book.contributor?.name}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-20 animate-fade-in">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 border border-border/50">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground">
              لم يتم العثور على كتب
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              جرب البحث بكلمات مختلفة أو تصفح جميع الفئات
            </p>
            <Button
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              variant="outline"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              إعادة تعيين الفلاتر
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
