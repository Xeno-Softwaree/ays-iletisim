import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const idSchema = z.string().uuid();

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Correct type for Next.js 15+ dynamic routes
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { id: rawId } = await params;
        const idParse = idSchema.safeParse(rawId);
        if (!idParse.success) {
            return NextResponse.json({ message: 'Geçersiz adres ID formatı' }, { status: 400 });
        }
        const id = idParse.data;

        const body = await req.json();
        const { title, fullName, phone, city, district, openAddress, isDefault } = body;

        // Ensure isDefault is explicitly a boolean to prevent object injection here too
        const safeIsDefault = typeof isDefault === 'boolean' ? isDefault : false;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });

        // Verify ownership
        const existingAddress = await prisma.address.findFirst({
            where: { id, userId: user.id }
        });

        if (!existingAddress) {
            return NextResponse.json({ message: 'Adres bulunamadı' }, { status: 404 });
        }

        // If setting as default, unset others first
        if (safeIsDefault) {
            await prisma.address.updateMany({
                where: { userId: user.id, id: { not: id } },
                data: { isDefault: false }
            });
        }

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: {
                title,
                fullName,
                phone,
                city,
                district,
                openAddress,
                isDefault: safeIsDefault
            }
        });

        return NextResponse.json(updatedAddress);
    } catch (error) {
        console.error('Address update error:', error);
        return NextResponse.json({ message: 'Adres güncellenirken hata oluştu' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { id: rawId } = await params;
        const idParse = idSchema.safeParse(rawId);
        if (!idParse.success) {
            return NextResponse.json({ message: 'Geçersiz adres ID formatı' }, { status: 400 });
        }
        const id = idParse.data;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });

        // Delete (only if belongs to user)
        await prisma.address.deleteMany({
            where: { id, userId: user.id }
        });

        return NextResponse.json({ message: 'Adres silindi' });
    } catch (error) {
        return NextResponse.json({ message: 'Adres silinirken hata oluştu' }, { status: 500 });
    }
}
