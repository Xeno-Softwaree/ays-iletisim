import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendTradeInStatusEmail } from '@/lib/brevo';

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { success: false, message: 'Durum bilgisi gerekli' },
                { status: 400 }
            );
        }

        const updatedRequest = await prisma.tradeInRequest.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json({
            success: true,
            message: 'Talep durumu güncellendi',
            data: updatedRequest,
        });
    } catch (error) {
        console.error('TRADE_IN_UPDATE_ERROR:', error);
        return NextResponse.json(
            { success: false, message: 'Güncelleme başarısız' },
            { status: 500 }
        );
    }
}
