'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Edit2, Check, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        fullName: '',
        phone: '',
        city: '',
        district: '',
        openAddress: '',
        isDefault: false
    });

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/user/addresses');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (error) {
            toast.error('Adresler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const url = editingId
                ? `/api/user/addresses/${editingId}`
                : '/api/user/addresses';

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error('İşlem başarısız');

            toast.success(editingId ? 'Adres güncellendi' : 'Adres eklendi');
            setIsModalOpen(false);
            setEditingId(null);
            resetForm();
            fetchAddresses();
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Silinemedi');

            toast.success('Adres silindi');
            fetchAddresses();
        } catch (error) {
            toast.error('Silme işlemi başarısız');
        }
    };

    const handleEdit = (address: any) => {
        setForm({
            title: address.title,
            fullName: address.fullName,
            phone: address.phone,
            city: address.city,
            district: address.district,
            openAddress: address.openAddress,
            isDefault: address.isDefault
        });
        setEditingId(address.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setForm({
            title: '',
            fullName: '',
            phone: '',
            city: '',
            district: '',
            openAddress: '',
            isDefault: false
        });
        setEditingId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/hesabim"
                            className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center transition-all hover:bg-slate-50 shadow-sm active:scale-90"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Adreslerim</h1>
                            <p className="text-slate-400 text-xs font-medium mt-0.5">{addresses.length} kayıtlı adres</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all font-semibold text-sm shadow-lg shadow-blue-500/20 active:translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Adres Ekle
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <MapPin className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-xl mb-2">Henüz adres eklemediniz</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs mx-auto">Siparişlerinizde kullanmak için bir teslimat adresi ekleyin.</p>
                        <button
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl transition-all font-semibold text-sm shadow-lg active:translate-y-0.5"
                        >
                            Adres Ekle
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {addresses.map((address) => (
                            <div key={address.id} className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-blue-200 transition-all duration-300 group relative shadow-sm">
                                {address.isDefault && (
                                    <span className="absolute top-4 right-4 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-100">
                                        Varsayılan
                                    </span>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 font-semibold text-sm">{address.title}</h3>
                                        <p className="text-slate-400 text-xs mt-0.5 font-medium">{address.fullName}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-slate-600 text-[13px] leading-relaxed line-clamp-2 min-h-[40px] font-medium">
                                        {address.openAddress}
                                    </p>
                                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-tight mt-2">
                                        {address.district} / {address.city}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-5 border-t border-slate-50">
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs py-2.5 rounded-xl transition-colors active:scale-95"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all active:scale-95"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white border border-slate-200 rounded-[2rem] w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                                    {editingId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                                </h2>
                                <p className="text-slate-400 text-xs font-medium mt-1">Teslimat bilgilerini eksiksiz doldurun</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-9 h-9 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl flex items-center justify-center transition-all active:scale-90"
                            >
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Adres Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Örn: Ev, İş"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:border-blue-600 focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Ad Soyad</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:border-blue-600 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Telefon</label>
                                    <input
                                        type="tel"
                                        required
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:border-blue-600 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">İl</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.city}
                                        onChange={e => setForm({ ...form, city: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:border-blue-600 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">İlçe</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.district}
                                        onChange={e => setForm({ ...form, district: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:border-blue-600 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Açık Adres</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={form.openAddress}
                                    onChange={e => setForm({ ...form, openAddress: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:border-blue-600 focus:bg-white outline-none resize-none transition-all"
                                />
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-100 group">
                                <div className={cn(
                                    "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                    form.isDefault ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-slate-400"
                                )}>
                                    {form.isDefault && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={form.isDefault}
                                    onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                                />
                                <span className="text-slate-900 text-xs font-semibold">Varsayılan adres olarak ayarla</span>
                            </label>

                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:translate-y-0.5"
                            >
                                {submitLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Kaydediliyor...
                                    </span>
                                ) : 'Adresi Kaydet'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
