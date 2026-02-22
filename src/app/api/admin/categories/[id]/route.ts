import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        // Check for subcategories
        const subcategoriesCount = await prisma.category.count({
            where: { parentId: id }
        });

        if (subcategoriesCount > 0) {
            return NextResponse.json({
                success: false,
                error: 'Bu kategoriye bağlı alt kategoriler bulunduğu için silinemez. Önce alt kategorileri silin veya başka bir kategoriye taşıyın.'
            }, { status: 400 });
        }

        // Check for products
        const productsCount = await prisma.product.count({
            where: { categoryId: id }
        });

        if (productsCount > 0) {
            return NextResponse.json({
                success: false,
                error: 'Bu kategoriye bağlı ürünler bulunduğu için silinemez. Önce ürünleri başka bir kategoriye taşıyın veya silin.'
            }, { status: 400 });
        }

        await prisma.category.delete({
            where: { id },
        });
        return NextResponse.json({ success: true, message: 'Kategori silindi' });
    } catch (error) {
        console.error('Category delete error:', error);
        return NextResponse.json({ success: false, error: 'Kategori silinirken beklenmedik bir hata oluştu.' }, { status: 500 });
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
        const { name, description, parentId, order } = body;

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                slug: `${slug}-${Date.now()}`,
                description,
                parentId: parentId || null,
                order: order ? parseInt(order.toString(), 10) : 0,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: 'Kategori güncellenemedi' }, { status: 500 });
    }
}
