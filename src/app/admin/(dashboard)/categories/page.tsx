'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Folder, Layers, Search, X, ChevronDown } from 'lucide-react';
import { useFilteredData } from '@/hooks/useFilteredData';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    description: string | null;
    parentId: string | null;
    order: number;
    parent?: Category;
}

import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState('');
    const [order, setOrder] = useState(0);

    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                setCategories([]);
                toast.error('Kategoriler yüklenemedi (Geçersiz format)');
            }
        } catch (error) {
            setCategories([]);
            toast.error('Kategoriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setCategoryToDelete(id);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        const id = categoryToDelete;
        setCategoryToDelete(null);

        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Kategori silindi');
                fetchCategories();
                if (editingCategory?.id === id) handleCancel();
            } else {
                toast.error(data.error || 'Silme başarısız');
            }
        } catch (error) {
            toast.error('Kategori silinirken bir hata oluştu');
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setName(category.name);
        setDescription(category.description || '');
        setParentId(category.parentId || '');
        setOrder(category.order || 0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingCategory(null);
        setName('');
        setDescription('');
        setParentId('');
        setOrder(0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        const toastId = toast.loading('İşleniyor...');

        const data = { name, description, parentId: parentId || null, order };

        try {
            let res;
            if (editingCategory) {
                res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            } else {
                res = await fetch('/api/admin/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            }

            if (res.ok) {
                toast.success(editingCategory ? 'Güncellendi' : 'Eklendi', { id: toastId });
                fetchCategories();
                handleCancel();
            } else {
                toast.error('İşlem başarısız', { id: toastId });
            }
        } catch (error) {
            toast.error('Hata oluştu', { id: toastId });
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Delete Confirmation Modal */}
            {categoryToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setCategoryToDelete(null)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Kategoriyi Sil</h3>
                        <p className="text-sm text-slate-500 font-medium mb-8">
                            Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCategoryToDelete(null)}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
                            >
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kategori Yönetimi</h1>
                    <p className="text-sm text-slate-500 font-medium">Ürünlerinizi düzenlemek için kategori ağacını yönetin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Form Column */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 order-2 lg:order-1">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                            <Folder className="w-40 h-40" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className={cn(
                                    "p-2.5 rounded-xl shadow-sm",
                                    editingCategory ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                )}>
                                    {editingCategory ? <Folder size={20} /> : <Plus size={20} />}
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">KATEGORİ ADI</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-bold text-slate-900 placeholder-slate-400 text-sm"
                                        placeholder="Örn: Akıllı Telefonlar"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AÇIKLAMA</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-medium text-slate-600 placeholder-slate-400 text-sm resize-none"
                                        placeholder="Kategori hakkında kısa bilgi..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ÜST KATEGORİ</label>
                                    <div className="relative">
                                        <select
                                            value={parentId}
                                            onChange={(e) => setParentId(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer shadow-sm text-sm"
                                        >
                                            <option value="">Yok (Ana Kategori)</option>
                                            {(categories || [])
                                                .filter(c => c.id !== editingCategory?.id)
                                                .map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <Layers size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SIRA NUMARASI</label>
                                    <input
                                        type="number"
                                        value={order}
                                        onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-bold text-slate-900 placeholder-slate-400 text-sm"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className={cn(
                                            "w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-50",
                                            editingCategory ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                                        )}
                                    >
                                        {formLoading ? 'İşleniyor...' : (editingCategory ? 'GÜNCELLEMEYİ KAYDET' : 'KATEGORİYİ OLUŞTUR')}
                                    </button>
                                    {editingCategory && (
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="w-full py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm"
                                        >
                                            Vazgeç
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right List Column */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                    <ListRenderer
                        data={categories}
                        handleDelete={handleDelete}
                        handleEdit={handleEdit}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}

function ListRenderer({ data, handleDelete, handleEdit, loading }: any) {
    const processedData = (data || []).map((c: any) => ({ ...c, type: c.parentId ? 'SUB' : 'MAIN' }));

    const { filteredData, searchTerm, setSearchTerm, filters, setFilter, resetFilters } = useFilteredData(processedData, {
        searchKeys: ['name', 'description', 'parent.name']
    });

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
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
                        placeholder="Kategorilerde ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-10 py-2.5 text-sm outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <select
                        onChange={(e) => setFilter('type', e.target.value)}
                        value={filters['type'] || ''}
                        className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 hover:bg-white transition-all cursor-pointer h-full"
                    >
                        <option value="">Tüm Seviyeler</option>
                        <option value="MAIN">Ana Kategoriler</option>
                        <option value="SUB">Alt Kategoriler</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-3">
                    <Folder className="w-12 h-12 text-slate-200" />
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Kategori Bulunamadı</p>
                    <button onClick={resetFilters} className="text-xs text-blue-600 font-bold hover:underline font-mono">TEMİZLE</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredData.map((cat: any) => (
                        <div key={cat.id} className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all flex items-center justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                    cat.parentId ? "bg-slate-50 text-slate-400" : "bg-blue-50 text-blue-600"
                                )}>
                                    <Folder size={22} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{cat.name}</h3>
                                        {cat.parent && (
                                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-tight border border-slate-200">
                                                {cat.parent.name} ALTI
                                            </span>
                                        )}
                                        <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-tight">
                                            SIRA: {cat.order}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 line-clamp-1 italic">
                                        {cat.description || 'Bu kategori için açıklama girilmemiş.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                <button
                                    onClick={() => handleEdit(cat)}
                                    className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-[11px] font-black uppercase tracking-tight hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                >
                                    DÜZENLE
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
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


