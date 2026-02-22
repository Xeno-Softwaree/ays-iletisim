'use client';

import { useState } from 'react';
import { Search, Package, MapPin, Calendar, CircleDollarSign, AlertCircle, CheckCircle2, Clock, Truck, Home } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
    id: string;
    quantity: number;
    price: string;
    product: {
        name: string;
        images: string[];
        slug: string;
    };
}

interface OrderDetails {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: string;
    createdAt: string;
    address: string | null;
    city: string | null;
    items: OrderItem[];
    trackingNumber: string | null;
}

const statusMap = {
    PENDING: { label: 'Sipariş Alındı', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock },
    PROCESSING: { label: 'Hazırlanıyor', color: 'text-amber-600', bg: 'bg-amber-50', icon: Package },
    SHIPPED: { label: 'Kargoya Verildi', color: 'text-purple-600', bg: 'bg-purple-50', icon: Truck },
    DELIVERED: { label: 'Teslim Edildi', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
    CANCELLED: { label: 'İptal Edildi', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
};

export default function OrderTrackingPage() {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<OrderDetails | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            const res = await fetch('/api/orders/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, email }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Sipariş bulunamadı.');
            }

            const data = await res.json();
            setOrder(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Sipariş Takibi</h1>
                    <p className="text-slate-500 font-medium">
                        Sipariş durumunu sorgulamak için lütfen sipariş numaranızı ve e-posta adresinizi giriniz.
                    </p>
                </div>

                {/* Tracking Form */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Sipariş Numarası</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        placeholder="Örn: 550e8400-..."
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
                                        required
                                    />
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">E-posta Adresi</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ornek@email.com"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                        required
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sorgulanıyor...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    Sorgula
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                {/* Order Details Result */}
                {order && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Status Card */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 overflow-hidden relative shadow-sm">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${statusMap[order.status].bg} rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-50`} />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Sipariş Durumu</p>
                                    <div className={`flex items-center gap-3 text-2xl font-black ${statusMap[order.status].color}`}>
                                        <div className={`p-2 rounded-xl ${statusMap[order.status].bg} border border-current/10`}>
                                            {(() => {
                                                const Icon = statusMap[order.status].icon;
                                                return <Icon className="w-6 h-6" />;
                                            })()}
                                        </div>
                                        {statusMap[order.status].label}
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Sipariş Tarihi</p>
                                    <p className="text-slate-900 font-bold text-lg">
                                        {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Tracking Number if available */}
                            {order.trackingNumber && (
                                <div className="mb-8 p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Truck className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-blue-500 text-[10px] font-black uppercase tracking-wider mb-0.5">Kargo Takip Numarası</p>
                                        <p className="text-blue-900 font-mono font-black text-lg tracking-wide">{order.trackingNumber}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" /> Teslimat Adresi
                                    </p>
                                    <p className="text-slate-900 font-bold text-base leading-relaxed">
                                        {order.address || 'Adres bilgisi yok'}
                                        <br />
                                        <span className="text-slate-500 font-medium">{order.city}</span>
                                    </p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2 flex items-center sm:justify-end gap-1.5">
                                        <CircleDollarSign className="w-3.5 h-3.5" /> Toplam Tutar
                                    </p>
                                    <p className="text-slate-900 text-3xl font-black tracking-tight">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(order.totalAmount))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-900 px-1 uppercase tracking-tight">Sipariş İçeriği</h3>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-slate-300 transition-colors">
                                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl flex-shrink-0 overflow-hidden">
                                            {item.product.images[0] ? (
                                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/urunler/${item.product.slug}`} className="text-slate-900 font-bold hover:text-blue-600 transition-colors line-clamp-1 block text-lg">
                                                {item.product.name}
                                            </Link>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                                                    ADET: {item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-slate-900 font-black text-lg">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(item.price))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
