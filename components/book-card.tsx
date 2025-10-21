import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, User } from "lucide-react";
import Link from "next/link";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  category: string;
  coverImage: string | null;
  isAvailable: boolean;
  contributorName?: string;
}

export function BookCard({
  id,
  title,
  author,
  category,
  coverImage,
  isAvailable,
  contributorName,
}: BookCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
        {coverImage ? (
          <img
            src={coverImage || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
            <BookOpen className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge
            variant={isAvailable ? "default" : "secondary"}
            className={
              isAvailable
                ? "bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm"
                : "bg-secondary/90 text-secondary-foreground shadow-lg backdrop-blur-sm"
            }
          >
            {isAvailable ? "متاح" : "محجوز"}
          </Badge>
        </div>
      </div>
      <CardContent className="flex-1 p-5 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            {author}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            {category}
          </Badge>
          {contributorName && (
            <span className="text-xs text-muted-foreground">
              • {contributorName}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button
          asChild
          className="w-full"
          variant={isAvailable ? "default" : "outline"}
        >
          <Link href={`/books/${id}`}>عرض التفاصيل</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
