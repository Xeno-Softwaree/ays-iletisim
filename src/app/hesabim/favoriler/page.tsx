'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Heart, Loader2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FavoriteProduct {
    id: string;
    slug: string;
    name: string;
    price: number;
    images: string[];
    condition: 'NEW' | 'USED';
    stock: number;
    batteryHealth: number | null;
    warrantyStatus: string | null;
    brand: { name: string } | null;
    isFavorite: boolean;
}

export default function FavoritesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchFavorites();
        }
    }, [status, router]);

    const fetchFavorites = async () => {
        try {
            const res = await fetch('/api/user/favorites');
            if (res.ok) {
                const data = await res.json();
                setFavorites(data);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm font-medium animate-pulse">Favoriler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href="/hesabim"
                        className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center transition-all hover:bg-slate-50 shadow-sm active:scale-90"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Favorilerim</h1>
                        <p className="text-slate-400 text-xs font-medium mt-0.5">{favorites.length} ürün kaydedildi</p>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-xl mb-2">Henüz favori ürününüz yok</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs mx-auto">
                            Beğendiğiniz ürünleri kalp ikonuna tıklayarak buraya ekleyebilir ve daha sonra kolayca bulabilirsiniz.
                        </p>
                        <Link
                            href="/urunler"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:translate-y-0.5"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Ürünleri Keşfet
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {favorites.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
