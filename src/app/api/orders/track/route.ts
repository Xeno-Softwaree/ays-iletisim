import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, email } = body;

        if (!orderId || !email) {
            return new NextResponse("Sipariş numarası ve e-posta adresi gereklidir.", { status: 400 });
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                OR: [
                    { guestEmail: email },
                    { user: { email: email } }
                ]
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: true,
                                slug: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return new NextResponse("Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin.", { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('[ORDER_TRACK]', error);
        return new NextResponse("Sunucu hatası oluştu.", { status: 500 });
    }
}
