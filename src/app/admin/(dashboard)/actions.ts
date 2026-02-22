'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const categoryId = formData.get('categoryId') as string;
    const brandId = formData.get('brandId') as string || null;
    const condition = formData.get('condition') as 'NEW' | 'USED';
    const imageUrl = formData.get('imageUrl') as string;
    const batteryHealth = formData.get('batteryHealth') ? parseInt(formData.get('batteryHealth') as string) : null;
    const warrantyStatus = formData.get('warrantyStatus') as string || null;
    const colorsRaw = formData.get('colors') as string;
    const colors = colorsRaw ? JSON.parse(colorsRaw) : [];
    const compareAtPriceRaw = formData.get('compareAtPrice') as string;
    const compareAtPrice = compareAtPriceRaw ? parseFloat(compareAtPriceRaw) : null;
    const isFeatured = formData.get('isFeatured') === 'on';

    if (!name || !price || !categoryId) {
        return { success: false, error: 'Eksik bilgi girdiniz.' };
    }

    // Slug oluştur (Basit versiyon)
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    try {
        await (prisma.product.create as any)({
            data: {
                name,
                slug: `${slug}-${Date.now()}`, // Benzersizlik için
                description,
                price,
                compareAtPrice,
                isFeatured,
                stock,
                categoryId,
                brandId,
                condition,
                batteryHealth,
                warrantyStatus,
                colors: colors.length > 0 ? colors : undefined,
                images: imageUrl ? [imageUrl] : [],
            },
        });


        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        console.error('Ürün oluşturma hatası:', error);
        return { success: false, error: 'Ürün oluşturulurken bir hata oluştu.' };
    }
}


export async function getCategories() {
    return await prisma.category.findMany();
}
