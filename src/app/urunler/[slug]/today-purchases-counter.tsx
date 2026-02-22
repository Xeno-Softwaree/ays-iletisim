'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

export default function TodayPurchasedCounter({ productId }: { productId: string }) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchPurchases() {
            try {
                const res = await fetch(`/api/products/${productId}/today-purchases`, {
                    next: { revalidate: 60 } // Next.js standard caching wrapper hint for client side (if using Next.js patched fetch)
                });
                if (!res.ok) return;
                const data = await res.json();
                if (isMounted && data.todayPurchasedCount !== undefined) {
                    setCount(data.todayPurchasedCount);
                }
            } catch (err) {
                // Silently fail, it's a non-critical metric
            }
        }

        fetchPurchases();

        return () => {
            isMounted = false;
        };
    }, [productId]);

    if (count === null) {
        // Option to show a skeleton or nothing while loading. 
        // We'll return a faded placeholder to prevent layout shift.
        return (
            <p className="text-slate-400 text-xs font-medium flex items-center justify-center lg:justify-start gap-2 animate-pulse opacity-50">
                <ShoppingCart className="w-3.5 h-3.5" />
                Sipariş verisi yükleniyor...
            </p>
        );
    }

    if (count === 0) {
        return (
            <p className="text-slate-400 text-xs font-medium flex items-center justify-center lg:justify-start gap-2">
                <ShoppingCart className="w-3.5 h-3.5" />
                Bugün ilk siparişi sen ver
            </p>
        );
    }

    return (
        <p className="text-slate-400 text-xs font-medium flex items-center justify-center lg:justify-start gap-2">
            <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
            Bugün {count} kez satın alındı
        </p>
    );
}
