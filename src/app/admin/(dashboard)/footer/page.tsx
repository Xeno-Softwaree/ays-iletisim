'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    CheckCircle2,
    XCircle,
    Loader2,
    Save,
    Link as LinkIcon,
    Instagram,
    Twitter,
    Facebook,
    FileText,
    Edit2,
    Globe
} from 'lucide-react';
import Link from 'next/link';

interface DynamicPage {
    id: string;
    slug: string;
    title: string;
    isActive: boolean;
    updatedAt: string;
}

interface FooterSettings {
    instagramUrl: string;
    twitterUrl: string;
    facebookUrl: string;
    footerAbout: string;
}

export default function FooterManagementPage() {
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<FooterSettings>({
        instagramUrl: '',
        twitterUrl: '',
        facebookUrl: '',
        footerAbout: ''
    });
    const [pages, setPages] = useState<DynamicPage[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setFetching(true);
        try {
            const [settingsRes, pagesRes] = await Promise.all([
                fetch('/api/admin/settings'),
                fetch('/api/admin/dynamic-pages')
            ]);

            const settingsData = await settingsRes.json();
            const pagesData = await pagesRes.json();

            if (settingsData.success) {
                setSettings({
                    instagramUrl: settingsData.data.instagramUrl || '',
                    twitterUrl: settingsData.data.twitterUrl || '',
                    facebookUrl: settingsData.data.facebookUrl || '',
                    footerAbout: settingsData.data.footerAbout || ''
                });
            }

            if (pagesData.success) {
                setPages(pagesData.data);
            }
        } catch (error) {
            toast.error('Veriler yüklenemedi');
        } finally {
            setFetching(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Ayarlar kaydediliyor...');

        try {
            // We fetch the current settings first to not overwrite other fields
            const currentRes = await fetch('/api/admin/settings');
            const currentData = await currentRes.json();

            const payload = {
                ...currentData.data,
                ...settings
            };

            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success('Ayarlar güncellendi', { id: toastId });
            } else {
                throw new Error('Hata oluştu');
            }
        } catch (error) {
            toast.error('Ayarlar kaydedilemedi', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-black" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="border-b border-black/5 pb-6">
                    <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-2">FOOTER YÖNETİMİ</h1>
                    <p className="text-gray-500 font-medium">Sosyal medya linklerini ve bilgi sayfalarını buradan düzenleyin.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Settings Form */}
                    <form onSubmit={handleSaveSettings} className="space-y-8">
                        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-black text-black">GENEL AYARLAR</h2>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <Instagram className="w-3 h-3" /> Instagram URL
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.instagramUrl}
                                        onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-bold text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <Twitter className="w-3 h-3" /> Twitter URL
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.twitterUrl}
                                        onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-bold text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <Facebook className="w-3 h-3" /> Facebook URL
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.facebookUrl}
                                        onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-bold text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Footer "Hakkımızda" Metni</label>
                                    <textarea
                                        value={settings.footerAbout}
                                        onChange={(e) => setSettings({ ...settings, footerAbout: e.target.value })}
                                        rows={4}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-medium text-black resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                AYARLARI KAYDET
                            </button>
                        </div>
                    </form>

                    {/* Pages List */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-black">BİLGİ SAYFALARI</h2>
                        </div>

                        <div className="space-y-3">
                            {pages.map((page) => (
                                <div
                                    key={page.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-black/10 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-black">{page.title}</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/{page.slug}</p>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/admin/footer/${page.slug}`}
                                        className="p-2.5 bg-white text-black rounded-xl border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
