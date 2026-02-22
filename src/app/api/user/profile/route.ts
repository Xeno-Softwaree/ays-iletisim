import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Giriş yapmalısınız.' }, { status: 401 });
    }

    try {
        const { fullName, phone } = await req.json();

        if (!fullName || fullName.trim().length < 2) {
            return NextResponse.json({ message: 'Ad Soyad en az 2 karakter olmalıdır.' }, { status: 400 });
        }

        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                fullName: fullName.trim(),
                phone: phone?.trim() || null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[PATCH /api/user/profile]', error);
        return NextResponse.json({ message: 'Güncelleme başarısız.' }, { status: 500 });
    }
}
