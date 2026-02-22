'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Eye } from 'lucide-react';

export default function RealViewerCounter({ productId }: { productId: string }) {
    const [viewCount, setViewCount] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function incrementView() {
            try {
                // In development/strict-mode this runs twice. 
                // In production, it runs once mapping a real page view increment.
                const res = await fetch(`/api/products/${productId}/views`, {
                    method: 'POST'
                });

                if (!res.ok) return;
                const data = await res.json();

                if (isMounted && data.viewCount !== undefined) {
                    setViewCount(data.viewCount);
                }
            } catch (err) {
                // Silently fail, it's a non-critical metric
            }
        }

        incrementView();

        return () => {
            isMounted = false;
        };
    }, [productId]);

    if (viewCount === null) {
        return (
            <p className="text-emerald-600 text-xs font-bold flex items-center justify-center lg:justify-start gap-2 animate-pulse opacity-50">
                <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Görüntüleme hesaplanıyor...
            </p>
        );
    }

    return (
        <p className="text-emerald-600 text-xs font-bold flex items-center justify-center lg:justify-start gap-2 animate-in fade-in duration-700">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Bugün {viewCount} kişi görüntüledi
        </p>
    );
}
