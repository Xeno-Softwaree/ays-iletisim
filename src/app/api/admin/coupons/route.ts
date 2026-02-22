import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const coupons = await (prisma as any).coupon.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ success: true, data: coupons });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, discountType, discountValue, minOrderAmount, expirationDate, usageLimit, isActive } = body;

        if (!code || !discountType || discountValue == null) {
            return NextResponse.json({ success: false, error: 'Gerekli alanlar eksik' }, { status: 400 });
        }

        const coupon = await (prisma as any).coupon.create({
            data: { code, discountType, discountValue, minOrderAmount, expirationDate, usageLimit, isActive: isActive ?? true }
        });
        return NextResponse.json({ success: true, data: coupon });
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ success: false, error: 'Bu kupon kodu zaten mevcut.' }, { status: 409 });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
