import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 60 * 1000,
});

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
        try {
            await limiter.check(10, ip);
        } catch {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const body = await req.json();
        const { code, cartTotal } = body;

        if (!code) {
            return NextResponse.json({ error: "Kupon kodu giriniz." }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code }
        });

        if (!coupon) {
            return NextResponse.json({ error: "Geçersiz kupon kodu." }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: "Bu kupon pasif durumda." }, { status: 400 });
        }

        if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
            return NextResponse.json({ error: "Bu kuponun süresi dolmuş." }, { status: 400 });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ error: "Bu kuponun kullanım limiti dolmuş." }, { status: 400 });
        }

        if (coupon.minOrderAmount && Number(coupon.minOrderAmount) > Number(cartTotal)) {
            return NextResponse.json({ error: `Bu kuponu kullanmak için sepet tutarı en az ${coupon.minOrderAmount} TL olmalıdır.` }, { status: 400 });
        }

        let discountAmount = 0;
        const total = Number(cartTotal);
        const value = Number(coupon.discountValue);

        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (total * value) / 100;
        } else {
            discountAmount = value;
        }

        // Ensure discount doesn't exceed total
        if (discountAmount > total) {
            discountAmount = total;
        }

        return NextResponse.json({
            valid: true,
            code: coupon.code,
            discountAmount,
            newTotal: total - discountAmount,
            type: coupon.discountType,
            value: Number(coupon.discountValue)
        });

    } catch (error) {
        console.error('[COUPON_VERIFY]', error);
        return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }
}
