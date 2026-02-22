import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const page = await prisma.dynamicPage.findUnique({
            where: { slug, isActive: true },
            select: { title: true, content: true, updatedAt: true }
        });

        if (!page) {
            return NextResponse.json({ success: false, message: 'Sayfa bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: page });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
