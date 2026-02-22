import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Register for stock alert
export async function POST(request: Request) {
    try {
        const { email, productId } = await request.json();

        if (!email || !productId) {
            return NextResponse.json({ success: false, error: 'Email ve ürün ID gerekli' }, { status: 400 });
        }

        // Check product
        const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true, stock: true } });
        if (!product) return NextResponse.json({ success: false, error: 'Ürün bulunamadı' }, { status: 404 });
        if (product.stock > 0) return NextResponse.json({ success: false, error: 'Ürün zaten stokta mevcut' }, { status: 400 });

        // Upsert alert (ignore duplicate)
        await (prisma as any).stockAlert.upsert({
            where: { email_productId: { email, productId } },
            update: { isNotified: false },
            create: { email, productId },
        });

        return NextResponse.json({ success: true, message: `${product.name} tekrar stoka girdiğinde ${email} adresine bildirim göndereceğiz.` });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const alerts = await (prisma as any).stockAlert.findMany({
            include: { product: { select: { name: true } } }
        });
        return NextResponse.json({ success: true, alerts });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
