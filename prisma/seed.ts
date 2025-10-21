// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { booksData } from "./books";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 بدء إضافة البيانات التجريبية...");

  // Optional: clear old records first
  await prisma.book.deleteMany();
  console.log("🧹 تم حذف البيانات القديمة.");

  // Insert all books
  await prisma.book.createMany({
    data: booksData.map((book: { title: any; author: any; description: any; category: any; coverImage: any; }) => ({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      coverImage: book.coverImage,
    })),
  });

  console.log("✅ تم إدخال البيانات بنجاح!");
}

main()
  .catch((e) => {
    console.error("❌ خطأ:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
