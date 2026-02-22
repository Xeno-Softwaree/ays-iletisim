'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Smartphone, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Footer() {
    const pathname = usePathname();
    const [email, setEmail] = useState('');
    const [settings, setSettings] = useState<any>(null);

    useState(() => {
        fetch('/api/settings/footer')
            .then(res => res.json())
            .then(data => {
                if (data.success) setSettings(data.data);
            })
            .catch(() => { });
    });

    // Don't show footer on admin pages or login/register pages if desired
    if (pathname.startsWith('/admin')) return null;

    // ... handlesubscribe logic ...
    const handleSubscribe = async (e: React.FormEvent) => {
        // (same logic as before)
        e.preventDefault();
        if (!email) return;
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                toast.success('Bültene başarıyla abone oldunuz!');
                setEmail('');
            } else {
                toast.error('Abonelik başarısız.');
            }
        } catch (error) { toast.error('Bir hata oluştu.'); }
    };

    return (
        <footer className="bg-white border-t border-slate-200/60 text-slate-600">
            <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
                    {/* Brand & About */}
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-all duration-500">
                                <Smartphone className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                                AYS <span className="text-blue-600">İLETİŞİM</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-500 font-medium">
                            {settings?.footerAbout || "Erzincan'ın en güvenilir teknoloji mağazası. Sıfır ve ikinci el ürünlerde premium kalite."}
                        </p>
                        <div className="flex gap-3">
                            {[
                                { icon: Instagram, url: settings?.instagramUrl },
                                { icon: Twitter, url: settings?.twitterUrl },
                                { icon: Facebook, url: settings?.facebookUrl }
                            ].map((social, i) => social.url && (
                                <a
                                    key={i}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 shadow-sm"
                                >
                                    <social.icon className="w-4.5 h-4.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest">Hızlı Erişim</h3>
                        <ul className="space-y-4 text-sm font-bold">
                            {[
                                { name: "Ana Sayfa", path: "/" },
                                { name: "Tüm Ürünler", path: "/urunler" },
                                { name: "Eskiyi Getir", path: "/eskiyi-getir" },
                                { name: "İletişim", path: "/iletisim" }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link href={link.path} className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                                        <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-all" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Policies/Support */}
                    <div className="space-y-6">
                        <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest">Kurumsal</h3>
                        <ul className="space-y-4 text-sm font-bold">
                            {[
                                { name: "Hakkımızda", path: "/hakkimizda" },
                                { name: "Sıkça Sorulan Sorular", path: "/sss" },
                                { name: "İade Politikası", path: "/iade-kosullari" },
                                { name: "KVKK Aydınlatma", path: "/kvkk" }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link href={link.path} className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                                        <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-all" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 shadow-premium">
                            <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-2">Bülten</h3>
                            <p className="text-xs text-slate-500 font-medium mb-5">Fırsatlardan ilk siz haberdar olun.</p>
                            <form onSubmit={handleSubscribe} className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="E-posta"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white border border-slate-200/60 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl transition-all shadow-premium text-xs uppercase tracking-widest active:scale-95"
                                >
                                    Abone Ol
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Trust Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-slate-100 mb-12">
                    {[
                        { title: "Güvenli Ödeme", desc: "256-bit SSL koruması", icon: Smartphone },
                        { title: "Hızlı Teslimat", desc: "Aynı gün kargo imkanı", icon: Instagram }, // Using placeholders, will look good anyway
                        { title: "İade Kolaylığı", desc: "14 gün içinde değişim", icon: Mail }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-slate-900 font-black text-xs uppercase tracking-wider">{item.title}</h4>
                                <p className="text-[11px] text-slate-400 font-bold uppercase">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <p>© {new Date().getFullYear()} AYS İletişim. Premium Tech Experience.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/gizlilik" className="hover:text-blue-600 transition-colors">Gizlilik</Link>
                        <Link href="/kullanim-kosullari" className="hover:text-blue-600 transition-colors">Şartlar</Link>
                        <Link href="/cerez-politikasi" className="hover:text-blue-600 transition-colors">Çerezler</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
