import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/auth';
import {
    Mail,
    MapPin,
    ShoppingBag,
    ArrowRightLeft,
    LogOut,
    Settings,
    ChevronRight,
    Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function AccountPage() {
    const session = await auth();
    if (!session?.user?.email) redirect('/login?callbackUrl=/hesabim');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            isAdmin: true,
            createdAt: true,
            orders: { select: { id: true } },
            _count: {
                select: {
                    favorites: true,
                    addresses: true,
                }
            }
        },
    });
    if (!user) redirect('/login');

    // Trade-in count via phone
    const tradeInCount = user.phone
        ? await prisma.tradeInRequest.count({ where: { customerPhone: user.phone } })
        : 0;

    const initials = user.fullName
        ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : (user.email[0] ?? '?').toUpperCase();

    const menuItems = [
        {
            icon: ShoppingBag,
            label: 'Siparişlerim',
            desc: 'Tüm siparişlerinizi görüntüleyin',
            href: '/hesabim/siparisler',
            badge: user.orders.length > 0 ? String(user.orders.length) : null,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            icon: ArrowRightLeft,
            label: 'Trade-In Başvurularım',
            desc: 'Eskiyi getir teklifleriniz ve durumları',
            href: '/hesabim/trade-in',
            badge: tradeInCount > 0 ? String(tradeInCount) : null,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            icon: Heart,
            label: 'Favorilerim',
            desc: 'Beğendiğiniz ürünler',
            href: '/hesabim/favoriler',
            badge: user._count.favorites > 0 ? String(user._count.favorites) : null,
            color: 'text-red-600',
            bg: 'bg-red-50',
        },
        {
            icon: MapPin,
            label: 'Adreslerim',
            desc: 'Teslimat adreslerinizi yönetin',
            href: '/hesabim/adreslerim',
            badge: null,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            icon: Settings,
            label: 'Hesap Ayarları',
            desc: 'Şifre ve bilgi güncellemesi',
            href: '/hesabim/ayarlar',
            badge: null,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
    ];

    const stats = [
        { label: 'Toplam Sipariş', value: user.orders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Trade-In Başvurusu', value: tradeInCount, icon: ArrowRightLeft, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Favori Ürünler', value: user._count.favorites, icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Kayıtlı Adres', value: user._count.addresses, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    const joinDate = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(user.createdAt);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Profile Header Card */}
                <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold shadow-lg shadow-blue-500/20 flex-shrink-0">
                            {initials}
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-slate-900 text-2xl font-semibold tracking-tight">{user.fullName || user.email}</h1>
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-1">
                                <span className="text-slate-500 text-sm">{user.email}</span>
                                <span className="hidden sm:block text-slate-300">•</span>
                                <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                                    {user.isAdmin ? 'Yönetici' : 'Müşteri Hesabı'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            {user.isAdmin && (
                                <Link
                                    href="/admin"
                                    className="px-5 py-2.5 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-xl transition-all"
                                >
                                    Yönetim Paneli
                                </Link>
                            )}
                            <form action={async () => {
                                'use server';
                                await signOut({ redirectTo: '/' });
                            }}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 text-slate-400 hover:text-red-600 px-4 py-2 transition-colors text-sm font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Çıkış Yap
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6 transition-all hover:border-blue-200 group">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:scale-110", stat.bg)}>
                                    <Icon className={cn("w-5 h-5", stat.color)} />
                                </div>
                                <p className="text-slate-500 text-xs font-medium mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Navigation Menu (Left) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
                            {menuItems.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all group ${i < menuItems.length - 1 ? 'border-b border-slate-100' : ''
                                            }`}
                                    >
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110", item.bg)}>
                                            <Icon className={cn("w-5 h-5", item.color)} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-900 font-semibold text-sm">{item.label}</p>
                                            <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                                        </div>
                                        {item.badge && (
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                                {item.badge}
                                            </span>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar Info (Right) */}
                    <div className="lg:col-span-4">
                        <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6">
                            <h3 className="text-slate-900 font-semibold text-sm mb-4">Üyelik Bilgileri</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-xs">Müşteri No</span>
                                    <span className="text-slate-900 text-xs font-mono font-bold select-all">#{user.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-xs">Kayıt Tarihi</span>
                                    <span className="text-slate-900 text-xs font-bold">{joinDate}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-50 mt-4">
                                    <Link
                                        href="/yardim"
                                        className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-2 group"
                                    >
                                        Yardım Gerekiyor mu?
                                        <ArrowRightLeft className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
