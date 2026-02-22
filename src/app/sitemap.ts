import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://aysiletisim.com';

    // Static pages
    const routes = [
        '',
        '/urunler',
        '/eskiyi-getir',
        '/iletisim',
        '/hakkimizda',
        '/sss',
        '/gizlilik',
        '/iade-kosullari',
        '/kullanim-kosullari',
        '/kvkk',
        '/siparis-takip',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic products
    const products = await prisma.product.findMany({
        select: { slug: true, updatedAt: true },
    });

    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/urunler/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...productRoutes];
}
