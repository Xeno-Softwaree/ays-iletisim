import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const pages = await prisma.dynamicPage.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        return NextResponse.json({ success: true, data: pages });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, slug, content, isActive } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ success: false, message: 'Eksik bilgi' }, { status: 400 });
        }

        const page = await prisma.dynamicPage.create({
            data: { title, slug, content, isActive: isActive ?? true }
        });

        return NextResponse.json({ success: true, data: page });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
