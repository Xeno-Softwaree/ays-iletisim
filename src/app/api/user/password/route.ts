import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Giriş yapmalısınız.' }, { status: 401 });
    }

    try {
        const { currentPassword, newPassword } = await req.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ message: 'Yeni şifre en az 6 karakter olmalıdır.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user?.password) {
            return NextResponse.json({ message: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ message: 'Mevcut şifre yanlış.' }, { status: 400 });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashed },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[PATCH /api/user/password]', error);
        return NextResponse.json({ message: 'Şifre değiştirme başarısız.' }, { status: 500 });
    }
}
