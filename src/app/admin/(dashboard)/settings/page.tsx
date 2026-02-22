'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    CheckCircle2,
    XCircle,
    Settings as SettingsIcon,
    Phone,
    Percent,
    Smartphone,
    Plus,
    Trash2,
    Loader2,
    Save
} from 'lucide-react';

interface TradeInModel {
    brand: string;
    name: string;
    basePrice: number;
}

interface SettingsFormData {
    whatsappNumber: string;
    defaultMessage: string;
    baseDiscountRate: number;
    conditionMultipliers: Record<string, number>;
    tradeInModels: TradeInModel[];
}

import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SettingsFormData>({
        whatsappNumber: '',
        defaultMessage: '',
        baseDiscountRate: 0.2,
        conditionMultipliers: {
            'Temiz': 1.0,
            'Çizik': 0.85,
            'Kırık': 0.6
        },
        tradeInModels: []
    });

    const [newModel, setNewModel] = useState<TradeInModel>({ brand: 'Apple', name: '', basePrice: 0 });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const result = await res.json();

            if (result.success && result.data) {
                setFormData({
                    whatsappNumber: result.data.whatsappNumber,
                    defaultMessage: result.data.defaultMessage,
                    baseDiscountRate: result.data.baseDiscountRate,
                    conditionMultipliers: result.data.conditionMultipliers || {
                        'Temiz': 1.0,
                        'Çizik': 0.85,
                        'Kırık': 0.6
                    },
                    tradeInModels: result.data.tradeInModels || []
                });
            }
        } catch (error) {
            console.error('Settings fetch error:', error);
            toast.error('Ayarlar yüklenemedi');
        } finally {
            setFetching(false);
        }
    };

    const handleNumberInput = (val: string) => {
        return val.replace(',', '.');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Ayarlar kaydediliyor...');

        try {
            const dataToSave = {
                ...formData,
                baseDiscountRate: Number(formData.baseDiscountRate),
                tradeInModels: formData.tradeInModels.map(m => ({
                    ...m,
                    basePrice: Number(m.basePrice)
                }))
            };

            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.error || result.message || 'Kayıt başarısız');
            }

            toast.success('Başarılı!', {
                id: toastId,
                description: 'Ayarlar başarıyla güncellendi.',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
            });

            fetchSettings();
        } catch (error: any) {
            toast.error('Hata!', {
                id: toastId,
                description: error.message || 'Ayarlar kaydedilemedi.',
                icon: <XCircle className="w-5 h-5 text-red-600" />,
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sistem Ayarları Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sistem Ayarları</h1>
                    <p className="text-sm text-slate-500 font-medium">Platform parametrelerini ve fiyatlandırma motorunu yönetin.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Communications & Models */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Communication */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none italic font-black text-8xl antialiased">WA</div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm">
                                    <Phone size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">İletişim & WhatsApp</h2>
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WHATSAPP NUMARASI</label>
                                    <input
                                        type="tel"
                                        value={formData.whatsappNumber}
                                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                        placeholder="+90 555 123 45 67"
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-bold text-slate-900 shadow-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">VARSAYILAN MESAJ TASLAĞI</label>
                                    <textarea
                                        value={formData.defaultMessage}
                                        onChange={(e) => setFormData({ ...formData, defaultMessage: e.target.value })}
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-medium text-slate-700 shadow-sm resize-none"
                                        required
                                    />
                                    <div className="flex items-center gap-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Tip: <span className="text-blue-600 font-mono">{"{productName}"}</span> etiketi ürün adıyla değişir.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trade-in Models */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                            <Smartphone className="w-40 h-40" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
                                    <Smartphone size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Takas Modelleri & Referans Fiyatlar</h2>
                            </div>

                            {/* Add reference */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">MARKA</label>
                                    <select
                                        value={newModel.brand}
                                        onChange={(e) => setNewModel({ ...newModel, brand: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    >
                                        <option value="Apple">Apple</option>
                                        <option value="Samsung">Samsung</option>
                                        <option value="Xiaomi">Xiaomi</option>
                                        <option value="Huawei">Huawei</option>
                                        <option value="Oppo">Oppo</option>
                                        <option value="Realme">Realme</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">MODEL ADI</label>
                                    <input
                                        type="text"
                                        value={newModel.name}
                                        onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                                        placeholder="Örn: iPhone 15 Pro"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">TABAN FİYAT</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={newModel.basePrice || ''}
                                                onChange={(e) => setNewModel({ ...newModel, basePrice: parseFloat(handleNumberInput(e.target.value)) || 0 })}
                                                placeholder="0.00"
                                                className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">₺</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!newModel.name || newModel.basePrice <= 0) {
                                                    toast.error('Lütfen geçerli bilgiler girin');
                                                    return;
                                                }
                                                const updatedModels = [...formData.tradeInModels, { ...newModel }];
                                                setFormData({ ...formData, tradeInModels: updatedModels });
                                                setNewModel({ brand: newModel.brand, name: '', basePrice: 0 });
                                                toast.success('Listeye eklendi', { description: 'Kaydetmeyi unutmayın.' });
                                            }}
                                            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition shadow-lg active:scale-95"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                                {formData.tradeInModels.length === 0 ? (
                                    <div className="text-center py-12 flex flex-col items-center gap-3">
                                        <Smartphone className="w-12 h-12 text-slate-100" />
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Henüz model eklenmedi</p>
                                    </div>
                                ) : (
                                    formData.tradeInModels.map((model, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 font-black text-[10px] text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors uppercase">
                                                    {model.brand.slice(0, 3)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm leading-none mb-1">{model.name}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{model.brand}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-5">
                                                <span className="font-black text-slate-900 text-sm tracking-tight">{model.basePrice.toLocaleString('tr-TR')} ₺</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newList = [...formData.tradeInModels];
                                                        newList.splice(idx, 1);
                                                        setFormData({ ...formData, tradeInModels: newList });
                                                    }}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing Logic */}
                <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 self-start">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                            <Percent className="w-40 h-40" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shadow-sm">
                                    <Percent size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Fiyatlandırma Algoritması</h2>
                            </div>

                            <div className="p-6 bg-slate-950 rounded-3xl text-white shadow-xl shadow-slate-200 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ANA İNDİRİM ÇARPANI</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="text"
                                            value={formData.baseDiscountRate}
                                            onChange={(e) => setFormData({ ...formData, baseDiscountRate: parseFloat(handleNumberInput(e.target.value)) || 0 })}
                                            className="w-24 bg-white/10 border border-white/10 focus:border-white focus:bg-white/20 rounded-xl px-4 py-3 outline-none text-white font-black text-2xl text-center transition-all"
                                            required
                                        />
                                        <p className="text-[10px] font-medium text-slate-400 leading-tight">
                                            Piyasa değerinden düşülecek ana oran.<br />
                                            Örn: <span className="text-white font-bold">0.20</span> ise %20 kâr marjı ayrılır.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">KONDİSYON ÇARPANLARI</label>
                                <div className="grid gap-3">
                                    {Object.entries(formData.conditionMultipliers).map(([condition, multiplier]) => (
                                        <div key={condition} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 antialiased" />
                                                <span className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{condition}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-300 italic">fiyat ×</span>
                                                <input
                                                    type="text"
                                                    value={multiplier}
                                                    onChange={(e) => {
                                                        const val = parseFloat(handleNumberInput(e.target.value)) || 0;
                                                        setFormData({
                                                            ...formData,
                                                            conditionMultipliers: { ...formData.conditionMultipliers, [condition]: val }
                                                        });
                                                    }}
                                                    className="w-16 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-lg py-1.5 outline-none text-slate-900 font-bold text-center text-sm shadow-inner transition-all"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-black py-4.5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest group disabled:opacity-50 mt-4"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>GÜNCELLENİYOR</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} className="group-hover:translate-y-[-1px] transition-transform" />
                                        <span>AYARLARI KAYDET</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
