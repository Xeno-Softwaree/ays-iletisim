'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

export default function ProductSort() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sirala') || 'newest';

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'newest') {
            params.delete('sirala');
        } else {
            params.set('sirala', value);
        }
        router.push(`/urunler?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">Sıralama:</span>
            </div>
            <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:bg-white/10 transition-colors cursor-pointer"
            >
                <option value="newest" className="bg-[#111] text-white">En Yeni</option>
                <option value="price_asc" className="bg-[#111] text-white">Fiyat (Artan)</option>
                <option value="price_desc" className="bg-[#111] text-white">Fiyat (Azalan)</option>
            </select>
        </div>
    );
}
