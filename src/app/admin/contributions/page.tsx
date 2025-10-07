"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, User, Calendar } from "lucide-react";
import { toast } from "sonner";

type Contribution = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  book: {
    title: string;
    author: string;
    category: string;
  };
};

export default function AdminContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch("/api/admin/contributions");
        if (!response.ok) throw new Error("Failed to fetch contributions");
        const data = await response.json();
        setContributions(data.contributions || []);
      } catch (error) {
        toast.error("فشل في تحميل المساهمات");
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20">
            مقبولة
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-500/20">
            مرفوضة
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-500/20">
            قيد المراجعة
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">المساهمات</h1>
          <p className="text-muted-foreground mt-1">
            جميع مساهمات الكتب من الطلاب ({contributions.length})
          </p>
        </div>
      </div>

      {/* Contributions Grid */}
      {contributions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">لا توجد مساهمات</CardTitle>
            <CardDescription className="text-center">
              لم يقم أي طالب بإضافة كتب حتى الآن
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributions.map((contribution) => (
            <Card
              key={contribution.id}
              className="hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {contribution.book.title}
                  </CardTitle>
                  {getStatusBadge(contribution.status)}
                </div>
                <CardDescription className="line-clamp-1">
                  {contribution.book.author}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Book Category */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{contribution.book.category}</span>
                </div>

                {/* Contributor Info */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {contribution.user.name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contribution.user.email}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(contribution.createdAt), "dd MMMM yyyy", {
                      locale: ar,
                    })}
                  </span>
                </div>

                {/* Note if exists */}
                {contribution.note && (
                  <div className="bg-blue-50 border-r-4 border-blue-500 p-3 rounded">
                    <p className="text-sm text-blue-900">{contribution.note}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
