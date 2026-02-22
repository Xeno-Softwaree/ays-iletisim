import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { sendShippingEmail } from '@/lib/brevo';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status, trackingNumber } = await request.json();

        if (!Object.values(OrderStatus).includes(status)) {
            return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status,
                trackingNumber: trackingNumber || undefined
            },
            include: { user: true }
        });

        // Send email if status is SHIPPED and tracking number exists
        if (status === 'SHIPPED' && trackingNumber) {
            const email = updatedOrder.user?.email || updatedOrder.guestEmail;
            const fullName = updatedOrder.user?.fullName || updatedOrder.fullName || 'Değerli Müşterimiz';

            if (email) {
                try {
                    await sendShippingEmail({
                        email,
                        fullName,
                        orderId: updatedOrder.id,
                        trackingNumber
                    });
                } catch (emailError) {
                    console.error('Failed to send shipping email:', emailError);
                    // We don't throw here to ensure the order update itself is confirmed to the admin
                }
            }
        }

        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        console.error('Order Update Error:', error);
        return NextResponse.json({
            error: 'Sipariş güncellenemedi',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
