'use client';

import { useState, useEffect } from 'react';
import { Trash2, CheckCircle2, XCircle, Plus, Tag, Pencil, X, Image as ImageIcon, Search, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useFilteredData } from '@/hooks/useFilteredData';

interface Brand {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    _count?: { products: number };
}

import { cn } from '@/lib/utils';

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/admin/brands');
            const data = await res.json();
            setBrands(data);
        } catch (error) {
            toast.error('Markalar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        toast('Bu markayı silmek istediğinize emin misiniz?', {
            action: {
                label: 'EVET, SİL',
                onClick: async () => {
                    const toastId = toast.loading('Marka siliniyor...');
                    try {
                        const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error('Silme başarısız');

                        toast.success('Başarılı!', {
                            id: toastId,
                            description: 'Marka başarıyla silindi.',
                            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
                        });

                        fetchBrands();
                    } catch (error) {
                        toast.error('Hata!', {
                            id: toastId,
                            description: 'Silme işlemi başarısız oldu.',
                            icon: <XCircle className="w-5 h-5 text-red-600" />,
                        });
                    }
                }
            },
            cancel: {
                label: 'İptal',
                onClick: () => { }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormLoading(true);
        const toastId = toast.loading('İşleniyor...');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            logoUrl: formData.get('logoUrl'),
        };

        const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : '/api/admin/brands';
        const method = editingBrand ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || 'İşlem başarısız');

            toast.success('Başarılı!', {
                id: toastId,
                description: editingBrand ? 'Marka başarıyla güncellendi.' : 'Marka başarıyla eklendi.',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
            });

            (e.target as HTMLFormElement).reset();
            setEditingBrand(null);
            fetchBrands();
        } catch (error) {
            toast.error('Hata!', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Bir hata oluştu.',
                icon: <XCircle className="w-5 h-5 text-red-600" />,
            });
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marka Yönetimi</h1>
                    <p className="text-sm text-slate-500 font-medium">Satışı yapılan markaları ve logolarını düzenleyin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Form Column */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 order-2 lg:order-1">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                            <Tag className="w-40 h-40" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className={cn(
                                    "p-2.5 rounded-xl shadow-sm",
                                    editingBrand ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                )}>
                                    {editingBrand ? <Pencil size={20} /> : <Plus size={20} />}
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingBrand ? 'Markayı Düzenle' : 'Yeni Marka Ekle'}
                                </h2>
                            </div>

                            <form id="brandForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MARKA ADI</label>
                                    <input
                                        name="name"
                                        defaultValue={editingBrand?.name}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-bold text-slate-900 placeholder-slate-400 text-sm"
                                        placeholder="Örn: Apple"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LOGO URL</label>
                                    <div className="relative">
                                        <input
                                            name="logoUrl"
                                            defaultValue={editingBrand?.logoUrl || ''}
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-10 py-3 outline-none transition-all font-medium text-slate-600 placeholder-slate-400 text-sm"
                                            placeholder="https://brand.com/logo.png"
                                        />
                                        <ImageIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className={cn(
                                            "w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-50",
                                            editingBrand ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                                        )}
                                    >
                                        {formLoading ? 'İşleniyor...' : (editingBrand ? 'Güncellemeyi Kaydet' : 'Markayı Oluştur')}
                                    </button>
                                    {editingBrand && (
                                        <button
                                            type="button"
                                            onClick={() => { setEditingBrand(null); (document.getElementById('brandForm') as HTMLFormElement)?.reset(); }}
                                            className="w-full py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm"
                                        >
                                            Değişiklikleri İptal Et
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right grid Column */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                    <ListRenderer
                        data={brands}
                        loading={loading}
                        setEditingBrand={setEditingBrand}
                        handleDelete={handleDelete}
                    />
                </div>
            </div>
        </div>
    );
}

function ListRenderer({ data, loading, setEditingBrand, handleDelete }: any) {
    const processedData = data.map((b: any) => ({ ...b, hasProducts: (b._count?.products || 0) > 0 ? 'YES' : 'NO' }));

    const { filteredData, searchTerm, setSearchTerm, filters, setFilter, resetFilters } = useFilteredData(processedData, {
        searchKeys: ['name']
    });

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-44 bg-slate-100 rounded-3xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative group flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Markalarda ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-10 py-2.5 text-sm outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <select
                        onChange={(e) => setFilter('hasProducts', e.target.value)}
                        value={filters['hasProducts'] || ''}
                        className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 hover:bg-white transition-all cursor-pointer h-full"
                    >
                        <option value="">Tüm Markalar</option>
                        <option value="YES">Ürün Olanlar</option>
                        <option value="NO">Henüz Ürün Yok</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-3">
                    <Tag className="w-12 h-12 text-slate-200" />
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Eşleşen Marka Yok</p>
                    <button onClick={resetFilters} className="text-xs text-blue-600 font-bold hover:underline font-mono">FİLTRELERİ SIFIRLA</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredData.map((brand: any) => (
                        <div key={brand.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/5 transition-all relative flex flex-col items-center text-center overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 border border-slate-100 shadow-inner">
                                {brand.logoUrl ? (
                                    <img src={brand.logoUrl} alt={brand.name} className="w-16 h-16 object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                                ) : (
                                    <Tag className="w-10 h-10 text-slate-300" />
                                )}
                            </div>

                            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">{brand.name}</h3>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                                    {brand._count?.products || 0} AKTİF ÜRÜN
                                </span>
                            </div>

                            <div className="flex items-center gap-2 w-full pt-4 border-t border-slate-50">
                                <button
                                    onClick={() => {
                                        setEditingBrand(brand);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                >
                                    Düzenle
                                </button>
                                <button
                                    onClick={() => handleDelete(brand.id)}
                                    className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    title="Sil"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


