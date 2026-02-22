'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Smartphone } from 'lucide-react';

interface RecentProduct {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string | null;
    brand: string | null;
}

const STORAGE_KEY = 'ays_recently_viewed';
const MAX_ITEMS = 6;

export function addToRecentlyViewed(product: RecentProduct) {
    if (typeof window === 'undefined') return;
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentProduct[];
        const filtered = stored.filter(p => p.id !== product.id);
        filtered.unshift(product);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
    } catch { /* ignore */ }
}

interface Props {
    currentProductId: string;
}

export default function RecentlyViewed({ currentProductId }: Props) {
    const [products, setProducts] = useState<RecentProduct[]>([]);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentProduct[];
            setProducts(stored.filter(p => p.id !== currentProductId).slice(0, 4));
        } catch { /* ignore */ }
    }, [currentProductId]);

    if (products.length === 0) return null;

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

    return (
        <div className="mt-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">SON BAKTIKLARINIZ</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map(p => (
                    <Link
                        key={p.id}
                        href={`/urunler/${p.slug}`}
                        className="group bg-white border border-slate-200 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200"
                    >
                        <div className="aspect-square relative bg-slate-50 flex items-center justify-center overflow-hidden">
                            {p.image ? (
                                <Image
                                    src={p.image}
                                    alt={p.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Smartphone className="w-10 h-10 text-slate-200" />
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            {p.brand && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{p.brand}</p>}
                            <p className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{p.name}</p>
                            <p className="text-base font-black text-slate-900">{formatPrice(p.price)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
