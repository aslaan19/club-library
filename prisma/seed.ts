// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

import { BookStatus } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء إضافة البيانات التجريبية...')

  // 1. إنشاء Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@waaeen.com' },
    update: {},
    create: {
      id: 'admin-seed-001',
      email: 'admin@waaeen.com',
      name: ' ASLAN the Admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ تم إنشاء حساب الأدمن:', admin.email)

  // 2. إنشاء طلاب تجريبيين
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'waleed@student.com' },
      update: {},
      create: {
        id: 'student-waleed',
        email: 'waleed@student.com',
        name: 'وليد',
        role: 'STUDENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'rakan@student.com' },
      update: {},
      create: {
        id: 'student-rakan',
        email: 'rakan@student.com',
        name: 'راكان',
        role: 'STUDENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'abdullah@student.com' },
      update: {},
      create: {
        id: 'student-abdullah',
        email: 'abdullah@student.com',
        name: 'عبدالله',
        role: 'STUDENT',
      },
    }),
    prisma.user.upsert({
      where: { email: 'iyad@student.com' },
      update: {},
      create: {
        id: 'student-iyad',
        email: 'iyad@student.com',
        name: 'إياد',
        role: 'STUDENT',
      },
    }),
  ])
  console.log('✅ تم إنشاء', students.length, 'طلاب')

  const books = [
    {
      title: 'البداية والنهاية',
      author: 'ابن كثير',
      description: 'كتاب تاريخي موسوعي يتناول التاريخ الإسلامي من بدء الخلق إلى نهاية الزمان',
      category: 'تاريخ',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      status: BookStatus.AVAILABLE,
      contributorId: students[0].id, // وليد
    },
    {
      title: '1984',
      author: 'George Orwell',
      description: 'رواية ديستوبية تصور مجتمعًا شموليًا يخضع لرقابة صارمة من الحكومة',
      category: 'روايات',
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      status: BookStatus.AVAILABLE,
      contributorId: students[1].id, // راكان
    },
    {
      title: 'مختصر صحيح البخاري',
      author: 'الإمام البخاري',
      description: 'أصح كتب الحديث النبوي الشريف',
      category: 'دين',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      status: BookStatus.AVAILABLE,
      contributorId: students[2].id, // عبدالله
    },
    {
      title: 'الأمير',
      author: 'نيكولو مكيافيلي',
      description: 'كتاب سياسي كلاسيكي يتناول فن الحكم والسياسة',
      category: 'سياسة',
      coverImage: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=400',
      status: BookStatus.AVAILABLE,
    },
    {
      title: 'العادات السبع للناس الأكثر فعالية',
      author: 'ستيفن كوفي',
      description: 'دليل عملي لتطوير الذات وتحقيق النجاح',
      category: 'تطوير ذات',
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
      status: BookStatus.AVAILABLE,
      contributorId: students[3].id, // إياد
    },
  ]
  

  for (const book of books) {
    await prisma.book.create({ data: book })
    console.log('✅ تم إضافة كتاب:', book.title)
  }

  console.log('🎉 تمت إضافة البيانات التجريبية بنجاح!')
  console.log('\n📊 الإحصائيات:')
  console.log('- المستخدمين:', await prisma.user.count())
  console.log('- الكتب:', await prisma.book.count())
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })