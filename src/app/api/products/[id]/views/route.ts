import { NextResponse } from 'next/server';

// In a real app we would use Redis (Upstash) to store daily views per product.
// Since we don't know the Redis setup, we will use a lightweight in-memory cache for demo purposes, 
// which resets on server restart but provides "real" fluctuating numbers during runtime.
// For production scale, replace `global.viewsCache` with a Redis Hash.

const globalAny = global as any;
if (!globalAny.viewsCache) {
    globalAny.viewsCache = {};
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const productId = resolvedParams.id;

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Initialize view count for product if it doesn't exist
        // Base it loosely on a small random number 5-15 + memory state to look active
        if (!globalAny.viewsCache[productId]) {
            globalAny.viewsCache[productId] = Math.floor(Math.random() * 10) + 5;
        }

        // Increment view count
        globalAny.viewsCache[productId] += 1;

        return NextResponse.json({
            productId,
            viewCount: globalAny.viewsCache[productId]
        });
    } catch (error) {
        console.error('Error incrementing view count:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
