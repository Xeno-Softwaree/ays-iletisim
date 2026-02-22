import { prisma } from '@/lib/prisma';
import { Package, Smartphone, ShoppingCart, Settings, ArrowRight, Activity, AlertCircle, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
    // Critical Stock
    const criticalStockProducts = await prisma.product.findMany({
        where: { stock: { lt: 3 } },
        orderBy: { stock: 'asc' }
    });

    // Stats
    const productCount = await prisma.product.count();
    const tradeInCount = await prisma.tradeInRequest.count({ where: { status: 'Beklemede' } });
    const orderCount = await prisma.order.count();
    const totalUsers = await prisma.user.count();

    // Recent Orders
    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });

    // Dynamic Date
    const today = new Date().toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const metrics = [
        { label: 'Toplam Ürün', value: productCount, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Sipariş Sayısı', value: orderCount, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Bekleyen Takas', value: tradeInCount, icon: Smartphone, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Toplam Kullanıcı', value: totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-sm text-slate-500 font-medium">Hoş geldiniz, işte bugünkü özetiniz.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-400">{today}</span>
                    <Link
                        href="/"
                        className="bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                    >
                        Mağazayı Görüntüle
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {metrics.map((metric, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300 group">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${metric.bg} ${metric.color} transition-transform group-hover:scale-110`}>
                                <metric.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{metric.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 leading-none">{metric.value.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Son Siparişler</h2>
                        <Link href="/admin/orders" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Tümünü Gör</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sipariş</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Müşteri</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Tutar</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                                            <p className="text-[10px] font-medium text-slate-400">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-700">{order.user?.fullName || 'Anonim'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right underline decoration-slate-200 underline-offset-4">
                                            <span className="text-sm font-black text-slate-900">{Number(order.totalAmount).toLocaleString('tr-TR')} ₺</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                                                order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                                                    'bg-blue-50 text-blue-600'
                                                }`}>
                                                {order.status === 'PENDING' ? 'Beklemede' :
                                                    order.status === 'PROCESSING' ? 'Hazırlanıyor' :
                                                        order.status === 'SHIPPED' ? 'Kargoda' :
                                                            order.status === 'DELIVERED' ? 'Tamamlandı' : 'İptal Edildi'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium text-sm">Henüz sipariş bulunmuyor.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Critical Stock */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500" />
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Kritik Stok</h2>
                    </div>
                    <div className="p-2 space-y-1">
                        {criticalStockProducts.map(product => (
                            <Link
                                key={product.id}
                                href="/admin/products"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 group-hover:scale-125 transition-transform"></div>
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{product.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                    {product.stock} Adet
                                </span>
                            </Link>
                        ))}
                        {criticalStockProducts.length === 0 && (
                            <div className="p-10 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stoklar Güvende</p>
                            </div>
                        )}
                    </div>
                    {criticalStockProducts.length > 5 && (
                        <Link href="/admin/products" className="p-4 text-center border-t border-slate-50 text-[10px] font-bold text-blue-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                            Tümünü Görüntüle
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
