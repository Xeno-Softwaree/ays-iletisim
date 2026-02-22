import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/brevo';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email gereklidir.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ success: false, message: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({ success: false, message: 'Hesap zaten doğrulanmış.' }, { status: 400 });
        }

        const verificationToken = await generateVerificationToken(email);
        const mailResult = await sendVerificationEmail({
            email: verificationToken.email,
            token: verificationToken.token,
        });

        if (!mailResult.success) {
            return NextResponse.json({ success: false, message: 'Mail gönderilemedi.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Kod tekrar gönderildi.' });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Bir hata oluştu.' }, { status: 500 });
    }
}
