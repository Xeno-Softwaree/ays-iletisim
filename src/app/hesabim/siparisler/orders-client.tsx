'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ShoppingBag, Package, ArrowLeft, Clock, Truck, CheckCircle, XCircle, RefreshCw,
    ChevronDown, ChevronUp, Copy, MapPin, Phone, CreditCard, Banknote,
    ExternalLink, RotateCcw, Star, Tag, Box, User
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_MAP = {
    PENDING: { label: 'Beklemede', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock, step: 0 },
    PROCESSING: { label: 'Hazırlanıyor', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: RefreshCw, step: 1 },
    SHIPPED: { label: 'Kargoda', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', icon: Truck, step: 2 },
    DELIVERED: { label: 'Teslim Edildi', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle, step: 3 },
    CANCELLED: { label: 'İptal Edildi', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: XCircle, step: -1 },
} as const;

const TIMELINE_STEPS = [
    { label: 'Sipariş Alındı', icon: ShoppingBag },
    { label: 'Hazırlanıyor', icon: RefreshCw },
    { label: 'Kargoya Verildi', icon: Truck },
    { label: 'Teslim Edildi', icon: CheckCircle },
];

const FILTER_TABS = [
    { key: 'ALL', label: 'Tümü' },
    { key: 'PENDING', label: 'Beklemede' },
    { key: 'PROCESSING', label: 'Hazırlanıyor' },
    { key: 'SHIPPED', label: 'Kargoda' },
    { key: 'DELIVERED', label: 'Teslim Edildi' },
    { key: 'CANCELLED', label: 'İptal Edildi' },
] as const;

type OrderStatus = keyof typeof STATUS_MAP;

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; images: string[]; slug: string };
}

interface Order {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    discountAmount: number;
    couponCode: string | null;
    paymentMethod: string | null;
    trackingNumber: string | null;
    fullName: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

const formatPrice = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

const formatDate = (d: string) =>
    new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

function OrderTimeline({ status }: { status: OrderStatus }) {
    if (status === 'CANCELLED') {
        return (
            <div className="flex items-center gap-2 px-6 py-4 bg-red-50 border-t border-slate-100">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-[10px] font-bold uppercase tracking-wider">BU SİPARİŞ İPTAL EDİLDİ</p>
            </div>
        );
    }
    const currentStep = STATUS_MAP[status]?.step ?? 0;
    return (
        <div className="px-6 py-6 border-t border-slate-50 bg-slate-50/30">
            <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
                {TIMELINE_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const done = idx <= currentStep;
                    const active = idx === currentStep;
                    return (
                        <div key={idx} className="flex flex-col items-center gap-2 flex-1 relative">
                            <div className="w-full flex items-center">
                                {idx > 0 && (
                                    <div className={cn("absolute left-0 right-1/2 h-0.5 -translate-y-1/2 top-4 transition-colors duration-500", idx <= currentStep ? 'bg-blue-600' : 'bg-slate-200')} />
                                )}
                                {idx < TIMELINE_STEPS.length - 1 && (
                                    <div className={cn("absolute left-1/2 right-0 h-0.5 -translate-y-1/2 top-4 transition-colors duration-500", idx < currentStep ? 'bg-blue-600' : 'bg-slate-200')} />
                                )}
                                <div className={cn(
                                    "w-8 h-8 rounded-full border flex items-center justify-center mx-auto relative z-10 transition-all duration-500",
                                    active ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110" :
                                        done ? "border-blue-600 bg-blue-600 text-white" :
                                            "border-slate-200 bg-white text-slate-300"
                                )}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-tight leading-tight transition-colors",
                                active ? "text-blue-600" : done ? "text-slate-600" : "text-slate-300"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function OrderCard({ order }: { order: Order }) {
    const [expanded, setExpanded] = useState(false);
    const status = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING;
    const StatusIcon = status.icon;
    const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const copyOrderId = () => {
        navigator.clipboard.writeText(order.id);
        toast.success('Sipariş ID kopyalandı');
    };

    const copyTracking = () => {
        if (!order.trackingNumber) return;
        navigator.clipboard.writeText(order.trackingNumber);
        toast.success('Takip numarası kopyalandı');
    };

    return (
        <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:border-blue-200 transition-all duration-300 group/card">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 border rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover/card:scale-105 shadow-sm", status.bg, status.border)}>
                        <StatusIcon className={cn("w-6 h-6", status.color)} />
                    </div>
                    <div>
                        <button
                            onClick={copyOrderId}
                            className="text-slate-900 font-semibold text-sm hover:text-blue-600 transition-colors flex items-center gap-1.5 group/id"
                        >
                            <span className="text-slate-400">#</span>{order.id.slice(0, 8).toUpperCase()}
                            <Copy className="w-3 h-3 text-slate-300 group-hover/id:text-blue-600 transition-all" />
                        </button>
                        <p className="text-slate-400 text-xs mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-slate-900 font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border", status.color, status.bg, status.border)}>
                            {status.label}
                        </span>
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={cn(
                            "w-10 h-10 border rounded-xl flex items-center justify-center transition-all",
                            expanded ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                        )}
                    >
                        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Product Thumbnails (always visible) */}
            <div className="px-6 pb-6 flex gap-2.5 flex-wrap">
                {order.items.slice(0, 5).map((item, i) => (
                    <Link key={item.id} href={`/urunler/${item.product.slug}`} className="relative group/thumb">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden group-hover/thumb:border-blue-600/30 transition-all duration-500 group-hover/thumb:-translate-y-1 shadow-sm">
                            {item.product.images[0]
                                ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-700" />
                                : <div className="w-full h-full flex items-center justify-center bg-slate-100"><Box className="w-6 h-6 text-slate-300" /></div>
                            }
                        </div>
                        {item.quantity > 1 && (
                            <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-blue-600 text-white text-[10px] font-black rounded-lg flex items-center justify-center leading-none px-1.5 border-2 border-white shadow-md">
                                {item.quantity}
                            </span>
                        )}
                    </Link>
                ))}
                {order.items.length > 5 && (
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                        <span className="text-slate-400 text-xs font-black">+{order.items.length - 5}</span>
                    </div>
                )}
            </div>

            {/* Status Timeline */}
            <OrderTimeline status={order.status} />

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/30 animate-in slide-in-from-top-4 duration-500">
                    {/* All Items */}
                    <div className="px-6 py-6 space-y-4">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Sipariş İçeriği</p>
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 group/item">
                                <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm group-hover/item:border-blue-200 transition-colors">
                                    {item.product.images[0]
                                        ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                                        : <div className="w-full h-full flex items-center justify-center bg-slate-50"><Box className="w-6 h-6 text-slate-200" /></div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/urunler/${item.product.slug}`} className="text-slate-900 font-bold text-sm hover:text-blue-600 transition-colors line-clamp-1 flex items-center gap-1.5 group/link">
                                        {item.product.name}
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover/link:text-blue-600 flex-shrink-0" />
                                    </Link>
                                    <p className="text-slate-500 text-xs font-medium mt-0.5">{item.quantity} adet × {formatPrice(item.price)}</p>
                                </div>
                                <p className="text-slate-900 font-black text-sm flex-shrink-0 tracking-tight">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="px-6 py-6 space-y-3">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Ödeme Özeti</p>
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-500">Ara Toplam</span>
                            <span className="text-slate-900">{formatPrice(subtotal)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-emerald-600 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    {order.couponCode ? `İndirim (${order.couponCode})` : 'İndirim'}
                                </span>
                                <span className="text-emerald-600">-{formatPrice(order.discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-500">Kargo Ücreti</span>
                            <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Ücretsiz</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
                            <span className="text-slate-900 font-black uppercase text-xs tracking-widest">Ödenen Toplam</span>
                            <span className="text-blue-600 font-black text-xl tracking-tight">{formatPrice(order.totalAmount)}</span>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    {(order.fullName || order.address) && (
                        <div className="px-6 py-6">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Teslimat Adresi</p>
                            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3 shadow-sm">
                                {order.fullName && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-slate-900 font-bold">{order.fullName}</span>
                                    </div>
                                )}
                                {order.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-slate-600 font-medium">{order.phone}</span>
                                    </div>
                                )}
                                {order.address && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-slate-600 font-medium leading-relaxed">{order.address}{order.city ? `, ${order.city}` : ''}</span>
                                    </div>
                                )}
                                {order.paymentMethod && (
                                    <div className="flex items-center gap-3 text-sm pt-4 border-t border-slate-50 mt-1">
                                        <div className="w-8 h-8 bg-blue-50/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {order.paymentMethod === 'TRANSFER'
                                                ? <Banknote className="w-4 h-4 text-blue-600" />
                                                : <CreditCard className="w-4 h-4 text-blue-600" />
                                            }
                                        </div>
                                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                                            {order.paymentMethod === 'TRANSFER' ? 'Havale / EFT ile Ödendi' : 'Kredi Kartı ile Ödendi'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tracking Number */}
                    {order.trackingNumber && (
                        <div className="px-6 py-6">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Kargo Takip</p>
                            <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 shadow-sm group/tracking">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <Truck className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-0.5">Takip Numarası</p>
                                        <p className="text-purple-600 font-mono font-black text-sm tracking-wider">{order.trackingNumber}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={copyTracking}
                                    className="text-purple-400 hover:text-purple-700 transition-all p-2 hover:bg-white rounded-xl active:scale-90"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="px-6 py-5 flex flex-wrap gap-2.5 bg-slate-50/10">
                        {order.status === 'DELIVERED' && (
                            <Link
                                href={`/urunler/${order.items[0]?.product.slug}`}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:translate-y-0.5"
                            >
                                <Star className="w-4 h-4" />
                                DEĞERLENDİR
                            </Link>
                        )}
                        {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                            <Link
                                href="/urunler"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-900 hover:text-white text-slate-900 border border-slate-200 text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-sm active:translate-y-0.5"
                            >
                                <RotateCcw className="w-4 h-4" />
                                TEKRAR SİPARİŞ VER
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
    const [activeFilter, setActiveFilter] = useState<string>('ALL');

    const filtered = activeFilter === 'ALL' ? orders : orders.filter((o) => o.status === activeFilter);

    const counts: Record<string, number> = { ALL: orders.length };
    for (const o of orders) {
        counts[o.status] = (counts[o.status] || 0) + 1;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href="/hesabim"
                        className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center transition-all hover:bg-slate-50 shadow-sm active:scale-90"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">SİPARİŞLERİM</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">{orders.length} toplam kayıt</p>
                    </div>
                </div>

                {/* Stats Strip */}
                {orders.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                        {[
                            { label: 'Toplam', value: orders.length, color: 'text-slate-900', bg: 'bg-white' },
                            { label: 'Teslim Edildi', value: counts['DELIVERED'] || 0, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                            { label: 'Aktif', value: (counts['PENDING'] || 0) + (counts['PROCESSING'] || 0) + (counts['SHIPPED'] || 0), color: 'text-blue-600', bg: 'bg-blue-50/50' },
                            { label: 'İptal', value: counts['CANCELLED'] || 0, color: 'text-red-600', bg: 'bg-red-50/50' },
                        ].map((stat) => (
                            <div key={stat.label} className={`${stat.bg} border border-slate-200/60 shadow-sm rounded-2xl px-5 py-5 text-center transition-transform hover:-translate-y-1`}>
                                <p className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filter Tabs */}
                {orders.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
                        {FILTER_TABS.map((tab) => {
                            const count = counts[tab.key] || 0;
                            if (tab.key !== 'ALL' && count === 0) return null;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveFilter(tab.key)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap border transition-all duration-300 flex-shrink-0 shadow-sm
                                        ${activeFilter === tab.key
                                            ? 'bg-slate-900 border-slate-900 text-white'
                                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300'
                                        }`}
                                >
                                    {tab.label}
                                    {count > 0 && (
                                        <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-lg text-[9px] font-black px-1 ${activeFilter === tab.key ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="text-center py-24 bg-white border border-slate-200 rounded-[40px] shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-slate-900 font-black text-xl mb-2 uppercase tracking-tight">Henüz sipariş yok</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs mx-auto">Ürünlerimize göz atarak alışverişe başlayabilirsiniz.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:translate-y-0.5"
                        >
                            Ürünleri Keşfet
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200 rounded-[40px] shadow-sm">
                        <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Bu kategoride sipariş yok</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filtered.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
