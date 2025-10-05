"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitPullRequest, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Contribution = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    email: string;
  };
  book: {
    title: string;
    author: string;
  };
};

export default function AdminContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch(
          `/api/admin/contributions?status=${filter}`
        );
        if (!response.ok) throw new Error("Failed to fetch contributions");
        const data = await response.json();
        setContributions(data.contributions || []);
      } catch (error) {
        alert("فشل في تحميل المساهمات")
        
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [filter]);

  const handleStatusUpdate = async (
    id: string,
    status: "APPROVED" | "REJECTED",
    bookTitle: string
  ) => {
    const action = status === "APPROVED" ? "قبول" : "رفض";
    if (!confirm(`هل تريد ${action} مساهمة الكتاب "${bookTitle}"؟`)) return;

    try {
      const response = await fetch(`/api/admin/contributions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update contribution status");

      const updatedContribution = await response.json();
      setContributions(
        contributions.map((contribution) =>
          contribution.id === id ? updatedContribution : contribution
        )
      );

      alert(`تم ${action} المساهمة بنجاح`);
    } catch (error) {
      console.error("Failed to update contribution status:", error);
      alert(`فشل في ${action} المساهمة`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const pendingCount = contributions.filter(
    (c) => c.status === "PENDING"
  ).length;
  const approvedCount = contributions.filter(
    (c) => c.status === "APPROVED"
  ).length;
  const rejectedCount = contributions.filter(
    (c) => c.status === "REJECTED"
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">إدارة المساهمات</h1>
        <p className="text-muted-foreground mt-1">
          مراجعة وقبول مساهمات الكتب من المستخدمين
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              بانتظار المراجعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              المقبولة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              المرفوضة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contributions Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المساهمات</CardTitle>
          <CardDescription>
            جميع مساهمات الكتب المقدمة من المستخدمين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={filter}
            onValueChange={(v: string) => setFilter(v as typeof filter)}
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="ALL">الكل</TabsTrigger>
              <TabsTrigger value="PENDING">معلقة</TabsTrigger>
              <TabsTrigger value="APPROVED">مقبولة</TabsTrigger>
              <TabsTrigger value="REJECTED">مرفوضة</TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              {contributions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <GitPullRequest className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد مساهمات</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الكتاب</TableHead>
                        <TableHead className="text-right">المساهم</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contributions.map((contribution) => (
                        <TableRow
                          key={contribution.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {contribution.book.title}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {contribution.book.author}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {contribution.user.email}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(
                              new Date(contribution.createdAt),
                              "d MMM yyyy",
                              {
                                locale: ar,
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                contribution.status === "APPROVED"
                                  ? "bg-success/10 text-success border-success/20"
                                  : contribution.status === "REJECTED"
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : "bg-warning/10 text-warning border-warning/20"
                              }
                            >
                              {contribution.status === "APPROVED" ? (
                                <>
                                  <CheckCircle className="h-3 w-3 ml-1" />
                                  مقبولة
                                </>
                              ) : contribution.status === "REJECTED" ? (
                                <>
                                  <XCircle className="h-3 w-3 ml-1" />
                                  مرفوضة
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 ml-1" />
                                  معلقة
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {contribution.status === "PENDING" && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      contribution.id,
                                      "APPROVED",
                                      contribution.book.title
                                    )
                                  }
                                  className="hover:bg-success/10 hover:text-success hover:border-success"
                                >
                                  قبول
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      contribution.id,
                                      "REJECTED",
                                      contribution.book.title
                                    )
                                  }
                                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                                >
                                  رفض
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
