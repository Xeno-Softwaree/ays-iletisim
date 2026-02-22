import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        // Prevent deleting self (would need session check, skipping for now as minimal viable)
        // ideally check if user exists first

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        // Likely foreign key constraint if user has orders
        return NextResponse.json({ error: 'Kullanıcı silinemedi (Siparişleri olabilir)' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();
        const { isAdmin } = body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { isAdmin },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
    }
}
