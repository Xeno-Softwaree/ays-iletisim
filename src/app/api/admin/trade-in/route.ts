import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const requests = await prisma.tradeInRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: requests });
    } catch (error) {
        console.error('TRADE_IN_GET_ERROR:', error);
        return NextResponse.json(
            { success: false, message: 'Talepler yüklenemedi' },
            { status: 500 }
        );
    }
}
