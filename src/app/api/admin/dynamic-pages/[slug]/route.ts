import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const page = await prisma.dynamicPage.findUnique({
            where: { slug }
        });

        if (!page) {
            return NextResponse.json({ success: false, message: 'Sayfa bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: page });
    } catch (error: any) {
        console.error('GET DynamicPage Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const body = await request.json();
        logger.info('PUT DynamicPage request:', { slug, body });
        const { title, content, isActive } = body;

        const page = await prisma.dynamicPage.update({
            where: { slug },
            data: { title, content, isActive }
        });

        return NextResponse.json({ success: true, data: page });
    } catch (error: any) {
        console.error('PUT DynamicPage Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        await prisma.dynamicPage.delete({
            where: { slug }
        });
        return NextResponse.json({ success: true, message: 'Sayfa silindi' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
