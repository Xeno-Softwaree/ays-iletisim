import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const slides = await prisma.showcase.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(slides);
    } catch (error) {
        return NextResponse.json({ error: 'Slaytlar getirilemedi' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, imageUrl, linkUrl, isActive } = body;

        const slide = await prisma.showcase.create({
            data: {
                title,
                description,
                imageUrl,
                linkUrl,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json(slide);
    } catch (error) {
        return NextResponse.json({ error: 'Slayt oluşturulamadı' }, { status: 500 });
    }
}
