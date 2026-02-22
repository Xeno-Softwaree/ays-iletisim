'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, Smartphone, Shield, CheckCircle2, ShoppingBag, Truck, Zap, Activity } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CartPage() {
    const { items, removeItem, updateQty, totalPrice, totalCount } = useCart();
    const { data: session } = useSession();
    const router = useRouter();

    const handleCheckout = () => {
        if (!session) {
            router.push('/login?callbackUrl=/checkout');
        } else {
            router.push('/checkout');
        }
    };

    if (items.length === 0) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-sm border border-slate-100">
                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Sepetiniz Boş</h1>
                <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
                    İhtiyacınız olan ürünleri sepetinize ekleyerek alışverişe başlayabilirsiniz.
                </p>
                <Link
                    href="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                >
                    <ArrowRight className="w-4 h-4" />
                    Alışverişe Başla
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-12">
                <div className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/20 ring-4 ring-blue-50">1</div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2">Sepet</span>
                    </div>
                    <div className="w-16 sm:w-24 h-[2px] bg-slate-200 mt-[-20px] mx-2" />
                    <div className="flex flex-col items-center opacity-40">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">2</div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Teslimat</span>
                    </div>
                    <div className="w-16 sm:w-24 h-[2px] bg-slate-200 mt-[-20px] mx-2" />
                    <div className="flex flex-col items-center opacity-40">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">3</div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Ödeme</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sepetim</h1>
                        <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                            {totalCount} Ürün
                        </span>
                    </div>

                    {items.map((item) => (
                        <div key={`${item.id}-${item.selectedColor}`} className="bg-white rounded-2xl p-5 flex gap-5 shadow-sm border border-slate-100 relative group">
                            {/* Image */}
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 border border-slate-100/50 rounded-xl overflow-hidden flex-shrink-0 group-hover:bg-white transition-colors">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-2" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Smartphone className="w-8 h-8 text-slate-200" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-slate-900 leading-tight text-sm sm:text-base">
                                                <Link href={`/urunler/${item.slug}`} className="hover:text-blue-600 transition-colors">
                                                    {item.name}
                                                </Link>
                                            </h3>
                                            {item.selectedColor && (
                                                <p className="text-xs text-slate-500 font-medium">
                                                    Renk: {item.selectedColor}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Shipping & Urgency Badges */}
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                            <Truck size={12} />
                                            Ücretsiz Kargo
                                        </div>
                                        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                            <Zap size={12} />
                                            Yarın Kapında
                                        </div>
                                        {/* Mock Urgency */}
                                        <div className="flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                            <Activity size={12} />
                                            Son {Math.floor(Math.random() * 3) + 1} Adet
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                                    <div className="flex items-center gap-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 p-0.5">
                                            <button
                                                onClick={() => updateQty(item.id, item.quantity - 1, item.selectedColor)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-md transition-colors disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold text-slate-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQty(item.id, item.quantity + 1, item.selectedColor)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-md transition-colors disabled:opacity-50"
                                                disabled={item.quantity >= item.stock}
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id, item.selectedColor)}
                                            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                                            aria-label="Ürünü kaldır"
                                        >
                                            <Trash2 size={14} />
                                            <span className="hidden sm:inline">Kaldır</span>
                                        </button>
                                    </div>

                                    <div className="font-bold text-slate-900 text-lg tracking-tight text-right">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit space-y-4">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
                            Sipariş Özeti
                            <span className="text-xs text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded-md">{totalCount} Ürün</span>
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-medium">Ara Toplam</span>
                                <span className="text-slate-900 font-bold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalPrice)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-medium">Kargo</span>
                                <span className="text-emerald-500 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded ml-2">ÜCRETSİZ</span>
                            </div>
                            <div className="h-px bg-slate-100 my-4" />
                            <div className="flex items-center justify-between">
                                <span className="text-slate-900 font-black text-lg">Toplam</span>
                                <span className="text-blue-600 font-black text-2xl tracking-tight">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalPrice)}
                                </span>
                            </div>
                        </div>

                        {/* Trust Row */}
                        <div className="flex flex-wrap justify-between gap-2 mb-6 text-[10px] font-bold text-slate-500 uppercase">
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                256-bit SSL
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Güvenli Ödeme
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                14 Gün İade
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Urgency Text */}
                            <p className="text-[10px] font-bold text-red-500 text-center uppercase tracking-widest animate-pulse">
                                Stoklar hızla tükeniyor, acele et!
                            </p>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
                            >
                                <span>Ödemeye Geç</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <p className="text-[10px] text-slate-400 font-medium text-center">
                                Bugün {Math.floor(Math.random() * 20) + 15} sipariş verildi
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <div className="flex flex-col shrink-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOPLAM</span>
                        <span className="text-xl font-black text-slate-900 leading-tight">
                            {new Intl.NumberFormat('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                                maximumFractionDigits: 0,
                            }).format(totalPrice)}
                        </span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="flex-1 h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        <span>Ödemeye Geç</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
