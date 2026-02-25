import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: 'Oturum açmanız gerekiyor.' }, { status: 401 });
        }

        const body = await req.json();
        const { items, shipping, paymentMethod, contracts, turnstileToken } = body;

        const isHuman = await verifyTurnstile(turnstileToken);
        if (!isHuman) {
            return NextResponse.json({ message: 'Güvenlik doğrulaması başarısız.' }, { status: 400 });
        }

        // Contract Validation (Backend)
        if (!contracts || !contracts.distanceSalesAccepted || !contracts.preInfoAccepted) {
            return NextResponse.json({ message: 'Sözleşmeleri onaylamanız gerekiyor.' }, { status: 400 });
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ message: 'Sepetiniz boş.' }, { status: 400 });
        }

        if (!shipping || !shipping.fullName || !shipping.phone || !shipping.address || !shipping.city) {
            return NextResponse.json({ message: 'Teslimat bilgileri eksik.' }, { status: 400 });
        }

        // Validate items and calculate total securely
        let totalAmount = 0;
        const validItems: { productId: string; quantity: number; price: number }[] = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.id },
            });

            if (!product) {
                return NextResponse.json({ message: `Ürün bulunamadı: ${item.name}` }, { status: 404 });
            }

            if (product.stock < item.quantity) {
                return NextResponse.json({ message: `Yetersiz stok: ${product.name} (Kalan: ${product.stock})` }, { status: 400 });
            }

            // Price from DB
            const price = Number(product.price);
            totalAmount += price * item.quantity;

            validItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: price,
            });
        }

        // Check Coupon
        let discountAmount = 0;
        let finalTotal = totalAmount;
        let validCoupon = null;

        if (body.couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: body.couponCode }
            });

            if (coupon && coupon.isActive) {
                // Validate expiry
                if (!coupon.expirationDate || new Date(coupon.expirationDate) > new Date()) {
                    // Validate usage limit
                    if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
                        // Validate min amount
                        if (!coupon.minOrderAmount || Number(coupon.minOrderAmount) <= totalAmount) {
                            validCoupon = coupon;

                            // Calculate discount
                            if (coupon.discountType === 'PERCENTAGE') {
                                discountAmount = (totalAmount * Number(coupon.discountValue)) / 100;
                            } else {
                                discountAmount = Number(coupon.discountValue);
                            }

                            if (discountAmount > totalAmount) discountAmount = totalAmount;
                            finalTotal = totalAmount - discountAmount;
                        }
                    }
                }
            }
        }

        // Create Order Transaction
        const order = await prisma.$transaction(async (tx) => {
            // 1. Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId: session.user?.id as string,
                    fullName: shipping.fullName,
                    phone: shipping.phone,
                    address: shipping.address,
                    city: shipping.city,
                    paymentMethod: paymentMethod,
                    totalAmount: finalTotal,
                    couponCode: validCoupon?.code,
                    discountAmount: discountAmount,
                    status: 'PENDING',
                    distanceSalesAccepted: contracts.distanceSalesAccepted,
                    preInfoAccepted: contracts.preInfoAccepted,
                    kvkkRead: contracts.kvkkRead,
                    contractsAcceptedAt: new Date(contracts.acceptedAt),
                    contractsAcceptedIp: ip,
                    contractsAcceptedUserAgent: userAgent,
                    items: {
                        create: validItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
            });

            // 2. Decrement Stock
            for (const item of validItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            // 3. Increment Coupon Usage
            if (validCoupon) {
                await tx.coupon.update({
                    where: { id: validCoupon.id },
                    data: { usedCount: { increment: 1 } }
                });
            }

            return newOrder;
        });

        return NextResponse.json({ orderId: order.id, message: 'Sipariş başarıyla oluşturuldu.' });

    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json({ message: 'Sipariş oluşturulurken bir hata oluştu.' }, { status: 500 });
    }
}
