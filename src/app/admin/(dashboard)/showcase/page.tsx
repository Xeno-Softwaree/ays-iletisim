'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Image as ImageIcon, Check, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Slide {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    linkUrl: string | null;
    order: number;
    isActive: boolean;
}

export default function ShowcasePage() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [order, setOrder] = useState(0);

    useEffect(() => { fetchSlides(); }, []);

    const fetchSlides = async () => {
        try {
            const res = await fetch('/api/admin/showcase');
            if (res.ok) {
                const data = await res.json();
                setSlides(data);
                if (data.length > 0) {
                    const maxOrder = Math.max(...data.map((s: Slide) => s.order));
                    setOrder(maxOrder + 1);
                }
            }
        } catch { toast.error('Slaytlar yüklenemedi'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu slaytı silmek istediğinize emin misiniz?')) return;
        const toastId = toast.loading('Slayt siliniyor...');
        try {
            const res = await fetch(`/api/admin/showcase/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Slayt silindi', { id: toastId });
                fetchSlides();
                if (editingSlide?.id === id) handleCancel();
            } else throw new Error();
        } catch { toast.error('Hata oluştu', { id: toastId }); }
    };

    const handleEdit = (slide: Slide) => {
        setEditingSlide(slide);
        setTitle(slide.title);
        setDescription(slide.description || '');
        setImageUrl(slide.imageUrl);
        setLinkUrl(slide.linkUrl || '');
        setIsActive(slide.isActive);
        setOrder(slide.order);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingSlide(null);
        setTitle('');
        setDescription('');
        setImageUrl('');
        setLinkUrl('');
        setIsActive(true);
        if (slides.length > 0) {
            const maxOrder = Math.max(...slides.map(s => s.order));
            setOrder(maxOrder + 1);
        } else setOrder(0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        const toastId = toast.loading(editingSlide ? 'Güncelleniyor...' : 'Slayt ekleniyor...');
        const data = { title, description, imageUrl, linkUrl, isActive, order };
        try {
            let res;
            if (editingSlide) {
                res = await fetch(`/api/admin/showcase/${editingSlide.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            } else {
                res = await fetch('/api/admin/showcase', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            }
            if (res.ok) {
                toast.success(editingSlide ? 'Slayt güncellendi' : 'Slayt başarıyla eklendi', { id: toastId });
                fetchSlides();
                handleCancel();
            } else throw new Error();
        } catch { toast.error('Hata oluştu', { id: toastId }); }
        finally { setFormLoading(false); }
    };

    const moveSlide = async (id: string, direction: 'up' | 'down') => {
        const index = slides.findIndex(s => s.id === id);
        if (index === -1) return;
        const newSlides = [...slides];
        if (direction === 'up' && index > 0) {
            const tempOrder = newSlides[index].order;
            newSlides[index].order = newSlides[index - 1].order;
            newSlides[index - 1].order = tempOrder;
            [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
        } else if (direction === 'down' && index < newSlides.length - 1) {
            const tempOrder = newSlides[index].order;
            newSlides[index].order = newSlides[index + 1].order;
            newSlides[index + 1].order = tempOrder;
            [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
        } else return;

        setSlides(newSlides);
        try {
            const s1 = newSlides[index];
            const s2 = direction === 'up' ? newSlides[index + 1] : newSlides[index - 1];
            await Promise.all([
                fetch(`/api/admin/showcase/${s1.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...s1 })
                }),
                fetch(`/api/admin/showcase/${s2.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...s2 })
                })
            ]);
            toast.success('Sıralama güncellendi');
        } catch {
            toast.error('Sıralama kaydedilemedi');
            fetchSlides();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vitrin Yönetimi</h1>
                <p className="text-sm text-slate-500 font-medium">Ana sayfa slider alanını yönetin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form - Left Section */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 order-2 lg:order-1">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 space-y-8 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors",
                                editingSlide ? "bg-amber-500 shadow-amber-200" : "bg-slate-950 shadow-slate-200"
                            )}>
                                {editingSlide ? <ImageIcon size={20} /> : <Plus size={20} />}
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                                    {editingSlide ? 'Düzenle' : 'Yeni Slayt'}
                                </h2>
                                <p className="text-xs text-slate-400 font-medium">Slider bilgilerini girin.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ÖNİZLEME</label>
                                <div className="aspect-[21/9] w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden relative group">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                                            <ImageIcon size={32} strokeWidth={1} />
                                            <span className="text-[10px] font-bold mt-2">GÖRSEL YOK</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GÖRSEL URL</label>
                                <input
                                    required
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-3.5 font-bold text-slate-900 outline-none transition-all shadow-sm text-sm"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">BAŞLIK</label>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-3.5 font-bold text-slate-900 outline-none transition-all shadow-sm"
                                    placeholder="Örn: Yeni Sezon İndirimleri"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AÇIKLAMA</label>
                                <textarea
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-3.5 font-bold text-slate-900 outline-none transition-all shadow-sm resize-none text-sm"
                                    placeholder="Slider alt metni..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LİNK (OPSİYONEL)</label>
                                    <input
                                        type="text"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-3.5 font-bold text-slate-900 outline-none transition-all shadow-sm text-xs"
                                        placeholder="/kategori/iphone"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SIRA NO</label>
                                    <input
                                        type="number"
                                        value={order}
                                        onChange={(e) => setOrder(parseInt(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-3.5 font-black text-slate-900 outline-none transition-all shadow-sm text-center"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">SLAYT AKTİF</span>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    className={cn(
                                        "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                                        isActive ? "bg-emerald-500" : "bg-slate-300"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 bg-white rounded-full transition-transform duration-300",
                                        isActive ? "translate-x-6" : "translate-x-0"
                                    )} />
                                </button>
                            </div>

                            <div className="pt-2 space-y-3">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl disabled:opacity-50",
                                        editingSlide
                                            ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200"
                                            : "bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200"
                                    )}
                                >
                                    {formLoading ? <Loader2 size={16} className="animate-spin" /> : (editingSlide ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />)}
                                    {editingSlide ? 'GÜNCELLEMEYİ KAYDET' : 'SLAYTI OLUŞTUR'}
                                </button>

                                {editingSlide && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        VAZGEÇ
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List - Right Section */}
                <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
                    {loading ? (
                        <div className="grid grid-cols-1 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-40 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : slides.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-16 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                                <ImageIcon size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Henüz Slayt Eklenmemiş</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Vitrin alanında gösterilecek görselleri soldaki formdan ekleyebilirsiniz.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {slides.map((slide, index) => (
                                <div key={slide.id} className={cn(
                                    "group bg-white rounded-[2.5rem] p-6 border border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row items-center gap-6 relative overflow-hidden",
                                    !slide.isActive && "opacity-60 grayscale-[0.8]"
                                )}>
                                    <div className="absolute top-4 left-4 w-8 h-8 bg-slate-900 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg z-10">
                                        {slide.order}
                                    </div>

                                    <div className="w-full md:w-56 aspect-[21/9] md:aspect-video rounded-3xl overflow-hidden border border-slate-100 shadow-inner flex-shrink-0">
                                        <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                            <h3 className="text-lg font-black text-slate-900 truncate">{slide.title}</h3>
                                            {!slide.isActive && <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-full uppercase tracking-tighter">Pasif</span>}
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-2 font-medium leading-relaxed">{slide.description}</p>
                                        {slide.linkUrl && (
                                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{slide.linkUrl}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                                        <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl">
                                            <button
                                                onClick={() => moveSlide(slide.id, 'up')}
                                                disabled={index === 0}
                                                className="p-2 hover:bg-white rounded-xl transition-all disabled:opacity-20"
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => moveSlide(slide.id, 'down')}
                                                disabled={index === slides.length - 1}
                                                className="p-2 hover:bg-white rounded-xl transition-all disabled:opacity-20"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(slide)}
                                                className="flex-1 md:flex-none p-3 bg-slate-950 text-white rounded-2xl hover:bg-blue-600 transition-all font-black text-[10px]"
                                            >
                                                <ImageIcon size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(slide.id)}
                                                className="p-2 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
