'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    Package,
    Zap,
    MessageCircle,
    ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

function formatPrice(n: number) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
}

interface Props {
    whatsappNumber: string; // digits only, e.g. "905332352406"
}

export default function CartClient({ whatsappNumber }: Props) {
    const { items, totalCount, totalPrice, removeItem, updateQty, clearCart } = useCart();
    const [removing, setRemoving] = useState<string | null>(null);

    const handleRemove = (id: string, name: string) => {
        setRemoving(id);
        setTimeout(() => {
            removeItem(id);
            setRemoving(null);
            toast.success(`${name} sepetten çıkarıldı`);
        }, 300);
    };

    const buildWhatsAppUrl = () => {
        const list = items.map(i => `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`).join('\n');
        const text = `Merhaba, sepetimde ${totalCount} ürün var ve toplamda ${formatPrice(totalPrice)} tutarında sipariş vermek istiyorum:\n\n${list}`;
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-2xl mx-auto px-4 py-32 text-center">
                    <div className="w-24 h-24 bg-white border border-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <ShoppingCart className="w-10 h-10 text-slate-200" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">SEPETİNİZ BOŞ</h1>
                    <p className="text-slate-500 text-sm mb-8 font-medium">Henüz sepetinize ürün eklemediniz.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white font-black px-10 py-4 rounded-2xl hover:bg-black transition-all hover:-translate-y-0.5 shadow-xl shadow-slate-900/10"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        ALIŞVERİŞE BAŞLA
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Ambient glow */}
            <div className="absolute top-0 left-0 right-0 h-64 overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <Link href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-3 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            ALIŞVERİŞE DEVAM ET
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                            Sepetim
                            <span className="ml-3 text-lg text-slate-300 font-bold">({totalCount} ÜRÜN)</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => { clearCart(); toast.success('Sepet temizlendi'); }}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-all border border-red-100"
                    >
                        <Trash2 className="w-4 h-4" />
                        Temizle
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-start">

                    {/* ─── Cart Items ─── */}
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`group flex gap-6 bg-white border border-slate-200 rounded-[32px] p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 ${removing === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                                    }`}
                            >
                                {/* Image */}
                                <Link href={`/urunler/${item.slug}`} className="flex-shrink-0">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 border border-slate-100 rounded-[24px] overflow-hidden flex items-center justify-center">
                                        {item.image
                                            ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            : <Package className="w-10 h-10 text-slate-200" />
                                        }
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-4">
                                            <Link href={`/urunler/${item.slug}`}>
                                                <h3 className="text-slate-900 font-black text-lg leading-tight hover:text-blue-600 transition-colors uppercase tracking-tight">
                                                    {item.name}
                                                </h3>
                                            </Link>
                                            <button
                                                onClick={() => handleRemove(item.id, item.name)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Birim: {formatPrice(item.price)}</p>
                                            {item.selectedColor && (
                                                <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                                                    {item.selectedColor}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-6">
                                        {/* Qty control */}
                                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                                            <button
                                                onClick={() => updateQty(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 transition-all font-black"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQty(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 transition-all disabled:opacity-20 disabled:cursor-not-allowed font-black"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <span className="text-slate-900 font-black text-xl tracking-tight">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ─── Order Summary ─── */}
                    <div className="lg:sticky lg:top-24">
                        <div className="bg-white border border-slate-200 rounded-[40px] p-8 space-y-6 shadow-2xl shadow-slate-200/50">
                            <h2 className="text-slate-900 font-black text-xl uppercase tracking-tight">Sipariş Özeti</h2>

                            <div className="space-y-4 text-sm font-bold uppercase tracking-widest text-[10px]">
                                <div className="flex justify-between text-slate-400">
                                    <span>Ara Toplam ({totalCount} ÜRÜN)</span>
                                    <span className="text-slate-900">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Kargo Ücreti</span>
                                    <span className="text-emerald-500">ÜCRETSİZ</span>
                                </div>
                                <div className="border-t border-slate-100 pt-6 flex justify-between text-slate-900 font-black text-2xl tracking-tighter normal-case">
                                    <span>Toplam</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-4 pt-2">
                                <button
                                    className="group relative w-full flex items-center justify-center gap-3 overflow-hidden bg-slate-900 hover:bg-black text-white font-black py-5 px-8 rounded-2xl transition-all duration-500 shadow-2xl shadow-slate-900/20 hover:-translate-y-1"
                                    onClick={() => toast.info('Ödeme sistemi yakında aktif olacak!', { description: 'Sipariş için WhatsApp üzerinden iletişime geçebilirsiniz.' })}
                                >
                                    <Zap className="w-5 h-5" />
                                    <span>SİPARİŞİ TAMAMLA</span>
                                </button>

                                <a
                                    href={buildWhatsAppUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative w-full flex items-center justify-center gap-3 overflow-hidden bg-white border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-black py-4.5 px-8 rounded-2xl transition-all duration-500 shadow-lg shadow-[#25D366]/5 hover:-translate-y-1"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>WHATSAPP İLE SİPARİŞ</span>
                                </a>
                            </div>

                            {/* Trust row */}
                            <div className="flex items-center justify-center gap-4 text-slate-300 text-[9px] font-black uppercase tracking-[0.2em] pt-4">
                                <span>GÜVENLİ</span>
                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span>HIZLI KARGO</span>
                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span>İADE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
