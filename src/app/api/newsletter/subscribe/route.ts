import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return new NextResponse("Geçersiz e-posta adresi.", { status: 400 });
        }

        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existing) {
            return new NextResponse("Zaten abonesiniz.", { status: 400 });
        }

        await prisma.newsletterSubscriber.create({
            data: { email }
        });

        return new NextResponse("Abonelik başarılı.", { status: 200 });
    } catch (error) {
        console.error('[NEWSLETTER_SUBSCRIBE]', error);
        return new NextResponse("Sunucu hatası.", { status: 500 });
    }
}
