'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Smartphone,
    Zap,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Info,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { TurnstileWidget } from '@/components/security/TurnstileWidget';

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'Realme', 'Diğer'];

interface TradeInModel {
    brand: string;
    name: string;
    basePrice: number;
}

export default function TradeInPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [availableModels, setAvailableModels] = useState<TradeInModel[]>([]);
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        screenCondition: '',
        batteryHealth: 100,
        customerPhone: '',
        customerName: '',
        customerEmail: ''
    });

    const [result, setResult] = useState<{ estimatedPrice: number } | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    // Fetch available models from settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                const result = await res.json();
                if (result.success && result.data?.tradeInModels) {
                    setAvailableModels(result.data.tradeInModels);
                }
            } catch (error) {
                console.error('Settings fetch error:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/trade-in/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setResult({ estimatedPrice: data.estimatedPrice });
                setStep(3);
            } else {
                toast.error('Hata!', {
                    description: data.error || data.message || 'Fiyat hesaplanırken bir hata oluştu.'
                });
            }
        } catch (error: any) {
            toast.error('Bağlantı Hatası', {
                description: error.message || 'Bağlantı hatası oluştu.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        setLoading(true);

        if (!turnstileToken) {
            toast.error('Lütfen güvenlik doğrulamasını tamamlayın.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/trade-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    estimatedPrice: result?.estimatedPrice,
                    turnstileToken
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Başvurunuz Alındı!', {
                    description: 'En kısa sürede sizinle iletişime geçeceğiz.',
                    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />
                });
                setStep(4);
            } else {
                toast.error('Hata!', {
                    description: data.error || data.message || 'Başvuru gönderilirken bir hata oluştu.'
                });
            }
        } catch (error: any) {
            toast.error('Hata!', {
                description: error.message || 'Bağlantı hatası oluştu.'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredModels = availableModels.filter(m =>
        String(m.brand).toLowerCase().trim() === String(formData.brand).toLowerCase().trim()
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 shadow-inner">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block shadow-xl shadow-blue-500/20">TAKAS PROGRAMI</span>
                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">ESKİYİ GETİR, YENİYİ GÖTÜR!</h1>
                    <p className="text-lg text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
                        Eski telefonunuzun değerini anında öğrenin ve yeni bir cihaz alırken indirim olarak kullanın.
                    </p>
                </div>

                {/* Stepper */}
                <div className="flex justify-between items-center mb-16 max-w-md mx-auto relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full"></div>
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl z-10 transition-all duration-500 border-4 ${step >= s
                                ? 'bg-blue-600 text-white border-white shadow-2xl shadow-blue-600/30 scale-110'
                                : 'bg-white text-slate-300 border-slate-100'
                                }`}
                        >
                            {s}
                        </div>
                    ))}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[48px] shadow-2xl shadow-slate-200 border border-slate-100 p-8 md:p-14 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
                    {step === 1 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black text-black mb-8 flex items-center gap-3 tracking-tight uppercase">
                                    <Smartphone className="w-8 h-8" />
                                    1. MARKA SEÇİMİ
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {BRANDS.map((brand) => (
                                        <button
                                            key={brand}
                                            onClick={() => setFormData({ ...formData, brand, model: '' })}
                                            className={`py-6 px-4 rounded-3xl border-4 transition-all duration-200 font-black text-lg ${formData.brand === brand
                                                ? 'bg-black text-white border-black shadow-xl ring-4 ring-black/10 -translate-y-1'
                                                : 'bg-white text-black border-black/10 hover:border-black hover:bg-gray-50'
                                                }`}
                                        >
                                            {brand.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.brand && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                    <label className="block text-sm font-black text-black mb-4 uppercase tracking-widest">MODEL SEÇİN</label>
                                    <div className="relative group">
                                        <select
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            className="w-full h-20 px-8 bg-gray-50 border-4 border-black rounded-3xl appearance-none focus:ring-8 focus:ring-black/5 outline-none font-black text-xl text-black transition-all cursor-pointer group-hover:bg-white"
                                        >
                                            <option value="">Model Seçiniz</option>
                                            {filteredModels.length > 0 ? (
                                                filteredModels.map((m) => (
                                                    <option key={m.name} value={m.name}>{m.name.toUpperCase()}</option>
                                                ))
                                            ) : (
                                                <option value="Diğer">Diğer / Listede Yok</option>
                                            )}
                                        </select>
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none group-hover:translate-x-1 transition-transform">
                                            <ArrowRight className="w-8 h-8 text-black" />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-black font-bold italic opacity-60">* Aradığınız model listede yoksa &apos;Diğer&apos; seçeneğini kullanabilirsiniz.</p>
                                </div>
                            )}

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.brand || !formData.model}
                                className="w-full h-20 bg-black text-white rounded-3xl font-black text-2xl hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-black transition-all duration-300 shadow-2xl flex items-center justify-center gap-4 uppercase tracking-widest border-4 border-white"
                            >
                                SONRAKİ ADIM
                                <ArrowRight className="w-8 h-8" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleCalculate} className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h2 className="text-3xl font-black text-black mb-8 flex items-center gap-3 uppercase tracking-tight">
                                <Zap className="w-8 h-8 text-yellow-500" />
                                2. CİHAZ DURUMU
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <label className="block text-sm font-black text-black uppercase tracking-widest">Ekran Kondisyonu</label>
                                    <div className="flex flex-col gap-3">
                                        {['Temiz', 'Çizik', 'Kırık'].map((cond) => (
                                            <button
                                                key={cond}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, screenCondition: cond })}
                                                className={`py-5 px-6 rounded-2xl border-4 text-left font-black transition-all flex items-center justify-between ${formData.screenCondition === cond
                                                    ? 'bg-black text-white border-black shadow-xl ring-4 ring-black/10'
                                                    : 'bg-white text-black border-black/10 hover:border-black'
                                                    }`}
                                            >
                                                {cond.toUpperCase()}
                                                {formData.screenCondition === cond && <CheckCircle2 className="w-6 h-6" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="block text-sm font-black text-black uppercase tracking-widest">Pil Sağlığı (%): {formData.batteryHealth}</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="100"
                                        value={formData.batteryHealth}
                                        onChange={(e) => setFormData({ ...formData, batteryHealth: parseInt(e.target.value) })}
                                        className="w-full h-4 bg-black/10 rounded-full appearance-none cursor-pointer accent-black"
                                    />
                                    <div className="flex justify-between text-xs font-black text-black opacity-50 uppercase tracking-tighter">
                                        <span>%50 ve Altı</span>
                                        <span>%100</span>
                                    </div>

                                    <div className="p-6 bg-black text-white rounded-3xl border-4 border-black space-y-2 shadow-inner">
                                        <p className="font-black flex items-center gap-2 text-sm uppercase"><Info className="w-4 h-4" /> Önemli Not</p>
                                        <p className="text-xs font-bold leading-relaxed opacity-80 uppercase">
                                            Hesaplanan fiyat ön izleme niteliğindedir. Kesin fiyat, cihaz fiziksel olarak incelendikten sonra dükkanımızda verilecektir.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-10 h-20 bg-slate-50 text-slate-900 rounded-[28px] font-black text-xl border border-slate-200 hover:bg-white hover:border-slate-300 transition-all uppercase tracking-widest"
                                >
                                    GERİ
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.screenCondition}
                                    className="flex-1 h-20 bg-blue-600 text-white rounded-[28px] font-black text-2xl hover:bg-blue-700 disabled:opacity-30 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-4 uppercase tracking-widest"
                                >
                                    {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : 'FİYATI HESAPLA'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && result && (
                        <div className="text-center space-y-10 animate-in zoom-in duration-700">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 animate-pulse"></div>
                                <div className="relative bg-white border border-slate-100 p-8 md:p-14 rounded-[48px] shadow-2xl shadow-blue-500/10">
                                    <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.3em]">TAHMİNİ TEKLİFİMİZ</p>
                                    <p className="text-7xl md:text-8xl font-black text-slate-900 mb-4 tracking-tighter">
                                        {result.estimatedPrice.toLocaleString('tr-TR')}
                                        <span className="text-4xl text-blue-600/30 ml-4 font-black">TL</span>
                                    </p>
                                    <div className="h-2 w-24 bg-blue-600 mx-auto rounded-full mb-8"></div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest opacity-60 bg-slate-50 py-2 px-4 rounded-xl inline-block">
                                        {formData.brand} {formData.model} • {formData.screenCondition}
                                    </p>
                                </div>
                            </div>

                            <div className="max-w-md mx-auto space-y-6 bg-slate-50 p-8 rounded-[40px] border border-slate-200 border-dashed">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">İnceleme İçin İletişime Geçelim</h3>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Adınız Soyadınız"
                                            required
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            className="w-full h-16 px-6 bg-white border border-slate-200 rounded-[20px] outline-none font-black text-center text-lg placeholder:text-slate-300 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="E-posta Adresiniz (Durum bildirimleri için)"
                                            required
                                            value={formData.customerEmail}
                                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                            className="w-full h-16 px-6 bg-white border border-slate-200 rounded-[20px] outline-none font-black text-center text-lg placeholder:text-slate-300 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            placeholder="Telefon Numaranız (05XX...)"
                                            required
                                            value={formData.customerPhone}
                                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                            className="w-full h-16 px-6 bg-white border border-slate-200 rounded-[20px] outline-none font-black text-center text-lg placeholder:text-slate-300 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <TurnstileWidget action="trade-in" onToken={setTurnstileToken} />

                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={loading || !formData.customerPhone || !formData.customerName || !formData.customerEmail || !turnstileToken}
                                    className="w-full h-20 bg-slate-900 text-white rounded-[28px] font-black text-2xl hover:bg-slate-800 disabled:opacity-30 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-4 uppercase tracking-widest"
                                >
                                    {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : 'SİZİ ARAYALIM'}
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    className="text-slate-400 font-black uppercase text-[10px] hover:text-blue-600 transition-colors tracking-[0.2em]"
                                >
                                    Hesaplamayı Düzenle
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center py-20 space-y-8 animate-in bounce-in duration-500">
                            <div className="w-32 h-32 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto border border-emerald-100 shadow-xl shadow-emerald-500/10">
                                <CheckCircle2 className="w-20 h-20 text-emerald-600" />
                            </div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">TEŞEKKÜRLER!</h2>
                            <p className="text-lg text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                                Başvurunuz ekibimize ulaştı. Cihazınızı incelemek için en kısa sürede sizi arayacağız.
                            </p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-12 py-5 bg-blue-600 text-white rounded-[22px] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest border border-white/20"
                            >
                                ANA SAYFAYA DÖN
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-4 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-500">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GÜNCEL FİYAT</p>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Piyasa Değerinde</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-4 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-500">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HIZLI İŞLEME</p>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Aynı Gün Destek</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-4 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-500">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HER MARKA</p>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Tüm Modeller</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
