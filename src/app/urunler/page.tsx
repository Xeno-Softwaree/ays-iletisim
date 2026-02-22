import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Smartphone, Filter, ArrowUpDown } from 'lucide-react';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import ProductSort from '@/components/products/ProductSort';

export const revalidate = 60;

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage(props: Props) {
    const searchParams = await props.searchParams;

    // Parse search params
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const categorySlug = typeof searchParams.kategori === 'string' ? searchParams.kategori : undefined;
    const brandIds = typeof searchParams.marka === 'string' ? searchParams.marka.split(',') : undefined;
    const minPrice = typeof searchParams.minFiyat === 'string' ? Number(searchParams.minFiyat) : undefined;
    const maxPrice = typeof searchParams.maxFiyat === 'string' ? Number(searchParams.maxFiyat) : undefined;
    const sort = typeof searchParams.sirala === 'string' ? searchParams.sirala : 'newest';
    const stockStatus = typeof searchParams.stok === 'string' ? searchParams.stok === 'true' : undefined;
    const conditionParam = typeof searchParams.durum === 'string' ? searchParams.durum : undefined;

    // Build filter conditions
    const where: any = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { brand: { name: { contains: search, mode: 'insensitive' } } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
        ];
    }

    if (categorySlug) {
        const category = await prisma.category.findUnique({
            where: { slug: categorySlug },
            include: { children: true },
        });

        if (category) {
            // Include children categories in filter
            const categoryIds = [category.id, ...category.children.map(c => c.id)];
            where.categoryId = { in: categoryIds };
        }
    }

    if (brandIds && brandIds.length > 0) {
        where.brandId = { in: brandIds };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (stockStatus) {
        where.stock = { gt: 0 };
    }

    if (conditionParam === 'NEW' || conditionParam === 'USED') {
        where.condition = conditionParam;
    }

    // Determine sorting
    let orderBy: any = {};
    switch (sort) {
        case 'price_asc':
            orderBy = { price: 'asc' };
            break;
        case 'price_desc':
            orderBy = { price: 'desc' };
            break;
        case 'newest':
        default:
            orderBy = { createdAt: 'desc' };
            break;
    }

    // Fetch data
    const [products, categories, brands] = await Promise.all([
        prisma.product.findMany({
            where,
            include: { category: true, brand: true },
            orderBy,
        }),
        prisma.category.findMany({
            where: { parentId: null }, // Only top-level categories for filter
            include: { children: true },
        }),
        prisma.brand.findMany({
            orderBy: { name: 'asc' },
        }),
    ]);

    // Format products for grid
    const formattedProducts = products.map(p => ({
        ...p,
        price: Number(p.price),
    }));

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Link href="/" className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">Ana Sayfa</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Ürünler</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                            {search ? `"${search}"` : 'Tüm Ürünler'}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {formattedProducts.length} premium ürün bulundu
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block space-y-8">
                        <div className="sticky top-28 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                            <ProductFilters
                                categories={categories as any}
                                brands={brands}
                                selectedCategory={categorySlug}
                                selectedBrands={brandIds}
                                selectedMinPrice={minPrice}
                                selectedMaxPrice={maxPrice}
                                selectedStock={stockStatus}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main>
                        {/* Sorting & Filter Summary */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 lg:hidden">
                                    <Filter className="w-5 h-5 text-slate-600" />
                                </div>
                                <span className="text-slate-500 text-sm font-bold uppercase tracking-widest hidden sm:inline">Sıralama</span>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <ProductSort />
                            </div>
                        </div>

                        {formattedProducts.length === 0 ? (
                            <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                <Smartphone className="w-20 h-20 mx-auto mb-6 text-slate-200" />
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Ürün Bulunamadı</h3>
                                <p className="text-slate-500 font-medium">Seçtiğiniz filtrelere uygun ürün bulunmamaktadır.</p>
                                <Link href="/urunler" className="inline-block mt-8 text-blue-600 font-black hover:underline uppercase tracking-widest text-xs">Filtreleri Temizle</Link>
                            </div>
                        ) : (
                            <ProductGrid products={formattedProducts} />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
