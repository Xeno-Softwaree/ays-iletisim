import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.brand.delete({
            where: { id },
        });
        return NextResponse.json({ success: true, message: 'Marka silindi' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Silme işlemi başarısız', error }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updatedBrand = await prisma.brand.update({
            where: { id },
            data: {
                name: body.name,
                logoUrl: body.logoUrl,
            },
        });

        return NextResponse.json({ success: true, brand: updatedBrand });
    } catch (error) {
        console.error('Brand Update Error:', error);
        return NextResponse.json({ success: false, message: 'Güncelleme başarısız', error }, { status: 500 });
    }
}
