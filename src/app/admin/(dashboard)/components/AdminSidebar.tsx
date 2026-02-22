'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Tag,
    Smartphone,
    LogOut,
    Menu,
    X,
    Image as ImageIcon,
    Building,
    MessageSquare,
    Star,
    Gift,
    FileText
} from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils'; // Assuming this exists, if not I'll standard clsx/tailwind-merge

const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Ürün Yönetimi', icon: Package },
    { href: '/admin/orders', label: 'Siparişler', icon: ShoppingCart },
    { href: '/admin/trade-in', label: 'Takas Merkezi', icon: Smartphone },
    { href: '/admin/categories', label: 'Kategoriler', icon: Tag },
    { href: '/admin/brands', label: 'Markalar', icon: Tag },
    { href: '/admin/showcase', label: 'Vitrin Yönetimi', icon: ImageIcon },
    { href: '/admin/users', label: 'Kullanıcılar', icon: Users },
    { href: '/admin/bank-accounts', label: 'Banka Bilgileri', icon: Building },
    { href: '/admin/coupons', label: 'Kuponlar', icon: Gift },
    { href: '/admin/reviews', label: 'Değerlendirmeler', icon: Star },
    { href: '/admin/footer', label: 'Footer Yönetimi', icon: FileText },
    { href: '/admin/contact', label: 'İletişim Bilgileri', icon: MessageSquare },
    { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
];

export default function AdminSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Trigger */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed z-[60] top-4 right-4 p-3 bg-blue-600 text-white rounded-xl shadow-2xl"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-[50]
                w-64 bg-white border-r border-slate-200
                flex flex-col transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                {/* Brand Header */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <Link href="/admin" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <h1 className="text-lg font-black text-white italic">A</h1>
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 border-b-2 border-transparent group-hover:border-blue-600 transition-all">
                            AYS<span className="text-blue-600 font-bold">.</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Management</p>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-sm font-medium",
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <Icon
                                    size={18}
                                    className={cn(
                                        "transition-colors",
                                        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-900"
                                    )}
                                />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1 h-4 bg-blue-600 rounded-full"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-900 font-bold text-xs">
                            {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{session?.user?.name || 'Yönetici'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Panel Admin</p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="text-slate-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg group"
                            title="Çıkış Yap"
                        >
                            <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
