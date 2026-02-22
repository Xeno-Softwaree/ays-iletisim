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

        // Map Turkish DB statuses to Email hook statuses
        const statusMap: Record<string, string> = {
            'İnceleniyor': 'REVIEWING',
            'Onaylandı': 'APPROVED',
            'Reddedildi': 'REJECTED'
        };

        const emailStatus = statusMap[status];

        // Only send if the user provided an email and the status is email-worthy
        if (updatedRequest.customerEmail && emailStatus) {
            try {
                await sendTradeInStatusEmail({
                    email: updatedRequest.customerEmail,
                    fullName: updatedRequest.customerName || 'Değerli Müşterimiz',
                    deviceName: `${updatedRequest.brand} ${updatedRequest.model}`,
                    formId: updatedRequest.id,
                    newStatus: emailStatus,
                    finalPrice: updatedRequest.finalOffer ? Number(updatedRequest.finalOffer) : null
                });
            } catch (emailError) {
                console.error('Failed to send trade-in status email:', emailError);
            }
        }

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
