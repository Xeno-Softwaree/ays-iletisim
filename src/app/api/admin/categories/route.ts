import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: { parent: true },
            orderBy: [
                { order: 'asc' },
                { name: 'asc' }
            ],
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Kategoriler getirilemedi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, parentId, order } = body;

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const category = await prisma.category.create({
            data: {
                name,
                slug: `${slug}-${Date.now()}`,
                description,
                parentId: parentId || null,
                order: order ? parseInt(order.toString(), 10) : 0,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: 'Kategori oluşturulamadı' }, { status: 500 });
    }
}
