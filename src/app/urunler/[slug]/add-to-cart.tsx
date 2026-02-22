'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Zap, CheckCircle2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorOption { name: string; hex: string; }

interface Props {
    product: {
        id: string;
        name: string;
        price: number;
        image?: string;
        slug: string;
        stock: number;
        colors?: ColorOption[];
    };
}

export default function AddToCartButtons({ product }: Props) {
    const { addItem, items } = useCart();
    const router = useRouter();
    const [added, setAdded] = useState(false);
    const [selectedColor, setSelectedColor] = useState<ColorOption | null>(
        null // Start with null to force selection or handle default
    );

    // Default to first color if only one exists or just for easier UX
    useState(() => {
        if (product.colors && product.colors.length > 0) {
            setSelectedColor(product.colors[0]);
        }
    });

    const hasColors = product.colors && product.colors.length > 0;

    // Find matching cart item (by id + color)
    const cartItem = items.find(i =>
        i.id === product.id &&
        (selectedColor ? i.selectedColor === selectedColor.name : !i.selectedColor)
    );
    const remaining = product.stock - (cartItem?.quantity ?? 0);

    const buildPayload = () => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
        stock: product.stock,
        selectedColor: selectedColor?.name,
    });

    const handleAddToCart = () => {
        if (hasColors && !selectedColor) {
            toast.error('Lütfen bir renk seçin');
            return;
        }
        if (remaining <= 0) {
            toast.error('Sepet limiti aşıldı', { description: 'Bu üründen daha fazla ekleyemezsiniz.' });
            return;
        }
        addItem(buildPayload());
        setAdded(true);
        toast.success('Sepete eklendi!', {
            description: selectedColor ? `${product.name} — ${selectedColor.name}` : product.name,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
            action: { label: 'Sepete Git →', onClick: () => router.push('/sepet') },
        });
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (hasColors && !selectedColor) { toast.error('Lütfen bir renk seçin'); return; }
        if (remaining <= 0) return;
        addItem(buildPayload());
        router.push('/sepet');
    };

    const disabled = product.stock === 0;

    return (
        <div className="space-y-8">
            {/* ─── Color Picker ─── */}
            {hasColors && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Renk Seçimi</p>
                        <AnimatePresence mode="wait">
                            {selectedColor && (
                                <motion.p
                                    key={selectedColor.name}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="text-slate-900 text-xs font-black uppercase tracking-tight"
                                >
                                    {selectedColor.name}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {product.colors!.map(color => {
                            const active = selectedColor?.name === color.name;
                            return (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color)}
                                    title={color.name}
                                    className={cn(
                                        "group relative w-12 h-12 rounded-full transition-all duration-500",
                                        active
                                            ? "ring-4 ring-blue-600 ring-offset-4 ring-offset-white scale-110"
                                            : "hover:scale-105"
                                    )}
                                >
                                    <span
                                        className="absolute inset-0 rounded-full border border-slate-200 shadow-inner"
                                        style={{ background: color.hex }}
                                    />
                                    {/* Selection Tick */}
                                    {active && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg animate-in zoom-in duration-300">
                                                <Check className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Primary: Sepete Ekle */}
                <button
                    onClick={handleAddToCart}
                    disabled={disabled || (hasColors && !selectedColor)}
                    className={cn(
                        "w-full h-14 flex items-center justify-center gap-3 font-bold text-sm rounded-xl transition-all duration-300 relative overflow-hidden group shadow-lg active:scale-[0.98]",
                        added
                            ? "bg-emerald-500 text-white"
                            : disabled || (hasColors && !selectedColor)
                                ? "bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                    )}
                >
                    <ShoppingCart className={cn("w-5 h-5 transition-transform", !added && "group-hover:scale-110")} />
                    <span>{added ? 'Sepete Eklendi ✓' : disabled ? 'Tükendi' : (hasColors && !selectedColor) ? 'Renk Seçiniz' : 'Sepete Ekle'}</span>

                    {cartItem && !added && (
                        <div className="absolute right-4 bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/20">
                            {cartItem.quantity} Adet
                        </div>
                    )}
                </button>

                {/* Secondary: Hemen Satın Al */}
                {!disabled && (
                    <button
                        onClick={handleBuyNow}
                        disabled={hasColors && !selectedColor}
                        className={cn(
                            "w-full h-14 flex items-center justify-center gap-3 font-bold text-sm rounded-xl transition-all duration-300 border-2 active:scale-[0.98]",
                            hasColors && !selectedColor
                                ? "border-slate-100 text-slate-300 cursor-not-allowed"
                                : "border-blue-600 text-blue-600 hover:bg-blue-50"
                        )}
                    >
                        <Zap className="w-5 h-5 shrink-0" />
                        <span>Hemen Satın Al</span>
                    </button>
                )}
            </div>

            {/* Mobile Sticky CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <div className="flex flex-col shrink-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FİYAT</span>
                        <span className="text-xl font-black text-slate-900 leading-tight">
                            {new Intl.NumberFormat('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                                maximumFractionDigits: 0,
                            }).format(product.price)}
                        </span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={disabled || (hasColors && !selectedColor)}
                        className={cn(
                            "flex-1 h-12 flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg",
                            added
                                ? "bg-emerald-500 text-white"
                                : disabled
                                    ? "bg-slate-100 text-slate-300"
                                    : "bg-blue-600 text-white shadow-blue-500/20"
                        )}
                    >
                        <ShoppingCart size={18} />
                        {added ? 'Eklendi' : 'Sepete Ekle'}
                    </button>
                </div>
            </div>
        </div>
    );
}
