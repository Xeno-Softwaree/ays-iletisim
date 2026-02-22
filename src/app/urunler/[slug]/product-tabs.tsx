'use client';

import { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, ChevronRight, PenLine, Cpu, Layout, Activity } from 'lucide-react';
import ProductReviews from '@/components/products/ProductReviews';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Spec { label: string; value: string; }

interface Props {
    productId: string;
    description?: string | null;
    specs?: Spec[];
}

function DescriptionRenderer({ raw }: { raw: string }) {
    const lines = raw.split('\n');
    return (
        <div className="space-y-6 max-w-4xl mx-auto py-8">
            {lines.map((line, i) => {
                const t = line.trim();
                if (!t) return null;

                if (t.startsWith('# ')) return (
                    <h3 key={i} className="text-slate-900 text-xl font-black uppercase tracking-tight pt-8 first:pt-0 pb-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        {t.slice(2)}
                    </h3>
                );

                if (t.startsWith('## ')) return (
                    <div key={i} className="flex items-center gap-3 pt-6 pb-2">
                        <div className="p-1 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-slate-900 font-bold text-base tracking-tight">{t.slice(3)}</span>
                    </div>
                );

                if (t.startsWith('- ') || t.startsWith('• ')) return (
                    <div key={i} className="flex items-start gap-3 pl-4 py-1">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        <span className="text-slate-600 text-sm leading-relaxed font-medium">{t.slice(2)}</span>
                    </div>
                );

                return <p key={i} className="text-slate-600 text-base leading-[1.8] font-medium">{t}</p>;
            })}
        </div>
    );
}

export default function ProductTabs({ productId, description, specs = [] }: Props) {
    const [active, setActive] = useState<'desc' | 'specs' | 'reviews'>('desc');

    const tabs = [
        { id: 'desc', label: 'ÜRÜN AÇIKLAMASI', icon: Layout },
        { id: 'specs', label: 'TEKNİK ÖZELLİKLER', icon: Cpu, count: specs.length || undefined },
        { id: 'reviews', label: 'DEĞERLENDİRMELER', icon: Star },
    ] as const;

    return (
        <div className="py-12 lg:py-20">
            {/* Tab bar */}
            <div className="flex items-center justify-center mb-16">
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = active === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActive(tab.id)}
                                className={cn(
                                    "relative flex items-center gap-2.5 px-6 py-3 text-[11px] font-black tracking-widest transition-all duration-500 rounded-full",
                                    isActive
                                        ? "text-blue-600 bg-blue-50/50 shadow-inner"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <Icon size={14} />
                                {tab.label}
                                {('count' in tab && tab.count !== undefined) && (
                                    <span className={cn(
                                        "ml-1 px-1.5 py-0.5 rounded-lg text-[9px]",
                                        isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                        {tab.count}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-600 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {/* Ürün Açıklaması */}
                    {active === 'desc' && (
                        <div className="max-w-4xl mx-auto">
                            {description ? (
                                <DescriptionRenderer raw={description} />
                            ) : (
                                <div className="text-center py-24 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
                                    <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                        <Layout size={40} />
                                    </div>
                                    <h3 className="text-slate-900 font-bold uppercase tracking-widest text-xs mb-2">Açıklama Bulunmuyor</h3>
                                    <p className="text-slate-400 text-sm font-medium">Bu ürün için henüz detaylı bir açıklama eklenmemiş.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Teknik Özellikler */}
                    {active === 'specs' && (
                        <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
                            {specs.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {specs.map(({ label, value }, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "grid grid-cols-2 gap-8 px-10 py-6 transition-colors",
                                                i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                            )}
                                        >
                                            <span className="text-slate-500 text-sm font-medium">{label}</span>
                                            <span className="text-slate-900 text-sm font-semibold">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24">
                                    <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                        <Cpu size={40} />
                                    </div>
                                    <h3 className="text-slate-900 font-bold uppercase tracking-widest text-xs mb-2">Özellik Bulunmuyor</h3>
                                    <p className="text-slate-400 text-sm font-medium">Bu ürün için teknik özellik bilgisi girilmemiş.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Değerlendirmeler */}
                    {active === 'reviews' && (
                        <div className="max-w-4xl mx-auto">
                            <ProductReviews productId={productId} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
