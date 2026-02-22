import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    const categories = [
        { name: 'Cep Telefonları', slug: 'cep-telefonlari', description: 'En yeni akıllı telefonlar' },
        { name: 'Aksesuarlar', slug: 'aksesuarlar', description: 'Kılıf, ekran koruyucu, şarj aleti vb.' },
        { name: 'Küçük Ev Aletleri', slug: 'kucuk-ev-aletleri', description: 'Robot süpürge, kahve makinesi vb.' },
    ];

    try {
        for (const cat of categories) {
            await prisma.category.upsert({
                where: { slug: cat.slug },
                update: {},
                create: cat,
            });
        }
        return NextResponse.json({ message: 'Kategoriler başarıyla eklendi!', success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Bir hata oluştu', error }, { status: 500 });
    }
}
