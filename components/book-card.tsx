import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, User } from "lucide-react"

interface BookCardProps {
  id: string
  title: string
  author: string
  category: string
  coverImage?: string | null
  isAvailable: boolean
  contributorName?: string
}

export function BookCard({ id, title, author, category, coverImage, isAvailable, contributorName }: BookCardProps) {
  return (
    <Link href={`/books/${id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full">
        <CardHeader className="p-0">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            {coverImage ? (
              <Image
                src={coverImage || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <StatusBadge status={isAvailable ? "available" : "borrowed"} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-2 text-balance">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{author}</p>
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </CardContent>
        {contributorName && (
          <CardFooter className="px-4 pb-4 pt-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>تطوع: {contributorName}</span>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}
