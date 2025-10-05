"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, UsersIcon, Shield, User } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

 type User = {
   id: string
   email: string
   role: "STUDENT" | "ADMIN"
   createdAt: string
 }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        if (!response.ok) throw new Error("Failed to fetch users")
        const data = await response.json()
        setUsers(data)
        setFilteredUsers(data)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        alert("فشل في تحميل المستخدمين")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, )

  // Filter users based on search
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter((user) => user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const adminCount = users.filter((u) => u.role === "ADMIN").length
  const userCount = users.filter((u) => u.role === "STUDENT").length

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
        <p className="text-muted-foreground mt-1">
          {filteredUsers.length} من {users.length} مستخدم
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              إجمالي المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              المستخدمين العاديين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              المسؤولين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن مستخدم بالبريد الإلكتروني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>جميع المستخدمين المسجلين في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <UsersIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{searchQuery ? "لم يتم العثور على مستخدمين" : "لا يوجد مستخدمين"}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">تاريخ الانضمام</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "ADMIN" ? "default" : "secondary"}
                          className={
                            user.role === "ADMIN"
                              ? "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20"
                              : "bg-accent/10 text-accent hover:bg-accent/20 border-accent/20"
                          }
                        >
                          <Shield className="h-3 w-3 ml-1" />
                          {user.role === "ADMIN" ? "مسؤول" : "مستخدم"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.createdAt), "d MMMM yyyy", { locale: ar })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
