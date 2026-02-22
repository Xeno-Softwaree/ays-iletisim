'use server';

import { prisma } from '@/lib/prisma';

export async function getBrands() {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' },
        });
        return brands;
    } catch (error) {
        console.error('Failed to fetch brands:', error);
        return [];
    }
}
