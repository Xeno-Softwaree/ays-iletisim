import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        const slides = await prisma.showcase.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(slides);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}
