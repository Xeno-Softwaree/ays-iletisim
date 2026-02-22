import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 60; // cache 60s, auto-refresh

export async function GET() {
    try {
        // Fetch only root categories (no parent) with their children
        const categories = await prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: {
                    orderBy: [
                        { order: 'asc' },
                        { name: 'asc' }
                    ]
                },
            },
            orderBy: [
                { order: 'asc' },
                { name: 'asc' }
            ]
        });
        return NextResponse.json(categories);
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}
