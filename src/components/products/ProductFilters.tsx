'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
    id: string;
    name: string;
    slug: string;
    children: Category[];
}

interface Brand {
    id: string;
    name: string;
    slug: string;
}

interface Props {
    categories: Category[];
    brands: Brand[];
    selectedCategory?: string;
    selectedBrands?: string[];
    selectedMinPrice?: number;
    selectedMaxPrice?: number;
    selectedStock?: boolean;
}

export default function ProductFilters({
    categories,
    brands,
    selectedCategory,
    selectedBrands = [],
    selectedMinPrice,
    selectedMaxPrice,
    selectedStock,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for inputs
    const [minPrice, setMinPrice] = useState(selectedMinPrice?.toString() || '');
    const [maxPrice, setMaxPrice] = useState(selectedMaxPrice?.toString() || '');
    const [expandedCats, setExpandedCats] = useState<string[]>([]);

    // Expand category if selected or has selected child
    useEffect(() => {
        if (selectedCategory) {
            const parent = categories.find(c => c.children.some(child => child.slug === selectedCategory));
            if (parent && !expandedCats.includes(parent.id)) {
                setExpandedCats(prev => [...prev, parent.id]);
            }
        }
    }, [selectedCategory, categories]);


    const updateFilters = (updates: Record<string, string | string[] | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                params.delete(key);
            } else if (Array.isArray(value)) {
                params.set(key, value.join(','));
            } else {
                params.set(key, String(value));
            }
        });

        // Reset pagination if implemented
        params.delete('page');

        router.push(`/urunler?${params.toString()}`, { scroll: false });
    };

    const toggleBrand = (brandId: string) => {
        const newBrands = selectedBrands.includes(brandId)
            ? selectedBrands.filter(id => id !== brandId)
            : [...selectedBrands, brandId];
        updateFilters({ marka: newBrands });
    };

    const handlePriceApply = () => {
        updateFilters({
            minFiyat: minPrice || null,
            maxFiyat: maxPrice || null,
        });
    };

    const toggleCategory = (catId: string) => {
        setExpandedCats(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    return (
        <div className="space-y-10">
            {/* Categories */}
            <div>
                <h3 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Kategoriler</h3>
                <div className="space-y-2.5">
                    {/* All Products Link */}
                    <button
                        onClick={() => updateFilters({ kategori: null })}
                        className={cn(
                            "w-full text-left text-sm transition-all flex items-center gap-2 px-2 py-1.5 rounded-lg",
                            !selectedCategory
                                ? "text-blue-600 font-bold bg-blue-50/50"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        Tüm Ürünler
                    </button>

                    {categories.map(cat => (
                        <div key={cat.id} className="space-y-1.5">
                            <div className="flex items-center justify-between group">
                                <button
                                    onClick={() => updateFilters({ kategori: cat.slug })}
                                    className={cn(
                                        "text-sm transition-all text-left flex-1 px-2 py-1.5 rounded-lg",
                                        selectedCategory === cat.slug
                                            ? "text-blue-600 font-bold bg-blue-50/50"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    {cat.name}
                                </button>
                                {cat.children.length > 0 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleCategory(cat.id); }}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-slate-900 transition-all"
                                    >
                                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", expandedCats.includes(cat.id) && "rotate-180")} />
                                    </button>
                                )}
                            </div>

                            {/* Subcategories */}
                            {cat.children.length > 0 && expandedCats.includes(cat.id) && (
                                <div className="pl-4 space-y-1 mt-1 border-l-2 border-slate-100 ml-3">
                                    {cat.children.map(sub => (
                                        <button
                                            key={sub.id}
                                            onClick={() => updateFilters({ kategori: sub.slug })}
                                            className={cn(
                                                "block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-all",
                                                selectedCategory === sub.slug
                                                    ? "text-blue-600 font-bold bg-blue-50/50"
                                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                            )}
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Fiyat Aralığı</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MİN</label>
                        <input
                            type="number"
                            placeholder="0 ₺"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-blue-600 focus:bg-white outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MAX</label>
                        <input
                            type="number"
                            placeholder="MAX ₺"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-blue-600 focus:bg-white outline-none transition-all"
                        />
                    </div>
                </div>
                <button
                    onClick={handlePriceApply}
                    className="w-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                >
                    Uygula
                </button>
            </div>

            {/* Brands */}
            <div>
                <h3 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Markalar</h3>
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                    {brands.map(brand => {
                        const isSelected = selectedBrands.includes(brand.id);
                        return (
                            <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                    isSelected
                                        ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20"
                                        : "border-slate-200 group-hover:border-slate-400 bg-white"
                                )}>
                                    {isSelected && <Check className="w-3 h-3 text-white stroke-[4]" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleBrand(brand.id)}
                                    className="hidden"
                                />
                                <span className={cn(
                                    "text-sm transition-colors",
                                    isSelected ? "text-slate-900 font-bold" : "text-slate-500 group-hover:text-slate-900"
                                )}>
                                    {brand.name}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Stock & Condition */}
            <div>
                <h3 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Durum & Stok</h3>
                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn(
                            "w-10 h-5 rounded-full relative transition-colors duration-300 border border-slate-200",
                            selectedStock ? "bg-emerald-500 border-emerald-500" : "bg-slate-100"
                        )}>
                            <div className={cn(
                                "absolute top-[3px] left-[3px] w-3 h-3 rounded-full bg-white transition-transform duration-300 shadow-sm",
                                selectedStock ? "translate-x-5" : "translate-x-0"
                            )} />
                        </div>
                        <input
                            type="checkbox"
                            checked={!!selectedStock}
                            onChange={(e) => updateFilters({ stok: e.target.checked ? 'true' : null })}
                            className="hidden"
                        />
                        <span className="text-sm text-slate-600 font-bold group-hover:text-slate-900 transition-colors">Sadece Stoktakiler</span>
                    </label>

                    <div className="pt-2 flex flex-col gap-2">
                        <button
                            onClick={() => updateFilters({ durum: searchParams.get('durum') === 'NEW' ? null : 'NEW' })}
                            className={cn(
                                "flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all",
                                searchParams.get('durum') === 'NEW'
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            )}
                        >
                            SIFIR ÜRÜNLER
                            {searchParams.get('durum') === 'NEW' && <Check className="w-3 h-3" />}
                        </button>
                        <button
                            onClick={() => updateFilters({ durum: searchParams.get('durum') === 'USED' ? null : 'USED' })}
                            className={cn(
                                "flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all",
                                searchParams.get('durum') === 'USED'
                                    ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                            )}
                        >
                            İKİNCİ EL ÜRÜNLER
                            {searchParams.get('durum') === 'USED' && <Check className="w-3 h-3" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategory || selectedBrands.length > 0 || selectedMinPrice || selectedMaxPrice || selectedStock || searchParams.get('durum')) && (
                <button
                    onClick={() => router.push('/urunler')}
                    className="w-full mt-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 border border-red-200/50"
                >
                    <X className="w-4 h-4" />
                    FİLTRELERİ TEMİZLE
                </button>
            )}
        </div>
    );
}
