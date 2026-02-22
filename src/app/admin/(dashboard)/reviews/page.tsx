'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Star, CheckCircle2, XCircle, Eye, Loader2, MessageSquare, Trash2, User, Clock } from 'lucide-react';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    isApproved: boolean;
    createdAt: string;
    user: { fullName: string; email: string };
    product: { name: string; slug: string };
}

type Filter = 'ALL' | 'PENDING' | 'APPROVED';

import { cn } from '@/lib/utils';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>('PENDING');

    useEffect(() => { fetchReviews(); }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            setReviews(data.data || []);
        } catch { toast.error('Değerlendirmeler yüklenemedi'); }
        finally { setLoading(false); }
    };

    const handleApprove = async (id: string) => {
        const toastId = toast.loading('Onaylanıyor...');
        try {
            await fetch(`/api/admin/reviews/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isApproved: true }),
            });
            toast.success('Onaylandı', { id: toastId });
            fetchReviews();
        } catch { toast.error('Hata oluştu', { id: toastId }); }
    };

    const handleReject = async (id: string) => {
        const toastId = toast.loading('Beklemeye alınıyor...');
        try {
            await fetch(`/api/admin/reviews/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isApproved: false }),
            });
            toast.success('Onay geri çekildi', { id: toastId });
            fetchReviews();
        } catch { toast.error('Hata oluştu', { id: toastId }); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu değerlendirmeyi silmek istediğinizden emin misiniz?')) return;
        const toastId = toast.loading('Siliniyor...');
        try {
            await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
            toast.success('Silindi', { id: toastId });
            fetchReviews();
        } catch { toast.error('Hata oluştu', { id: toastId }); }
    };

    const filtered = reviews.filter(r => {
        if (filter === 'ALL') return true;
        if (filter === 'PENDING') return !r.isApproved;
        if (filter === 'APPROVED') return r.isApproved;
        return true;
    });

    const pending = reviews.filter(r => !r.isApproved).length;
    const approved = reviews.filter(r => r.isApproved).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Yorum Moderasyonu</h1>
                    <p className="text-sm text-slate-500 font-medium">Müşteri yorumlarını denetleyin ve yayına alın.</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Onay Bekleyen', count: pending, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock },
                    { label: 'Onaylanmış', count: approved, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 },
                    { label: 'Toplam Mesaj', count: reviews.length, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: MessageSquare },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className={cn("bg-white p-6 rounded-3xl border shadow-sm relative overflow-hidden", s.border)}>
                            <div className={cn("absolute top-0 right-0 p-4 opacity-[0.05]", s.color)}>
                                <Icon size={64} strokeWidth={3} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                            <p className={cn("text-4xl font-black tracking-tighter leading-none", s.color)}>{s.count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                    {(['PENDING', 'APPROVED', 'ALL'] as Filter[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 px-5 py-2 rounded-lg font-bold text-xs transition-all uppercase tracking-tight",
                                filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {f === 'PENDING' ? `Bekleyen` : f === 'APPROVED' ? `Onaylı` : `Tümü`}
                        </button>
                    ))}
                </div>
                <p className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
                    {filtered.length} sonuç listeleniyor
                </p>
            </div>

            {loading ? (
                <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-200 mx-auto" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-3">
                    <MessageSquare size={48} className="text-slate-200" />
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Kayıt Bulunmuyor</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filtered.map(r => (
                        <div key={r.id} className={cn(
                            "group bg-white rounded-3xl p-8 border hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden",
                            r.isApproved ? "border-emerald-100" : "border-amber-100"
                        )}>
                            <div className={cn(
                                "absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity",
                                r.isApproved ? "bg-emerald-500" : "bg-amber-500"
                            )} />

                            <div className="flex flex-col md:flex-row gap-8 justify-between">
                                <div className="flex-1 space-y-4">
                                    {/* Top Line */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{r.user.fullName}</h3>
                                                <p className="text-xs font-medium text-slate-400 mt-1">{r.user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={cn("w-3 h-3", i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200')} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Product Context */}
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                            <Eye size={12} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">İlgili Ürün:</span>
                                        <a href={`/urunler/${r.product.slug}`} target="_blank" className="text-xs font-bold text-blue-600 hover:underline">
                                            {r.product.name}
                                        </a>
                                    </div>

                                    {/* Comment Body */}
                                    {r.comment && (
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
                                            <div className="absolute top-4 right-4 opacity-5 text-slate-900">
                                                <MessageSquare size={48} />
                                            </div>
                                            <p className="text-slate-700 text-sm leading-relaxed font-medium relative z-10 italic">
                                                "{r.comment}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                        <Clock size={12} /> {new Date(r.createdAt).toLocaleString('tr-TR')}
                                    </div>
                                </div>

                                {/* Sidebar Actions */}
                                <div className="md:w-48 flex flex-col gap-3 justify-center">
                                    {!r.isApproved ? (
                                        <button
                                            onClick={() => handleApprove(r.id)}
                                            className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                                        >
                                            <CheckCircle2 size={16} /> ONAYLA
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReject(r.id)}
                                            className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                                        >
                                            <XCircle size={16} /> BEKLEMEYE AL
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-500 py-3 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100"
                                    >
                                        <Trash2 size={16} /> SİL
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
