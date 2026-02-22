'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Tag, Plus, Trash2, Edit2, CheckCircle2, XCircle, Loader2,
    Percent, DollarSign, Calendar, Hash, ToggleLeft, ToggleRight, X
} from 'lucide-react';

interface Coupon {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    minOrderAmount: number | null;
    expirationDate: string | null;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
}

const emptyForm = {
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    expirationDate: '',
    usageLimit: '',
    isActive: true,
};

import { cn } from '@/lib/utils';

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { fetchCoupons(); }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons');
            const data = await res.json();
            setCoupons(data.data || []);
        } catch { toast.error('Kuponlar yüklenemedi'); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (c: Coupon) => {
        setEditId(c.id);
        setForm({
            code: c.code,
            discountType: c.discountType,
            discountValue: String(c.discountValue),
            minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : '',
            expirationDate: c.expirationDate ? c.expirationDate.substring(0, 10) : '',
            usageLimit: c.usageLimit ? String(c.usageLimit) : '',
            isActive: c.isActive,
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const toastId = toast.loading('Kaydediliyor...');
        const body = {
            code: form.code.toUpperCase(),
            discountType: form.discountType,
            discountValue: parseFloat(form.discountValue),
            minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
            expirationDate: form.expirationDate ? new Date(form.expirationDate).toISOString() : null,
            usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
            isActive: form.isActive,
        };
        try {
            const res = await fetch(editId ? `/api/admin/coupons/${editId}` : '/api/admin/coupons', {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error();
            toast.success(editId ? 'Kupon güncellendi' : 'Kupon oluşturuldu', { id: toastId });
            setShowModal(false);
            fetchCoupons();
        } catch { toast.error('İşlem başarısız', { id: toastId }); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return;
        const toastId = toast.loading('Siliniyor...');
        try {
            await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
            toast.success('Kupon silindi', { id: toastId });
            fetchCoupons();
        } catch { toast.error('Hata oluştu', { id: toastId }); }
    };

    const handleToggle = async (c: Coupon) => {
        try {
            await fetch(`/api/admin/coupons/${c.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...c, isActive: !c.isActive }),
            });
            fetchCoupons();
        } catch { toast.error('Güncellenemedi'); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kupon Yönetimi</h1>
                    <p className="text-sm text-slate-500 font-medium">İndirim kampanyalarınızı ve özel kodları yönetin.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                >
                    <Plus size={18} strokeWidth={3} /> Yeni Kupon Oluştur
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[200px] bg-white rounded-3xl border border-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : coupons.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                        <Tag size={40} />
                    </div>
                    <div>
                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight">Aktif Kupon Bulunmuyor</p>
                        <p className="text-sm text-slate-400 font-medium">Kampanyalarınızı başlatmak için yeni bir kupon oluşturun.</p>
                    </div>
                    <button onClick={openCreate} className="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                        + İlk Kuponu Oluştur
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map(c => {
                        const isExpired = c.expirationDate && new Date(c.expirationDate) < new Date();
                        return (
                            <div key={c.id} className={cn(
                                "group bg-white rounded-3xl p-8 border border-slate-200 transition-all relative overflow-hidden",
                                (!c.isActive || isExpired) && "opacity-60 grayscale-[0.5]"
                            )}>
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Tag size={24} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(c)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all scale-90 hover:scale-100">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(c.id)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all scale-90 hover:scale-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-2xl text-slate-900 tracking-wider uppercase">{c.code}</span>
                                        <button onClick={() => handleToggle(c)} className="transition-transform active:scale-90">
                                            {c.isActive ? <ToggleRight size={32} className="text-emerald-500" strokeWidth={1} /> : <ToggleLeft size={32} className="text-slate-300" strokeWidth={1} />}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {c.discountType === 'PERCENTAGE' ? `%${c.discountValue} İNDİRİM` : `${c.discountValue}₺ İNDİRİM`}
                                        </div>
                                        {isExpired && (
                                            <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                SÜRESİ DOLDU
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 space-y-3">
                                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-slate-400" />
                                                <span>{c.expirationDate ? new Date(c.expirationDate).toLocaleDateString('tr-TR') : 'SÜRESİZ'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Hash size={12} className="text-slate-400" />
                                                <span>{c.usedCount} / {c.usageLimit ?? '∞'} KULLANIM</span>
                                            </div>
                                        </div>
                                        {c.minOrderAmount && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                                * {c.minOrderAmount} ₺ Üzeri siparişlerde geçerli
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="p-10 pb-6">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                        {editId ? 'Kuponu Düzenle' : 'Yeni Kupon Oluştur'}
                                    </h2>
                                    <p className="text-xs font-medium text-slate-400 mt-1">Kampanya detaylarını belirleyin.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">KUPON KODU</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.code}
                                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                            className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 font-black text-slate-900 outline-none transition-all shadow-sm tracking-widest"
                                            placeholder="YAZFIRTSATI"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İNDİRİM TİPİ</label>
                                        <select
                                            value={form.discountType}
                                            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                        >
                                            <option value="PERCENTAGE">Yüzde (%)</option>
                                            <option value="FIXED">Sabit Tutar (₺)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İNDİRİM DEĞERİ</label>
                                        <div className="relative group">
                                            {form.discountType === 'PERCENTAGE' ? <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /> : <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />}
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                value={form.discountValue}
                                                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-6 py-4 font-black text-slate-900 outline-none transition-all shadow-sm"
                                                placeholder="20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MİN. SİPARİŞ TUTARI (₺)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.minOrderAmount}
                                            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 font-black text-slate-900 outline-none transition-all shadow-sm"
                                            placeholder="Opsiyonel"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SON KULLANMA TARİHİ</label>
                                        <input
                                            type="date"
                                            value={form.expirationDate}
                                            onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">KULLANIM LİMİTİ</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.usageLimit}
                                            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 font-black text-slate-900 outline-none transition-all shadow-sm"
                                            placeholder="∞"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-slate-100 text-slate-500 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] bg-blue-600 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : (editId ? <CheckCircle2 size={16} /> : <Plus size={16} strokeWidth={3} />)}
                                        {editId ? 'KUPONU GÜNCELLE' : 'KUPONU OLUŞTUR'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
