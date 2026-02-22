'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, Search, Filter, ChevronDown, Calendar, X, Eye, ShieldCheck, Info, Globe, Smartphone as PhoneIcon, ShoppingCart } from 'lucide-react';
import { useFilteredData } from '@/hooks/useFilteredData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Order {
    id: string;
    user: { fullName: string; email: string } | null;
    guestEmail: string | null;
    fullName: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    totalAmount: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    items: any[];
    trackingNumber?: string;
    // Legal fields
    distanceSalesAccepted: boolean;
    preInfoAccepted: boolean;
    kvkkRead: boolean;
    contractsAcceptedAt: string | null;
    contractsAcceptedIp: string | null;
    contractsAcceptedUserAgent: string | null;
}

const statusConfig = {
    PENDING: { label: 'BEKLEMEDE', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    PROCESSING: { label: 'HAZIRLANIYOR', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Package },
    SHIPPED: { label: 'KARGOLANDI', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: Truck },
    DELIVERED: { label: 'TAMAMLANDI', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
    CANCELLED: { label: 'İPTAL', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const { filteredData, searchTerm, setSearchTerm, filters, setFilter, resetFilters } = useFilteredData(orders, {
        searchKeys: ['id', 'user.fullName', 'user.email', 'guestEmail']
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();
        setOrders(data);
        setLoading(false);
    };

    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [trackingInput, setTrackingInput] = useState('');

    const openTrackingModal = (orderId: string) => {
        setSelectedOrderId(orderId);
        setTrackingInput('');
        setTrackingModalOpen(true);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (newStatus === 'SHIPPED') {
            openTrackingModal(id);
            return;
        }
        await updateOrderStatus(id, newStatus);
    };

    const confirmTracking = async () => {
        if (!selectedOrderId) return;
        await updateOrderStatus(selectedOrderId, 'SHIPPED', trackingInput);
        setTrackingModalOpen(false);
    };

    const updateOrderStatus = async (id: string, newStatus: string, trackingNumber?: string) => {
        // Optimistic update
        const originalOrder = orders.find(o => o.id === id);
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus as any, trackingNumber: trackingNumber || o.trackingNumber } : o));

        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, trackingNumber }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Update failed:', errorData);
                toast.error(`Durum güncellenemedi: ${errorData.error || 'Bilinmeyen hata'}`);

                // Revert optimistic update
                if (originalOrder) {
                    setOrders(prev => prev.map(o => o.id === id ? originalOrder : o));
                } else {
                    fetchOrders();
                }
            } else {
                toast.success('Sipariş durumu güncellendi.');
                if (newStatus === 'SHIPPED' && trackingNumber) {
                    toast.success('Müşteriye kargo takip numarası iletildi.');
                }
            }
        } catch (error) {
            console.error('Network error:', error);
            toast.error('Bağlantı hatası oluştu.');

            // Revert optimistic update
            if (originalOrder) {
                setOrders(prev => prev.map(o => o.id === id ? originalOrder : o));
            } else {
                fetchOrders();
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Order Details Modal */}
            {detailsModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDetailsModalOpen(false)} />
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] flex flex-col border border-slate-200">
                        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sipariş Detayı</h2>
                                <p className="text-xs text-slate-500 font-medium">Sipariş #{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <button
                                onClick={() => setDetailsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Shipping & Customer */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                        <div className="flex items-center gap-2 mb-4 text-slate-400">
                                            <Package className="w-5 h-5 text-blue-600" />
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Teslimat Bilgileri</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Müşteri</p>
                                                <p className="text-sm font-bold text-slate-900">{selectedOrder.fullName || selectedOrder.user?.fullName || 'Belirtilmedi'}</p>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">{selectedOrder.user?.email || selectedOrder.guestEmail}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">İletişim</p>
                                                <p className="text-sm font-bold text-slate-900">{selectedOrder.phone || 'Belirtilmedi'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Adres</p>
                                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                    {selectedOrder.address}, {selectedOrder.city}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Sözleşme Onayları</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between bg-white/60 px-4 py-2.5 rounded-xl border border-blue-100">
                                                <span className="text-[11px] font-bold text-slate-600">Mesafeli Satış</span>
                                                {selectedOrder.distanceSalesAccepted ? (
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">ONAYLI</span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">RED</span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between bg-white/60 px-4 py-2.5 rounded-xl border border-blue-100">
                                                <span className="text-[11px] font-bold text-slate-600">Ön Bilgilendirme</span>
                                                {selectedOrder.preInfoAccepted ? (
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">ONAYLI</span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">RED</span>
                                                )}
                                            </div>
                                            {selectedOrder.contractsAcceptedAt && (
                                                <div className="pt-3 space-y-2 border-t border-blue-100/50 text-[10px] text-blue-600/60 font-bold uppercase tracking-tight">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={12} /> {new Date(selectedOrder.contractsAcceptedAt).toLocaleString('tr-TR')}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Globe size={12} /> {selectedOrder.contractsAcceptedIp || 'Bilinmiyor'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 h-fit">
                                    <div className="flex items-center gap-2 mb-6 text-slate-400">
                                        <ShoppingCart className="w-5 h-5 text-slate-400" />
                                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Sipariş İçeriği</h4>
                                    </div>
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                                        {selectedOrder.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 p-1 border border-slate-100">
                                                    {item.product?.images?.[0] ? (
                                                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Package size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 text-sm truncate leading-tight mb-1">{item.product?.name || 'Ürün Silinmiş'}</p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.quantity} Adet</span>
                                                        <span className="font-black text-slate-900 text-xs">
                                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(item.price))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Genel Toplam</span>
                                            <span className="text-2xl font-black text-slate-900 tracking-tight">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(selectedOrder.totalAmount))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/80 flex justify-end">
                            <button
                                onClick={() => setDetailsModalOpen(false)}
                                className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Modal */}
            {trackingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setTrackingModalOpen(false)} />
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300 border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Kargo Takip Numarası</h3>
                        <p className="text-sm text-slate-500 font-medium mb-6">
                            Sipariş durumunu 'Kargolandı' olarak güncellemek için takip numarasını giriniz.
                        </p>
                        <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="Örn: 123456789012"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-black outline-none focus:border-blue-500 transition-all mb-8 shadow-inner"
                            autoFocus
                        />
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setTrackingModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={confirmTracking}
                                disabled={!trackingInput.trim()}
                                className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                            >
                                Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sipariş Yönetimi</h1>
                    <p className="text-sm text-slate-500 font-medium">Satış takibi ve müşteri sipariş durumları.</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative group w-full md:flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Sipariş no, müşteri adı veya e-posta..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-10 py-2.5 text-sm outline-none transition-all"
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
                            {Object.keys(statusConfig).map((status) => (
                                <option key={status} value={status}>
                                    {statusConfig[status as keyof typeof statusConfig].label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Müşteri</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Tutar</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Tarih</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Durum</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-bold animate-pulse uppercase text-xs tracking-widest">Veriler Yükleniyor...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="flex flex-col items-center justify-center grayscale opacity-50">
                                            <Package className="w-12 h-12 text-slate-300 mb-3" />
                                            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Sipariş Bulunamadı</p>
                                            <button onClick={resetFilters} className="mt-2 text-xs text-blue-600 font-bold hover:underline font-mono">FİLTRELERİ SIFIRLA</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((order) => {
                                    const statusKey = order.status as keyof typeof statusConfig;
                                    const config = statusConfig[statusKey] || statusConfig.PENDING;
                                    const StatusIcon = config.icon;

                                    return (
                                        <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-[11px] font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase">
                                                    #{order.id.slice(0, 8)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 text-sm leading-none mb-1">{order.fullName || order.user?.fullName || order.guestEmail || 'Misafir'}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{order.user?.email || order.guestEmail}</span>
                                                    {order.trackingNumber && (
                                                        <span className="text-[9px] text-emerald-600 font-black mt-1.5 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded w-fit uppercase">
                                                            Kargo: {order.trackingNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-900 text-sm tracking-tight">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(order.totalAmount))}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-tight">
                                                    <Calendar size={14} className="text-slate-300" />
                                                    {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter",
                                                    config.bg, config.text, config.border
                                                )}>
                                                    <StatusIcon size={12} />
                                                    {config.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setDetailsModalOpen(true);
                                                        }}
                                                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <div className="relative group/sel">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black py-2 pl-3 pr-8 rounded-xl shadow-sm focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-white transition-all uppercase tracking-tighter"
                                                        >
                                                            {Object.keys(statusConfig).map((status) => (
                                                                <option key={status} value={status}>
                                                                    {statusConfig[status as keyof typeof statusConfig].label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
