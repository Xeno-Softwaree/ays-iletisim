'use client';

import { useState } from 'react';
import { Search, Filter, Package, ChevronDown, X } from 'lucide-react';
import { useFilteredData } from '@/hooks/useFilteredData';
import { cn } from '@/lib/utils';
import ProductActions from './product-actions';
import AddProductModal from './add-product-modal';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    condition: 'NEW' | 'USED';
    category: { name: string };
    brand: { name: string } | null;
    categoryId: string;
    brandId: string | null;
    batteryHealth: number | null;
    warrantyStatus: string | null;
    colors?: { name: string; hex: string }[] | null;
}

interface Props {
    initialProducts: Product[];
    categories: any[];
    brands: any[];
}

export default function ProductsClient({ initialProducts, categories, brands }: Props) {
    const { filteredData, searchTerm, setSearchTerm, filters, setFilter, resetFilters } = useFilteredData(initialProducts, {
        searchKeys: ['name', 'category.name', 'brand.name']
    });

    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ürün Yönetimi</h1>
                    <p className="text-sm text-slate-500 font-medium">Envanter durumu ve fiyatlandırma yönetimi.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <AddProductModal categories={categories} brands={brands} />
                </div>
            </div>

            {/* Actions & Search Row */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative group w-full md:flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Ürün, marka veya kategori ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-10 py-2 text-sm outline-none transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all",
                            showFilters
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        Filtreler
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-200 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Marka</label>
                        <select
                            value={filters['brand.name'] || ''}
                            onChange={(e) => setFilter('brand.name', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500 shadow-sm"
                        >
                            <option value="">Tümü</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Kategori</label>
                        <select
                            value={filters['category.name'] || ''}
                            onChange={(e) => setFilter('category.name', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500 shadow-sm"
                        >
                            <option value="">Tümü</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Stok Durumu</label>
                        <select
                            onChange={(e) => setFilter('stockStatus', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500 shadow-sm"
                        >
                            <option value="">Tümü</option>
                            <option value="In Stock">Stokta Var</option>
                            <option value="Out of Stock">Tükendi</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={resetFilters}
                            className="w-full py-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-sm font-bold text-slate-600 transition-all shadow-sm"
                        >
                            Temizle
                        </button>
                    </div>
                </div>
            )}

            {/* Table Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ürün Detayı</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fiyat</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stok</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Durum</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center grayscale opacity-50">
                                            <Package className="w-12 h-12 text-slate-300 mb-3" />
                                            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Ürün Bulunamadı</p>
                                            <button onClick={resetFilters} className="mt-2 text-xs text-blue-600 font-bold hover:underline">Filtreleri sıfırla</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((product) => (
                                    <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                                    {product.images[0] ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Package size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-900 text-sm truncate max-w-[200px] leading-tight mb-0.5">{product.name}</div>
                                                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">{product.brand?.name || 'Markasız'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tighter">
                                                {product.category.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-slate-900 text-sm tracking-tight">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(product.price))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                                                )}></div>
                                                <span className={cn(
                                                    "text-[11px] font-black px-2 py-0.5 rounded-md",
                                                    product.stock > 10 ? "bg-emerald-50 text-emerald-600" : product.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                                                )}>
                                                    {product.stock} Adet
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.condition === 'NEW' ? (
                                                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">SIFIR</span>
                                            ) : (
                                                <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">2. EL</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ProductActions product={product} categories={categories} brands={brands} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
