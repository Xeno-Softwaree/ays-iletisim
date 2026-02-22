'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    MapPin,
    Phone,
    Mail,
    Map,
    Save,
    Loader2,
    CheckCircle2,
    XCircle,
    Eye
} from 'lucide-react';

interface ContactInfoData {
    address: string;
    phone: string;
    email: string;
    mapEmbedUrl: string;
}

const defaultData: ContactInfoData = {
    address: '',
    phone: '',
    email: '',
    mapEmbedUrl: '',
};

import { cn } from '@/lib/utils';

export default function AdminContactPage() {
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ContactInfoData>(defaultData);
    const [previewMap, setPreviewMap] = useState(false);

    useEffect(() => { fetchContactInfo(); }, []);

    const fetchContactInfo = async () => {
        try {
            const res = await fetch('/api/admin/contact');
            const result = await res.json();
            if (result.success && result.data) {
                setFormData({
                    address: result.data.address,
                    phone: result.data.phone,
                    email: result.data.email,
                    mapEmbedUrl: result.data.mapEmbedUrl,
                });
            }
        } catch { toast.error('İletişim bilgileri yüklenemedi'); }
        finally { setFetching(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Kaydediliyor...');
        try {
            const res = await fetch('/api/admin/contact', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error();
            toast.success('Başarıyla güncellendi', { id: toastId });
        } catch { toast.error('Hata oluştu', { id: toastId }); }
        finally { setLoading(false); }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 size={40} className="animate-spin text-slate-200" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">İletişim Bilgileri</h1>
                <p className="text-sm text-slate-500 font-medium">Müşterilerinize görünecek iletişim detaylarını yönetin.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left Columns - Inputs */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <Phone size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Genel İletişim</h2>
                                <p className="text-xs text-slate-400 font-medium">Telefon ve e-posta desteği.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TELEFON NUMARASI</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-6 py-4 font-bold text-slate-900 outline-none transition-all shadow-sm"
                                        placeholder="+90 5XX XXX XX XX"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-POSTA ADRESİ</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-6 py-4 font-bold text-slate-900 outline-none transition-all shadow-sm"
                                        placeholder="destek@aysiletisim.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Konum & Harita</h2>
                                <p className="text-xs text-slate-400 font-medium">Fiziksel adres ve Google Maps entegrasyonu.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">FİZİKSEL ADRES</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-6 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-6 py-4 font-bold text-slate-900 outline-none transition-all shadow-sm resize-none"
                                        placeholder="Mağaza adresi..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GOOGLE MAPS EMBED URL</label>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMap(!previewMap)}
                                        className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                    >
                                        <Eye size={12} strokeWidth={3} /> {previewMap ? 'GİZLE' : 'HARİTAYI ÖNİZLE'}
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="url"
                                        value={formData.mapEmbedUrl}
                                        onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-6 py-4 font-bold text-slate-900 outline-none transition-all shadow-sm"
                                        placeholder="https://www.google.com/maps/embed?..."
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 italic ml-1 leading-relaxed">
                                    * Google Maps &gt; Paylaş &gt; Haritayı göm &gt; Kodu kopyala &gt; src="..." içindeki URL'yi buraya yapıştırın.
                                </p>
                            </div>

                            {previewMap && formData.mapEmbedUrl && (
                                <div className="rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner h-[300px] animate-in zoom-in-95 duration-300">
                                    <iframe
                                        src={formData.mapEmbedUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Columns - Sticky Action Container */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                    {/* Status / Quick Preview Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200">
                        <div className="flex items-center gap-3 mb-8 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Canlı Görünüm</span>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">ADRES</span>
                                <p className="text-sm font-bold text-slate-200 leading-relaxed whitespace-pre-line">{formData.address || '—'}</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">İLETİŞİM</span>
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-slate-200">{formData.phone || '—'}</p>
                                    <p className="text-sm font-bold text-blue-400 break-all">{formData.email || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>GÜNCELLENİYOR</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>BİLGİLERİ KAYDET</span>
                                </>
                            )}
                        </button>

                        <a
                            href="/iletisim"
                            target="_blank"
                            className="w-full bg-slate-50 text-slate-400 font-black py-4 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
                        >
                            <Eye size={14} /> ÖNİZLEMEYİ GÖRÜNTÜLE
                        </a>
                    </div>
                </div>
            </form>
        </div>
    );
}
