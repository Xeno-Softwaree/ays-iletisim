'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Smartphone, Sparkles, RefreshCw, Maximize2, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    images: string[];
    productName: string;
    isNew: boolean;
}

export default function ImageGallery({ images, productName, isNew }: Props) {
    const [selected, setSelected] = useState(0);
    const [showZoom, setShowZoom] = useState(false);

    return (
        <div className="space-y-6">
            {/* Main Image Container */}
            <div className="relative group">
                <div
                    onClick={() => images[selected] && setShowZoom(true)}
                    className="relative bg-white border border-slate-100 rounded-3xl overflow-hidden aspect-square flex items-center justify-center cursor-zoom-in shadow-premium transition-all duration-700 group-hover:border-blue-500/20"
                >
                    {/* Condition Ribbon (Softened) */}
                    <div className={cn(
                        "absolute top-6 left-6 z-10 flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border",
                        isNew
                            ? "bg-blue-600/90 border-blue-500/30 text-white"
                            : "bg-amber-500/90 border-amber-400/30 text-white"
                    )}>
                        {isNew ? <Sparkles size={14} /> : <RefreshCw size={14} />}
                        {isNew ? 'Sıfır' : 'İkinci El'}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selected}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full h-full p-8 relative"
                        >
                            {images[selected] ? (
                                <Image
                                    src={images[selected]}
                                    alt={`${productName} - Görsel ${selected + 1}`}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                    className="object-contain select-none pointer-events-none transition-transform duration-1000 group-hover:scale-110 p-8"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                    <Smartphone className="w-24 h-24 text-slate-100" />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Zoom Hint (Minimal) */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-100 shadow-xl text-slate-400 hover:text-blue-600 transition-colors">
                            <Maximize2 size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide snap-x">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setSelected(i)}
                            className={cn(
                                "flex-shrink-0 w-24 h-24 rounded-[22px] border overflow-hidden transition-all duration-300 relative snap-start",
                                selected === i
                                    ? "border-blue-600 ring-4 ring-blue-500/10 scale-105 z-10"
                                    : "border-slate-100 bg-white hover:border-slate-200 hover:scale-105 opacity-60 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${productName} thumbnail ${i + 1}`}
                                fill
                                sizes="96px"
                                className="object-cover"
                            />
                            {selected === i && (
                                <div className="absolute inset-0 bg-blue-500/5 flex items-center justify-center">
                                    <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                        <Check className="w-3 h-3" />
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Zoom Modal */}
            <AnimatePresence>
                {showZoom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowZoom(false)}
                        className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12 cursor-zoom-out"
                    >
                        <button
                            onClick={() => setShowZoom(false)}
                            className="absolute top-10 right-10 p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors shadow-2xl z-[110]"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative max-w-5xl w-full max-h-[85vh] h-full"
                        >
                            <Image
                                src={images[selected]}
                                alt={productName}
                                fill
                                sizes="100vw"
                                className="object-contain drop-shadow-[0_45px_45px_rgba(0,0,0,0.15)]"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
