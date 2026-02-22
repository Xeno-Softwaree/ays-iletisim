'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Loader2,
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    GripVertical,
    FileText,
    HelpCircle
} from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
    q: string;
    a: string;
}

export default function DynamicPageEditor({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const { slug } = use(params); // This line already unwraps params asynchronously using `use`
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [pageData, setPageData] = useState({
        title: '',
        content: '',
        isActive: true
    });
    const [faqs, setFaqs] = useState<FAQItem[]>([]);

    useEffect(() => {
        fetchPage();
    }, [slug]);

    const fetchPage = async () => {
        try {
            const res = await fetch(`/api/admin/dynamic-pages/${slug}`);
            const result = await res.json();

            if (result.success && result.data) {
                setPageData({
                    title: result.data.title,
                    content: result.data.content,
                    isActive: result.data.isActive
                });

                if (slug === 'sss') {
                    try {
                        const parsedFaqs = JSON.parse(result.data.content);
                        setFaqs(Array.isArray(parsedFaqs) ? parsedFaqs : []);
                    } catch (e) {
                        setFaqs([]);
                    }
                }
            }
        } catch (error) {
            toast.error('Sayfa yüklenemedi');
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const toastId = toast.loading('Kaydediliyor...');

        try {
            const content = slug === 'sss' ? JSON.stringify(faqs) : pageData.content;

            const res = await fetch(`/api/admin/dynamic-pages/${slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: pageData.title,
                    content,
                    isActive: pageData.isActive
                }),
            });

            if (res.ok) {
                toast.success('Değişiklikler kaydedildi', { id: toastId });
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Hata oluştu');
            }
        } catch (error: any) {
            toast.error(error.message || 'Kaydedilemedi', { id: toastId });
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
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/5 pb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/footer"
                            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-black tracking-tighter uppercase">{pageData.title}</h1>
                            <p className="text-gray-500 font-medium text-sm tracking-wide uppercase">/{slug} sayfasını düzenliyorsunuz</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 text-white font-black px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2 uppercase tracking-wider text-sm"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        KAYDET
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 p-8 space-y-8">
                    {/* General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sayfa Başlığı</label>
                            <input
                                type="text"
                                value={pageData.title}
                                onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-bold text-black"
                            />
                        </div>
                        <div className="flex items-end pb-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={pageData.isActive}
                                        onChange={(e) => setPageData({ ...pageData, isActive: e.target.checked })}
                                    />
                                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 shadow-inner"></div>
                                </div>
                                <span className="text-xs font-black text-gray-400 group-hover:text-black transition-colors uppercase tracking-widest">SAYFA AKTİF</span>
                            </label>
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            {slug === 'sss' ? <HelpCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                            SAYFA İÇERİĞİ
                        </label>

                        {slug === 'sss' ? (
                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group animate-in zoom-in-95 duration-200">
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity cursor-grab">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newFaqs = [...faqs];
                                                newFaqs.splice(index, 1);
                                                setFaqs(newFaqs);
                                            }}
                                            className="absolute right-4 top-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="space-y-4 ml-6 mr-8">
                                            <input
                                                type="text"
                                                placeholder="Soru"
                                                value={faq.q}
                                                onChange={(e) => {
                                                    const newFaqs = [...faqs];
                                                    newFaqs[index].q = e.target.value;
                                                    setFaqs(newFaqs);
                                                }}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-black outline-none focus:border-blue-500"
                                            />
                                            <textarea
                                                placeholder="Cevap"
                                                value={faq.a}
                                                onChange={(e) => {
                                                    const newFaqs = [...faqs];
                                                    newFaqs[index].a = e.target.value;
                                                    setFaqs(newFaqs);
                                                }}
                                                rows={3}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-black outline-none focus:border-blue-500 resize-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setFaqs([...faqs, { q: '', a: '' }])}
                                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all font-bold flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    YENİ SORU EKLE
                                </button>
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    value={pageData.content}
                                    onChange={(e) => setPageData({ ...pageData, content: e.target.value })}
                                    rows={20}
                                    placeholder="HTML veya düz metin girebilirsiniz..."
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl px-6 py-6 outline-none transition-all font-mono text-sm leading-relaxed text-black"
                                />
                                <p className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">* HTML formatı desteklenmektedir.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
