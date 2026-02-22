import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        const addresses = await prisma.address.findMany({
            where: {
                user: { email: session.user.email }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(addresses);
    } catch (error) {
        return NextResponse.json({ message: 'Adresler getirilirken hata oluştu' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
        }

        const body = await req.json();
        const { title, fullName, phone, city, district, openAddress } = body;

        // Get user ID based on email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        // Check if this is the first address, if so make it default
        const addressCount = await prisma.address.count({
            where: { userId: user.id }
        });

        const address = await prisma.address.create({
            data: {
                userId: user.id,
                title,
                fullName,
                phone,
                city,
                district,
                openAddress,
                isDefault: addressCount === 0 // First address is default
            }
        });

        return NextResponse.json(address);
    } catch (error) {
        console.error('Address create error:', error);
        return NextResponse.json({ message: 'Adres oluşturulurken hata oluştu' }, { status: 500 });
    }
}
