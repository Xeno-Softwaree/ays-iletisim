import Link from 'next/link';
import Image from 'next/image';
import { Smartphone, Battery, Shield, RefreshCw, Sparkles, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import FavoriteButton from './FavoriteButton';

function BatteryBadge({ health }: { health: number | null }) {
    if (!health) return null;
    const color = health >= 85
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
        : health >= 70
            ? 'bg-amber-50 text-amber-600 border-amber-100'
            : 'bg-red-50 text-red-600 border-red-100';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${color}`}>
            <Battery className="w-3 h-3" />
            %{health}
        </span>
    );
}

function WarrantyBadge({ status }: { status: string | null }) {
    if (!status) return null;
    const isWarrantied = !status.toLowerCase().includes('garantisiz');
    const color = isWarrantied
        ? 'bg-blue-50 text-blue-600 border-blue-100'
        : 'bg-slate-50 text-slate-400 border-slate-100';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${color}`}>
            <Shield className="w-3 h-3" />
            {status}
        </span>
    );
}

interface Product {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    isFeatured?: boolean;
    images: string[];
    condition: 'NEW' | 'USED';
    stock: number;
    batteryHealth: number | null;
    warrantyStatus: string | null;
    brand: { name: string } | null;
}

interface Props {
    product: Product;
}

export default function ProductCard({ product }: Props) {
    const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);
    const discountPercent = hasDiscount
        ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
        : null;

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

    return (
        <div className="group relative block bg-white border border-slate-200 hover:border-blue-500/30 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10">
            <Link href={`/urunler/${product.slug}`} className="absolute inset-0 z-0" />

            {/* Image Container */}
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
                <div className="absolute top-4 right-4 z-20">
                    <FavoriteButton productId={product.id} />
                </div>
                {product.images[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Smartphone className="w-16 h-16 text-slate-200" />
                    </div>
                )}

                {/* Badges top-left stack */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border",
                        product.condition === 'NEW'
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : "bg-amber-500 text-white border-amber-400"
                    )}>
                        {product.condition === 'NEW'
                            ? <><Sparkles className="w-3 h-3" /> Sıfır</>
                            : <><RefreshCw className="w-3 h-3" /> İkinci El</>
                        }
                    </span>
                    {product.isFeatured && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white border border-blue-500 backdrop-blur-md shadow-sm">
                            <Tag className="w-3 h-3" /> Öne Çıkan
                        </span>
                    )}
                    {discountPercent && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500 text-white border border-red-400 backdrop-blur-md shadow-sm">
                            -%{discountPercent}
                        </span>
                    )}
                </div>

                {/* Out of Stock Overlay */}
                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-slate-900 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest shadow-2xl border border-slate-700">
                            Tükendi
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                    {product.brand && (
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            {product.brand.name}
                        </p>
                    )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-3 line-clamp-2 min-h-[2.5em] group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>

                {/* Badges row */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    <BatteryBadge health={product.batteryHealth} />
                    <WarrantyBadge status={product.warrantyStatus} />
                </div>

                {/* Price and Stock */}
                <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through font-semibold mb-0.5">
                                {formatPrice(Number(product.compareAtPrice))}
                            </span>
                        )}
                        <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                            {formatPrice(Number(product.price))}
                        </span>
                    </div>
                    {product.stock > 0 && product.stock <= 3 && (
                        <span className="text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 border border-red-100 rounded-full animate-pulse">
                            Son {product.stock} ürün!
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
