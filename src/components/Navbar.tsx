'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import {
    Smartphone,
    ArrowRightLeft,
    ShoppingBag,
    ShoppingCart,
    User,
    LogOut,
    LogIn,
    UserPlus,
    Settings,
    ChevronDown,
    Menu,
    X,
    Grid3X3,
    Search,
    Heart,
    ChevronRight,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface SubCategory { id: string; name: string; slug: string; }
interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    children: SubCategory[];
}

export default function Navbar() {
    const { data: session, status } = useSession();
    const { totalCount } = useCart();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setMounted(true);
    }, []);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Track which category dropdown is active (by ID)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Mobile accordion state (track which category is expanded)
    const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);

    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    const dropdownRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);

    // Sync search query state with URL
    useEffect(() => {
        const query = searchParams.get('search');
        if (query !== null) {
            setSearchQuery(query);
        } else {
            setSearchQuery('');
        }
    }, [searchParams]);

    // Track scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close user dropdown/nav dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
        setActiveDropdown(null);
    }, [pathname]);

    // Fetch categories once on mount
    useEffect(() => {
        fetch('/api/categories')
            .then(r => r.ok ? r.json() : [])
            .then(data => setCategories(Array.isArray(data) ? data : []))
            .catch(() => setCategories([]));
    }, []);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/');
        setDropdownOpen(false);
    };

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(`/urunler?search=${encodeURIComponent(searchQuery.trim())}`);
        setMobileOpen(false);
    };

    const initials = session?.user?.name
        ? session.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : '';

    // Hide Navbar on admin pages
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <>
            <nav
                className={cn(
                    "sticky top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
                    "bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center shadow-sm"
                )}
                ref={navRef}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
                    <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
                        {/* Logo Section */}
                        <Link href="/" className="flex items-center gap-2 group shrink-0">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-all duration-500">
                                <Smartphone className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">
                                    AYS <span className="text-blue-600">İLETİŞİM</span>
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Erzincan</span>
                            </div>
                        </Link>

                        {/* Desktop Menu - Pill Group */}
                        <div className="hidden lg:flex items-center bg-slate-100/50 rounded-full p-1 border border-slate-200/40">
                            <Link href="/" className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-white transition-all">Ana Sayfa</Link>
                            {categories.slice(0, 5).map((cat) => (
                                <div
                                    key={cat.id}
                                    className="relative group"
                                    onMouseEnter={() => setActiveDropdown(cat.id)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        href={`/urunler?kategori=${cat.slug}`}
                                        className={cn(
                                            "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                                            activeDropdown === cat.id ? "text-blue-600 bg-white shadow-sm" : "text-slate-600 hover:text-blue-600 hover:bg-white"
                                        )}
                                    >
                                        {cat.name}
                                        {cat.children?.length > 0 && (
                                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", activeDropdown === cat.id && "rotate-180")} />
                                        )}
                                    </Link>

                                    {/* Dropdown menu */}
                                    <AnimatePresence>
                                        {activeDropdown === cat.id && cat.children?.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden z-50 py-2 flex flex-col"
                                            >
                                                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{cat.name} Alt Kategorileri</p>
                                                </div>
                                                {cat.children.map(sub => (
                                                    <Link
                                                        key={sub.id}
                                                        href={`/urunler?kategori=${sub.slug}`}
                                                        className="block px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                                                        onClick={() => setActiveDropdown(null)}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                                <div className="mt-1 pt-1 border-t border-slate-100">
                                                    <Link
                                                        href={`/urunler?kategori=${cat.slug}`}
                                                        className="block px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50/50 transition-colors"
                                                        onClick={() => setActiveDropdown(null)}
                                                    >
                                                        Tüm {cat.name} &rarr;
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Search Bar - Premium Rounded-Full */}
                        <form
                            onSubmit={handleSearch}
                            className="hidden md:flex flex-1 max-w-sm relative group"
                        >
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Ürün veya model ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100/70 border border-transparent text-slate-900 text-sm rounded-full py-2 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 focus:bg-white transition-all"
                            />
                        </form>

                        {/* Actions */}
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <Link
                                href="/sepet"
                                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-100/70 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {mounted && totalCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                                        {totalCount}
                                    </span>
                                )}
                            </Link>

                            {/* Auth area */}
                            {status === 'loading' ? (
                                <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                            ) : session ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-full bg-slate-100/70 hover:bg-slate-200 transition-all border border-slate-200/20 group"
                                    >
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black shadow-premium">
                                            {initials || <User className="w-4 h-4" />}
                                        </div>
                                        <span className="hidden sm:block text-xs font-bold text-slate-700">
                                            {session.user?.name?.split(' ')[0] || 'Hesabım'}
                                        </span>
                                        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", dropdownOpen && "rotate-180")} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/30">
                                                <p className="text-slate-900 font-bold text-sm truncate">{session.user?.name}</p>
                                                <p className="text-slate-500 text-[10px] font-medium truncate uppercase tracking-widest">{session.user?.email}</p>
                                            </div>
                                            <div className="p-1.5">
                                                <Link href="/hesabim" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-semibold">
                                                    <User className="w-4 h-4" /> Hesabım
                                                </Link>
                                                <Link href="/hesabim/favoriler" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-semibold">
                                                    <Heart className="w-4 h-4" /> Favorilerim
                                                </Link>
                                                <Link href="/hesabim/siparisler" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-semibold">
                                                    <ShoppingBag className="w-4 h-4" /> Siparişlerim
                                                </Link>
                                                {(session.user as any)?.role === 'ADMIN' && (
                                                    <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-semibold">
                                                        <Settings className="w-4 h-4" /> Yönetim Paneli
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="p-1.5 border-t border-slate-100">
                                                <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all font-semibold text-left">
                                                    <LogOut className="w-4 h-4" /> Çıkış Yap
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link href="/login" className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-all">
                                        Giriş
                                    </Link>
                                    <Link href="/register" className="px-5 py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-premium hover:scale-105 active:scale-95 uppercase tracking-wider">
                                        Kayıt Ol
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay - Placed outside nav to prevent backdrop-blur containing block issues */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[110] lg:hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setMobileOpen(false)}>
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <Smartphone className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-black text-slate-900 tracking-tighter uppercase">AYS İLETİŞİM</span>
                                </Link>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar">
                                {/* Mobile Search */}
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ürün ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-100 border border-slate-200/50 text-slate-900 text-sm rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                </form>

                                {/* Categories Section */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kategoriler</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {categories.map((cat) => (
                                            <div key={cat.id} className="flex flex-col gap-1">
                                                <div
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                                                        mobileExpandedCat === cat.id
                                                            ? "bg-blue-50 border-blue-100 text-blue-700"
                                                            : "bg-slate-50 border-transparent hover:border-blue-100 hover:bg-blue-50/50 text-slate-900"
                                                    )}
                                                    onClick={() => {
                                                        if (cat.children?.length > 0) {
                                                            setMobileExpandedCat(mobileExpandedCat === cat.id ? null : cat.id);
                                                        } else {
                                                            setMobileOpen(false);
                                                            router.push(`/urunler?kategori=${cat.slug}`);
                                                        }
                                                    }}
                                                >
                                                    <span className="text-sm font-bold">{cat.name}</span>
                                                    {cat.children?.length > 0 ? (
                                                        <ChevronDown className={cn("w-4 h-4 transition-transform", mobileExpandedCat === cat.id ? "rotate-180 text-blue-600" : "text-slate-400")} />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                                    )}
                                                </div>

                                                {/* Mobile Subcategories Accordion */}
                                                <AnimatePresence>
                                                    {mobileExpandedCat === cat.id && cat.children?.length > 0 && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pl-4 pb-2 space-y-1">
                                                                <Link
                                                                    href={`/urunler?kategori=${cat.slug}`}
                                                                    className="block px-4 py-3 text-sm text-blue-700 font-bold bg-blue-50/50 rounded-xl transition-all"
                                                                    onClick={() => setMobileOpen(false)}
                                                                >
                                                                    Tüm {cat.name}
                                                                </Link>
                                                                {cat.children.map(sub => (
                                                                    <Link
                                                                        key={sub.id}
                                                                        href={`/urunler?kategori=${sub.slug}`}
                                                                        className="block px-4 py-3 text-sm text-slate-600 font-semibold hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all"
                                                                        onClick={() => setMobileOpen(false)}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Support & Other Links */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Hızlı Erişim</p>
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            href="/eskiyi-getir"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-100 transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <span className="text-sm">Eskiyi Getir</span>
                                        </Link>
                                        <Link
                                            href="/iletisim"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-100 transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <Smartphone className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="text-sm">İletişim & Destek</span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Auth Section Mobile */}
                                {!session && (
                                    <div className="pt-4 flex flex-col gap-3">
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileOpen(false)}
                                            className="w-full py-4 rounded-2xl bg-slate-100 text-slate-900 font-black text-xs text-center uppercase tracking-widest hover:bg-slate-200 transition-all"
                                        >
                                            Giriş Yap
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setMobileOpen(false)}
                                            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-xs text-center uppercase tracking-widest shadow-premium hover:bg-blue-700 transition-all"
                                        >
                                            Hesap Oluştur
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Welfare Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                <p className="text-[10px] text-slate-400 font-bold text-center">© {new Date().getFullYear()} AYS İletişim - Premium Tech Store</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
