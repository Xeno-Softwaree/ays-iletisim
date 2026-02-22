import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        await prisma.showcase.delete({
            where: { id },
        });
        return NextResponse.json({ success: true, message: 'Slayt silindi' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Silme işlemi başarısız' }, { status: 500 });
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

        // Separate data for cleaner update
        const { title, description, imageUrl, linkUrl, isActive, order } = body;

        const updatedSlide = await prisma.showcase.update({
            where: { id },
            data: {
                title,
                description,
                imageUrl,
                linkUrl,
                isActive,
                order,
            },
        });

        return NextResponse.json(updatedSlide);
    } catch (error) {
        return NextResponse.json({ error: 'Slayt güncellenemedi' }, { status: 500 });
    }
}
