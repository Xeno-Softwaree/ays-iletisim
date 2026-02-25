import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { hashToken } from '@/lib/auth-utils';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(req: Request) {
    try {
        const { token, password, turnstileToken } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Tüm alanlar gereklidir' }, { status: 400 });
        }

        const isHuman = await verifyTurnstile(turnstileToken);
        if (!isHuman) {
            return NextResponse.json({ error: 'Güvenlik doğrulaması başarısız' }, { status: 400 });
        }

        // Hash the incoming RAW token to compare with the one in DB
        const hashedToken = hashToken(token);

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordTokenHash: hashedToken,
                resetPasswordTokenExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş bağlantı' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordTokenHash: null,
                resetPasswordTokenExpires: null
            }
        });

        return NextResponse.json({ message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
    }
}
