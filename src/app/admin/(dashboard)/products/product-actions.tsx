'use client';

import { useState } from 'react';
import { Edit, Trash2, X, CheckCircle2, XCircle, Plus, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    condition: 'NEW' | 'USED';
    categoryId: string;
    brandId: string | null;
    batteryHealth: number | null;
    warrantyStatus: string | null;
    images: string[];
    colors?: { name: string; hex: string }[] | null;
}

interface ColorEntry { name: string; hex: string; }

const PRESET_COLORS: ColorEntry[] = [
    { name: 'Siyah', hex: '#1a1a1a' }, { name: 'Beyaz', hex: '#f5f5f5' },
    { name: 'Gümüş', hex: '#c0c0c0' }, { name: 'Uzay Grisi', hex: '#4a4a4a' },
    { name: 'Altın', hex: '#d4a843' }, { name: 'Mavi', hex: '#2563eb' },
    { name: 'Kırmızı', hex: '#dc2626' }, { name: 'Yeşil', hex: '#16a34a' },
    { name: 'Mor', hex: '#7c3aed' }, { name: 'Pembe', hex: '#ec4899' },
];

interface Category {
    id: string;
    name: string;
}

interface Brand {
    id: string;
    name: string;
}

export default function ProductActions({ product, categories, brands }: { product: Product, categories: Category[], brands: Brand[] }) {
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [colors, setColors] = useState<ColorEntry[]>(product.colors ?? []);
    const [colorName, setColorName] = useState('');
    const [colorHex, setColorHex] = useState('#1a1a1a');

    const addColor = () => {
        const name = colorName.trim();
        if (!name) return;
        if (colors.find(c => c.name.toLowerCase() === name.toLowerCase())) return;
        setColors(prev => [...prev, { name, hex: colorHex }]);
        setColorName(''); setColorHex('#1a1a1a');
    };
    const addPreset = (p: ColorEntry) => { if (!colors.find(c => c.name === p.name)) setColors(prev => [...prev, p]); };
    const removeColor = (name: string) => setColors(prev => prev.filter(c => c.name !== name));

    // Silme işlemi
    const handleDelete = async () => {
        setLoading(true);
        const toastId = toast.loading('Ürün siliniyor...');

        try {
            const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
            const result = await res.json();

            if (!res.ok) throw new Error(result.message || 'Silme başarısız');

            toast.success('Başarılı!', {
                id: toastId,
                description: 'Ürün başarıyla silindi.',
                icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
            });

            router.refresh();
            setIsDeleteOpen(false);
        } catch (error) {
            toast.error('Hata!', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Silme işlemi başarısız oldu.',
                icon: <XCircle className="w-5 h-5 text-red-600" />,
            });
        } finally {
            setLoading(false);
        }
    };

    // Güncelleme işlemi
    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Güncelleniyor...');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: formData.get('price'),
            stock: formData.get('stock'),
            categoryId: formData.get('categoryId'),
            brandId: formData.get('brandId') || null,
            condition: formData.get('condition'),
            batteryHealth: formData.get('batteryHealth') ? parseInt(formData.get('batteryHealth') as string) : null,
            warrantyStatus: formData.get('warrantyStatus') || null,
            images: product.images,
            colors,
        };

        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();

            if (!res.ok || !result.success) throw new Error(result.message || 'Hata');

            toast.success('Başarılı!', {
                id: toastId,
                description: 'Ürün başarıyla güncellendi.',
                icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
            });

            router.refresh();
            setIsEditOpen(false);
        } catch (error) {
            toast.error('Hata!', {
                id: toastId,
                description: error instanceof Error ? error.message : 'Güncelleme işlemi başarısız oldu.',
                icon: <XCircle className="w-5 h-5 text-red-600" />,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={() => setIsEditOpen(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Düzenle"
            >
                <Edit className="w-4 h-4" />
            </button>

            <button
                onClick={() => setIsDeleteOpen(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Sil"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {/* Silme Onay Modalı */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full animate-in fade-in zoom-in duration-300 border border-slate-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Ürünü Sil?</h3>
                        <p className="text-gray-600 mb-6">"{product.name}" ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading ? 'Siliniyor...' : 'Evet, Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Düzenleme Modalı */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-200 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ürünü Düzenle</h2>
                                <p className="text-xs text-slate-500 font-medium">Mevcut ürün bilgilerini güncelleyin.</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
                                    <input name="name" defaultValue={product.name} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                                    <input name="price" type="number" step="0.01" defaultValue={Number(product.price)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea name="description" rows={3} defaultValue={product.description} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                                    <input name="stock" type="number" defaultValue={product.stock} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select name="categoryId" defaultValue={product.categoryId} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500">
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                                    <select name="condition" defaultValue={product.condition} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="NEW">Sıfır</option>
                                        <option value="USED">İkinci El</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                                    <select name="brandId" defaultValue={product.brandId || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Seçiniz (İsteğe bağlı)</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pil Sağlığı (%)</label>
                                    <input name="batteryHealth" type="number" defaultValue={product.batteryHealth || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Garanti</label>
                                    <input name="warrantyStatus" defaultValue={product.warrantyStatus || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            {/* ── Renk Seçenekleri ── */}
                            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-blue-600" />
                                    <label className="text-sm font-semibold text-gray-700">Renk Seçenekleri <span className="text-gray-400 font-normal">(İsteğe bağlı)</span></label>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {PRESET_COLORS.map(p => {
                                        const added = colors.find(c => c.name === p.name);
                                        return (
                                            <button key={p.name} type="button" onClick={() => addPreset(p)}
                                                className={`flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full border transition-all font-black uppercase tracking-tighter ${added ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                                <span className="w-3 h-3 rounded-full border border-black/10 shadow-inner" style={{ background: p.hex }} />
                                                {p.name}{added && ' ✓'}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Özel renk adı..." value={colorName} onChange={e => setColorName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input type="color" value={colorHex} onChange={e => setColorHex(e.target.value)} className="w-10 h-9 border border-gray-300 rounded-lg cursor-pointer p-0.5" />
                                    <button type="button" onClick={addColor} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-1">
                                        <Plus className="w-3.5 h-3.5" /> Ekle
                                    </button>
                                </div>
                                {colors.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map(c => (
                                            <div key={c.name} className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1">
                                                <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ background: c.hex }} />
                                                <span className="text-xs text-gray-700 font-medium">{c.name}</span>
                                                <button type="button" onClick={() => removeColor(c.name)} className="text-gray-400 hover:text-red-500 transition"><X className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 gap-3">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">İptal</button>
                                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {loading ? 'Güncelleniyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
