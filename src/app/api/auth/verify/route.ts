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
            await limiter.check(5, ip);
        } catch {
            return NextResponse.json({ success: false, message: 'Çok fazla deneme yaptınız.' }, { status: 429 });
        }

        const body = await req.json();
        const { email, token } = body;

        const verificationToken = await prisma.verificationToken.findUnique({
            where: {
                email_token: {
                    email,
                    token,
                },
            },
        });

        if (!verificationToken) {
            return NextResponse.json(
                { success: false, message: 'Geçersiz doğrulama kodu.' },
                { status: 400 }
            );
        }

        const hasExpired = new Date(verificationToken.expiresAt) < new Date();

        if (hasExpired) {
            return NextResponse.json(
                { success: false, message: 'Doğrulama kodunun süresi dolmuş.' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
            return NextResponse.json(
                { success: false, message: 'Kullanıcı bulunamadı.' },
                { status: 400 }
            );
        }

        await prisma.user.update({
            where: { email },
            data: {
                emailVerified: new Date(),
                isVerified: true,
            },
        });

        await prisma.verificationToken.delete({
            where: { id: verificationToken.id },
        });

        return NextResponse.json({ success: true, message: 'Email doğrulandı!' });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Bir hata oluştu.' },
            { status: 500 }
        );
    }
}
