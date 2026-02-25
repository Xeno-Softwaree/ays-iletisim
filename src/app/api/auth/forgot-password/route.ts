import { prisma } from '@/lib/prisma';
import { sendResetPasswordEmail } from '@/lib/brevo';
import { NextResponse } from 'next/server';
import { generateResetToken, hashToken } from '@/lib/auth-utils';
import { verifyTurnstile } from '@/lib/turnstile';
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
            return NextResponse.json({ error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' }, { status: 429 });
        }

        const { email, turnstileToken } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'E-posta adresi gerekli' }, { status: 400 });
        }

        const isHuman = await verifyTurnstile(turnstileToken);
        if (!isHuman) {
            return NextResponse.json({ error: 'Güvenlik doğrulaması başarısız' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Security: Always return success-like message even if user doesn't exist
        const successResponse = { message: 'Eğer bu e-posta ile kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderilecektir.' };

        if (!user) {
            return NextResponse.json(successResponse);
        }

        // Generate secure token
        const token = generateResetToken();
        const hashedToken = hashToken(token);
        const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        // Save hashed token to user
        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordTokenHash: hashedToken,
                resetPasswordTokenExpires: expires
            }
        });

        // Send email with the RAW token (user needs this to verify via hash)
        try {
            await sendResetPasswordEmail({ email, token });
        } catch (mailError) {
            console.error('Failed to send reset email:', mailError);
            return NextResponse.json({ error: 'E-posta servisi şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.' }, { status: 503 });
        }

        return NextResponse.json(successResponse);
    } catch (error) {
        console.error('Forgot password internal error:', error);
        return NextResponse.json({ error: 'Beklenmedik bir hata oluştu.' }, { status: 500 });
    }
}
