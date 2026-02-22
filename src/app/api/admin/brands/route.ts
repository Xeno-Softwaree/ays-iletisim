import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { products: true } } }
        });
        return NextResponse.json(brands);
    } catch (error) {
        return NextResponse.json({ error: 'Markalar getirilemedi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, logoUrl } = body;

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const brand = await prisma.brand.create({
            data: {
                name,
                slug: `${slug}-${Date.now()}`,
                logoUrl,
            },
        });

        return NextResponse.json({ success: true, brand });
    } catch (error) {
        console.error('Brand Create Error:', error);
        return NextResponse.json({ success: false, error: 'Marka oluşturulamadı' }, { status: 500 });
    }
}
