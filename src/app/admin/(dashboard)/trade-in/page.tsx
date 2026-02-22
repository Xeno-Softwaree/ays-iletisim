'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Phone, CheckCircle2, XCircle, Clock, Search, MessageSquare, Save, Smartphone, Award, AlertCircle, ChevronDown, X } from 'lucide-react';
import { useFilteredData } from '@/hooks/useFilteredData';

interface TradeInRequest {
    id: string;
    brand: string;
    model: string;
    screenCondition: string;
    batteryHealth: number;
    estimatedPrice: number;
    finalOffer: number | null;
    adminNote: string | null;
    customerPhone: string;
    status: string;
    createdAt: string;
}

import { cn } from '@/lib/utils';

export default function AdminTradeInPage() {
    const [requests, setRequests] = useState<TradeInRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const { filteredData, searchTerm, setSearchTerm, filters, setFilter, resetFilters } = useFilteredData(requests, {
        searchKeys: ['brand', 'model', 'customerPhone']
    });

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/trade-in');
            const result = await res.json();
            if (result.success) {
                setRequests(result.data);
            } else {
                toast.error('Hata!', { description: result.message });
            }
        } catch (error) {
            toast.error('Bağlantı Hatası', { description: 'Talepler yüklenemedi' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdate = async (id: string, updates: Partial<TradeInRequest>) => {
        setUpdatingId(id);
        const toastId = toast.loading('Güncelleniyor...');

        try {
            const payload = { ...updates };
            if (payload.finalOffer !== undefined) {
                const val = String(payload.finalOffer).replace(',', '.');
                payload.finalOffer = val === '' ? 0 : parseFloat(val);
            }

            const res = await fetch('/api/trade-in', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...payload }),
            });
            const result = await res.json();

            if (result.success) {
                toast.success('Başarılı!', {
                    id: toastId,
                    description: 'Kayıt güncellendi.',
                    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                });
                setRequests(prev => prev.map(r => r.id === id ? { ...r, ...payload } : r));
            } else {
                throw new Error(result.error || result.message || 'Güncelleme başarısız');
            }
        } catch (error: any) {
            toast.error('Hata!', {
                id: toastId,
                description: error.message || 'Veritabanı hatası oluştu.',
                icon: <XCircle className="w-5 h-5 text-red-600" />
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const statusConfig = {
        'Beklemede': { label: 'Beklemede', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: Clock },
        'İnceleniyor': { label: 'İnceleniyor', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: Search },
        'Onaylandı': { label: 'Onaylandı', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: CheckCircle2 },
        'Reddedildi': { label: 'Reddedildi', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', icon: XCircle }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Takas Merkezi</h1>
                    <p className="text-sm text-slate-500 font-medium">Gelen cihaz tekliflerini ve değerlendirmeleri yönetin.</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative group w-full md:flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Marka, model veya telefon ara..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-10 py-2.5 text-sm outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <select
                            onChange={(e) => setFilter('status', e.target.value)}
                            value={filters['status'] || ''}
                            className="w-full md:w-48 appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 hover:bg-white transition-all cursor-pointer h-full"
                        >
                            <option value="">Tüm Durumlar</option>
                            {Object.keys(statusConfig).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Veriler Yükleniyor...</p>
                </div>
            ) : filteredData.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-3">
                    <Smartphone className="w-12 h-12 text-slate-200" />
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Talep Bulunamadı</p>
                    <button onClick={resetFilters} className="text-xs text-blue-600 font-bold hover:underline font-mono">FİLTRELERİ SIFIRLA</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredData.map((request) => {
                        const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.Beklemede;
                        const StatusIcon = config.icon;

                        return (
                            <div key={request.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col lg:flex-row gap-10">
                                    {/* Device Info */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white flex-shrink-0">
                                                <Smartphone className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter",
                                                        config.bg, config.text, config.border
                                                    )}>
                                                        <StatusIcon size={12} />
                                                        {config.label}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-tight">
                                                        <Clock size={12} /> {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                                    {request.brand} <span className="font-medium text-slate-500">{request.model}</span>
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">EKRAN</p>
                                                <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{request.screenCondition}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PİL SAĞLIĞI</p>
                                                <p className="text-sm font-bold text-slate-900">%{request.batteryHealth}</p>
                                            </div>
                                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 col-span-2 shadow-sm">
                                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">SİSTEM TAHMİNİ</p>
                                                <p className="font-black text-blue-600 text-xl tracking-tighter">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(request.estimatedPrice))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions & Offers */}
                                    <div className="lg:w-[400px] space-y-6 lg:border-l lg:border-slate-100 lg:pl-10">
                                        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6">
                                            <div className="space-y-2.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <Award size={12} className="text-slate-300" />
                                                    Kayıt Durumu
                                                </label>
                                                <div className="relative group/select">
                                                    <select
                                                        value={request.status}
                                                        onChange={(e) => handleUpdate(request.id, { status: e.target.value })}
                                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 appearance-none font-bold text-slate-900 outline-none transition-all cursor-pointer shadow-sm text-sm group-hover/select:border-slate-300"
                                                    >
                                                        {Object.keys(statusConfig).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover/select:text-slate-600 transition-colors" />
                                                </div>
                                            </div>

                                            <div className="space-y-2.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <Save size={12} className="text-slate-300" />
                                                    Nihai Teklif
                                                </label>
                                                <div className="relative group/input">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 pointer-events-none group-focus-within/input:text-emerald-500 transition-colors">₺</div>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={request.finalOffer || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setRequests(prev => prev.map(r => r.id === request.id ? { ...r, finalOffer: val === '' ? null : parseFloat(val) } : r));
                                                        }}
                                                        onBlur={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (!isNaN(val)) handleUpdate(request.id, { finalOffer: val });
                                                        }}
                                                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 font-black text-slate-900 outline-none transition-all text-xl shadow-sm group-hover/input:border-slate-300 placeholder:text-slate-200 tracking-tighter"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <MessageSquare size={12} className="text-slate-300" />
                                                    Değerlendirme Notu
                                                </label>
                                                <textarea
                                                    value={request.adminNote || ''}
                                                    onChange={(e) => setRequests(prev => prev.map(r => r.id === request.id ? { ...r, adminNote: e.target.value } : r))}
                                                    onBlur={(e) => handleUpdate(request.id, { adminNote: e.target.value })}
                                                    placeholder="İnceleme detaylarını buraya ekleyin..."
                                                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all resize-none min-h-[100px] shadow-sm group-hover:border-slate-300 placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>

                                        <a
                                            href={`tel:${request.customerPhone}`}
                                            className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 group/phone"
                                        >
                                            <Phone className="w-4 h-4 transition-transform group-hover/phone:rotate-12" />
                                            <span className="tracking-tight">{request.customerPhone}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
