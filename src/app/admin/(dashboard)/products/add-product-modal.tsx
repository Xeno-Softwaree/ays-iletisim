'use client';

import { useState } from 'react';
import { createProduct } from '../actions';
import { X, CheckCircle2, XCircle, Plus, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; }

interface ColorEntry { name: string; hex: string; }

const PRESET_COLORS: ColorEntry[] = [
    { name: 'Siyah', hex: '#1a1a1a' },
    { name: 'Beyaz', hex: '#f5f5f5' },
    { name: 'Gümüş', hex: '#c0c0c0' },
    { name: 'Uzay Grisi', hex: '#4a4a4a' },
    { name: 'Altın', hex: '#d4a843' },
    { name: 'Mavi', hex: '#2563eb' },
    { name: 'Kırmızı', hex: '#dc2626' },
    { name: 'Yeşil', hex: '#16a34a' },
    { name: 'Mor', hex: '#7c3aed' },
    { name: 'Pembe', hex: '#ec4899' },
];

export default function AddProductModal({ categories, brands }: { categories: Category[], brands: Brand[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [colors, setColors] = useState<ColorEntry[]>([]);
    const [colorName, setColorName] = useState('');
    const [colorHex, setColorHex] = useState('#1a1a1a');

    const addColor = () => {
        const name = colorName.trim();
        if (!name) return;
        if (colors.find(c => c.name.toLowerCase() === name.toLowerCase())) return;
        setColors(prev => [...prev, { name, hex: colorHex }]);
        setColorName('');
        setColorHex('#1a1a1a');
    };

    const addPreset = (preset: ColorEntry) => {
        if (colors.find(c => c.name === preset.name)) return;
        setColors(prev => [...prev, preset]);
    };

    const removeColor = (name: string) => setColors(prev => prev.filter(c => c.name !== name));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Ürün ekleniyor...');
        const formData = new FormData(e.currentTarget);
        formData.append('colors', JSON.stringify(colors));

        try {
            const res = await createProduct(formData);
            if (!res.success) throw new Error(res.error || 'Hata');
            toast.success('Başarılı!', { id: toastId, description: 'Ürün başarıyla eklendi.', icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> });
            setIsOpen(false);
            setColors([]);
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            toast.error('Hata!', { id: toastId, description: error instanceof Error ? error.message : 'Hata oluştu.', icon: <XCircle className="w-5 h-5 text-red-600" /> });
        } finally {
            setLoading(false);
        }
    };

    const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition';
    const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
                <Plus size={18} />
                Yeni Ürün Ekle
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />

                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] flex flex-col border border-slate-200">
                        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ürün Bilgileri</h2>
                                <p className="text-xs text-slate-500 font-medium">Yeni envanter kalemi oluşturun.</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                            {/* Temel Bilgiler Section */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Ürün Adı</label>
                                        <input name="name" required placeholder="Örn: iPhone 15 Pro" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Fiyat (₺)</label>
                                        <input name="price" type="number" step="0.01" required placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">İndirimli Fiyat (₺)</label>
                                        <input name="compareAtPrice" type="number" step="0.01" placeholder="Yalnızca indirim varsa" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                                    </div>
                                    <div className="flex items-end pb-1.5">
                                        <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 w-full hover:bg-white hover:border-blue-200 transition-all">
                                            <input name="isFeatured" type="checkbox" id="isFeatured" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Öne Çıkan Ürün</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Ürün Açıklaması</label>
                                    <textarea name="description" rows={3} placeholder="Ürün detaylarını buraya yazın..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none" />
                                </div>
                            </div>

                            {/* Envanter & Kategori Section */}
                            <div className="pt-6 border-t border-slate-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Stok Adedi</label>
                                        <input name="stock" type="number" defaultValue={1} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Kategori</label>
                                        <select name="categoryId" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm">
                                            <option value="">Seçiniz</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Detaylar Section */}
                            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Kullanım Durumu</label>
                                    <select name="condition" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm">
                                        <option value="NEW">Sıfır</option>
                                        <option value="USED">İkinci El</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Marka</label>
                                    <select name="brandId" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm">
                                        <option value="">Seçiniz (Opsiyonel)</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Pil Sağlığı (%)</label>
                                    <input name="batteryHealth" type="number" min="0" max="100" placeholder="Örn: 85" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Garanti Bilgisi</label>
                                    <input name="warrantyStatus" placeholder="Örn: 12 Ay Garantili" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Görsel URL</label>
                                <input name="imageUrl" placeholder="HTTPS://..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                            </div>

                            {/* Renkler Section */}
                            <div className="pt-6 border-t border-slate-100 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-blue-600" />
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Renk Seçenekleri</label>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {PRESET_COLORS.map(p => {
                                        const added = colors.find(c => c.name === p.name);
                                        return (
                                            <button
                                                key={p.name}
                                                type="button"
                                                onClick={() => addPreset(p)}
                                                className={cn(
                                                    "flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-full border transition-all font-black uppercase tracking-tighter",
                                                    added
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                )}
                                            >
                                                <div className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-inner" style={{ background: p.hex }} />
                                                {p.name}
                                                {added && <CheckCircle2 size={12} className="ml-1" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                                    <input
                                        type="text"
                                        placeholder="Özel renk..."
                                        value={colorName}
                                        onChange={e => setColorName(e.target.value)}
                                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                                    />
                                    <input
                                        type="color"
                                        value={colorHex}
                                        onChange={e => setColorHex(e.target.value)}
                                        className="w-10 h-8 border border-slate-200 rounded-lg cursor-pointer p-0.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={addColor}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-[10px] font-black uppercase flex items-center gap-2"
                                    >
                                        <Plus size={14} /> Ekle
                                    </button>
                                </div>

                                {colors.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map(c => (
                                            <div key={c.name} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-1.5 pr-2 py-1 shadow-sm transition-all hover:scale-105">
                                                <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ background: c.hex }} />
                                                <span className="text-[10px] text-slate-900 font-black uppercase">{c.name}</span>
                                                <button type="button" onClick={() => removeColor(c.name)} className="text-slate-300 hover:text-red-500 transition">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex justify-end gap-3 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-5 py-2.5 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={() => (document.querySelector('form') as HTMLFormElement).requestSubmit()}
                                disabled={loading}
                                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                            >
                                {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
