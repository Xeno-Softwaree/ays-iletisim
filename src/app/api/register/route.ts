import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/brevo';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(req: Request) {
    try {
        const { fullName, email, password, phone, turnstileToken } = await req.json();

        // Validate Turnstile
        const isHuman = await verifyTurnstile(turnstileToken);
        if (!isHuman) {
            return NextResponse.json(
                { success: false, message: 'Doğrulama başarısız.' },
                { status: 400 }
            );
        }

        // Validate
        if (!email || !password || !phone) {
            return NextResponse.json(
                { success: false, message: 'Email, şifre ve telefon zorunludur.' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'Bu email ile zaten bir kayıt var.' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                phone,
                isAdmin: false, // Default to USER
                isVerified: false,
            },
        });

        // OTP Process
        try {
            const verificationToken = await generateVerificationToken(email);
            const mailResult = await sendVerificationEmail({
                email: verificationToken.email,
                token: verificationToken.token,
            });

            if (!mailResult.success) {
                console.error("Mail sending failed:", mailResult.error);
                // We typically don't fail registration if mail fails, but we should log it.
                // Or we can return a specific warning.
            }
        } catch (otpError) {
            console.error("OTP Generation Error:", otpError);
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
        });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { success: false, message: 'Kayıt işlemi sırasında bir hata oluştu.' },
            { status: 500 }
        );
    }
}
