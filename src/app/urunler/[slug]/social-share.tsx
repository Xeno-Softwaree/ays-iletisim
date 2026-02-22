'use client';

import { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Twitter } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    productName: string;
    productSlug: string;
}

export default function SocialShare({ productName, productSlug }: Props) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    const url = typeof window !== 'undefined'
        ? `${window.location.origin}/urunler/${productSlug}`
        : `/urunler/${productSlug}`;

    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${productName} - Harika bir fiyatla burada! 🎉`);

    const copyLink = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link kopyalandı!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-100 transition duration-300"
            >
                <Share2 className="w-4 h-4" />
                Paylaş
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute bottom-full mb-3 right-0 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl z-20 min-w-[220px] animate-in slide-in-from-bottom-2 duration-300">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Paylaş</p>
                        <div className="space-y-1">
                            <a
                                href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm text-slate-600 font-bold hover:text-blue-600"
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                                WhatsApp
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm text-slate-600 font-bold hover:text-sky-600"
                            >
                                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                                    <Twitter className="w-4 h-4 text-sky-500" />
                                </div>
                                Twitter / X
                            </a>
                            <button
                                onClick={copyLink}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm text-slate-600 font-bold hover:text-slate-900"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </div>
                                {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
