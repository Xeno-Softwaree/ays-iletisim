import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    Battery,
    Shield,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Smartphone,
    Sparkles,
    RefreshCw,
    Package,
    Tag,
    ChevronRight,
    Award,
    Truck,
    RotateCcw,
    CreditCard,
    ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import WhatsAppButton from './whatsapp-button';
import AddToCartButtons from './add-to-cart';
import ProductTabs from './product-tabs';
import ImageGallery from './image-gallery';
import ProductCard from '@/components/products/ProductCard';
import FavoriteButton from '@/components/products/FavoriteButton';
import dynamic from 'next/dynamic';

const ProductReviews = dynamic(() => import('@/components/products/ProductReviews'), {
    loading: () => <div className="w-full h-[300px] animate-pulse bg-slate-50 rounded-[2.5rem]"></div>
});
import SocialShare from './social-share';
import StockAlertButton from './stock-alert';
import TodayPurchasedCounter from './today-purchases-counter';
import RealViewerCounter from './real-viewer-counter';

const RecentlyViewed = dynamic(() => import('./recently-viewed'));

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            brand: true,
            reviews: {
                where: { isApproved: true }
            }
        },
    });

    if (!product) notFound();

    let settings = await prisma.settings.findFirst();
    if (!settings) {
        settings = await prisma.settings.create({
            data: {
                whatsappNumber: '+905551234567',
                defaultMessage: 'Merhaba, {productName} hakkında bilgi almak istiyorum.',
            },
        });
    }

    const whatsappMessage = settings.defaultMessage.replace('{productName}', product.name);
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
    const price = Number(product.price);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const compareAtPrice = (product as any).compareAtPrice ? Number((product as any).compareAtPrice) : null;
    const hasDiscount = compareAtPrice && compareAtPrice > price;
    const discountPercent = hasDiscount ? Math.round((1 - price / compareAtPrice!) * 100) : null;
    const isNew = product.condition === 'NEW';
    const inStock = product.stock > 0;

    // Calculate rating
    const reviewCount = product.reviews.length;
    const avgRating = reviewCount > 0
        ? (product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1)
        : '0.0';

    // Fetch related products from same category
    const related = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            NOT: { id: product.id },
            stock: { gt: 0 },
        },
        include: { brand: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
    });

    const batteryColor =
        (product.batteryHealth ?? 0) >= 85 ? 'text-emerald-400'
            : (product.batteryHealth ?? 0) >= 70 ? 'text-amber-400'
                : 'text-red-400';

    const batteryBarColor =
        (product.batteryHealth ?? 0) >= 85 ? 'bg-emerald-400'
            : (product.batteryHealth ?? 0) >= 70 ? 'bg-amber-400'
                : 'bg-red-400';

    // Spec rows — only show if value exists
    const specs: { label: string; value: string }[] = [
        { label: 'Marka', value: product.brand?.name ?? '' },
        { label: 'Kategori', value: product.category.name },
        { label: 'Durum', value: isNew ? 'Sıfır' : 'İkinci El' },
        { label: 'Garanti', value: product.warrantyStatus ?? '' },
        { label: 'Pil Sağlığı', value: product.batteryHealth ? `%${product.batteryHealth}` : '' },
        { label: 'Stok', value: `${product.stock} adet` },
    ].filter(s => s.value);

    return (
        <div className="bg-slate-50/50">
            <div className="relative z-10 max-w-6xl mx-auto px-4 lg:px-8 py-8 lg:py-16">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-12 overflow-x-auto scrollbar-hide">
                    <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 shrink-0">ANASAYFA</Link>
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-20" />
                    <Link href="/urunler" className="hover:text-blue-600 transition-colors shrink-0">ÜRÜNLER</Link>
                    {product.brand && (
                        <>
                            <ChevronRight className="w-3 h-3 shrink-0 opacity-20" />
                            <span className="text-slate-300 font-medium shrink-0 italic lowercase first-letter:uppercase">{product.brand.name}</span>
                        </>
                    )}
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-20" />
                    <span className="text-slate-900 truncate shrink-0">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start">
                    {/* LEFT SIDE: Image Gallery */}
                    <div className="relative">
                        <ImageGallery
                            images={product.images}
                            productName={product.name}
                            isNew={isNew}
                        />
                    </div>

                    {/* RIGHT SIDE: Product Info */}
                    <div className="lg:sticky lg:top-24 space-y-10">
                        <div className="space-y-6">
                            {/* 1. Brand Badge */}
                            {product.brand && (
                                <div className="inline-flex">
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
                                        {product.brand.name}
                                    </span>
                                </div>
                            )}

                            {/* 2. Title */}
                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-[1.15]">
                                {product.name}
                            </h1>

                            {/* 3. Rating Row */}
                            {reviewCount > 0 && (
                                <div className="flex items-center gap-4 py-1">
                                    <div className="flex items-center gap-0.5 text-amber-400">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Award key={i} className={cn("w-4 h-4", i <= Number(avgRating) ? "fill-current" : "text-slate-200")} />
                                        ))}
                                    </div>
                                    <span className="text-slate-900 font-bold text-sm">{avgRating}</span>
                                    <span className="text-slate-400 font-medium text-xs">({reviewCount} değerlendirme)</span>
                                </div>
                            )}

                            {/* 4. Stock Indicator */}
                            <div className="flex items-center gap-2.5">
                                <div className={cn(
                                    "w-2.5 h-2.5 rounded-full animate-pulse",
                                    inStock ? "bg-emerald-500" : "bg-red-500"
                                )} />
                                <span className={cn(
                                    "text-sm font-semibold",
                                    inStock ? "text-emerald-600" : "text-red-600"
                                )}>
                                    {inStock ? `Stokta – Son ${product.stock} Ürün` : "Stokta Yok"}
                                </span>
                            </div>

                            {/* 5. Price Block Card */}
                            <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-premium relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="relative space-y-6">
                                    <div className="flex items-baseline gap-4">
                                        <p className="text-5xl font-black text-slate-900 tracking-tighter">
                                            {new Intl.NumberFormat('tr-TR', {
                                                style: 'currency',
                                                currency: 'TRY',
                                                maximumFractionDigits: 0,
                                            }).format(price)}
                                        </p>
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">KDV Dahil</span>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <CreditCard className="w-4.5 h-4.5 text-blue-500" />
                                            <span className="text-sm font-medium">12 Aya Kadar Taksit</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Truck className="w-4.5 h-4.5 text-emerald-500" />
                                            <span className="text-sm font-medium">Ücretsiz Kargo</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Package className="w-4.5 h-4.5 text-amber-500" />
                                            <span className="text-sm font-medium">Yarın Kapında</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-100/60">
                                        <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                            <Shield className="w-4 h-4 text-blue-600 font-bold" />
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">256-bit SSL</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Güvenli Ödeme</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                            <RotateCcw className="w-4 h-4 text-purple-600" />
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Kolay İade</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA SECTION */}
                        <div className="space-y-6">
                            <AddToCartButtons
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price,
                                    image: product.images[0] ?? undefined,
                                    slug: product.slug,
                                    stock: product.stock,
                                    colors: (product.colors as unknown as { name: string; hex: string }[] | null) ?? [],
                                }}
                            />

                            <div className="space-y-4 text-center lg:text-left">
                                <RealViewerCounter productId={product.id} />
                                <TodayPurchasedCounter productId={product.id} />
                            </div>
                        </div>

                        {/* WhatsApp + Share row */}
                        <div className="grid grid-cols-[1fr_auto] gap-3">
                            <WhatsAppButton whatsappUrl={whatsappUrl} productName={product.name} />
                            <SocialShare productName={product.name} productSlug={product.slug} />
                        </div>

                        {/* Stock Alert - only show when out of stock */}
                        {!inStock && (
                            <StockAlertButton productId={product.id} productName={product.name} />
                        )}
                    </div>
                </div>

                {/* Horizontal Trust Row Below Hero */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 lg:py-20 animate-in fade-in duration-1000">
                    {[
                        { icon: Shield, label: '2 Yıl Garanti', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { icon: Truck, label: '24 Saatte Kargo', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { icon: RotateCcw, label: '14 Gün İade', color: 'text-purple-600', bg: 'bg-purple-50' },
                        { icon: CreditCard, label: 'Taksit İmkanı', color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map(({ icon: Icon, label, color, bg }) => (
                        <div key={label} className="bg-white border border-slate-200/60 p-5 rounded-[2rem] shadow-premium flex items-center gap-4 group hover:border-blue-500/30 transition-all duration-500">
                            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <span className="text-slate-900 text-xs font-black uppercase tracking-widest">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Tabs Section ─── */}
            <div className="border-t border-slate-100 bg-white">
                <div className="max-w-6xl mx-auto px-4 lg:px-8">
                    <ProductTabs productId={product.id} description={product.description} specs={specs} />
                </div>
            </div>

            {/* ─── Related Products ─── */}
            {related.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 lg:px-8 py-20 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">BUNLARI DA BEĞENEBİLİRSİNİZ</h2>
                            <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">İlginizi çekebilecek diğer ürünlerimiz</p>
                        </div>
                        <Link href="/urunler" className="text-blue-600 text-xs font-black uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                            Tümünü Gör <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {related.map((rel) => (
                            <ProductCard key={rel.id} product={rel as any} />
                        ))}
                    </div>
                </div>
            )}

            {/* Recently Viewed */}
            <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-20">
                <RecentlyViewed currentProductId={product.id} />
            </div>
        </div>
    );
}
