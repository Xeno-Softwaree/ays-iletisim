import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 60 * 1000,
});

export async function GET(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
        try {
            await limiter.check(30, ip);
        } catch {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.trim();
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!q || q.length < 2) {
            return NextResponse.json({ products: [] });
        }

        const products = await prisma.product.findMany({
            where: {
                AND: [
                    { stock: { gt: 0 } },
                    {
                        OR: [
                            { name: { contains: q, mode: 'insensitive' } },
                            { description: { contains: q, mode: 'insensitive' } },
                            { brand: { name: { contains: q, mode: 'insensitive' } } },
                            { category: { name: { contains: q, mode: 'insensitive' } } },
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                condition: true,
                brand: { select: { name: true } },
                category: { select: { name: true } },
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ products });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
