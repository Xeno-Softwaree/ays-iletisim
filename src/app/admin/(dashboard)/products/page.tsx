import { prisma } from '@/lib/prisma';
import { getBrands } from './get-brands-action';
import ProductsClient from './products-client';

export default async function ProductsPage() {
    const rawProducts = await prisma.product.findMany({
        include: { category: true, brand: true },
        orderBy: { createdAt: 'desc' },
    });

    // Serialize Decimal and Date objects for Client Component
    const products = rawProducts.map((product) => ({
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        colors: product.colors as { name: string; hex: string }[] | null,
        stock: product.stock,
        brandId: product.brandId,
        category: product.category,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
    }));

    const categories = await prisma.category.findMany();
    const brands = await getBrands();

    return <ProductsClient initialProducts={products} categories={categories} brands={brands} />;
}
