import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const pages = [
        {
            slug: 'mesafeli-satis-sozlesmesi',
            title: 'Mesafeli Satış Sözleşmesi',
            content: '<h1>Mesafeli Satış Sözleşmesi</h1><p>İçerik buraya gelecek...</p>',
            isActive: true
        },
        {
            slug: 'on-bilgilendirme-formu',
            title: 'Ön Bilgilendirme Formu',
            content: '<h1>Ön Bilgilendirme Formu</h1><p>İçerik buraya gelecek...</p>',
            isActive: true
        },
        {
            slug: 'cerez-politikasi',
            title: 'Çerez Politikası',
            content: '<h1>Çerez Politikası</h1><p>İçerik buraya gelecek...</p>',
            isActive: true
        }
    ];

    console.log('Yeni sayfalar oluşturuluyor...');

    for (const page of pages) {
        await prisma.dynamicPage.upsert({
            where: { slug: page.slug },
            update: {},
            create: page
        });
    }

    console.log('Seeding tamamlandı! ✅');
}

main()
    .catch((e) => {
        console.error('Seed Hatası:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
