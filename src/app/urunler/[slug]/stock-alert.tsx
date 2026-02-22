'use client';

import { useState } from 'react';
import { Bell, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    productId: string;
    productName: string;
}

export default function StockAlertButton({ productId, productName }: Props) {
    const [email, setEmail] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/stock-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, productId }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setDone(true);
            toast.success('Bildirim kaydedildi!', { description: result.message });
        } catch (error: any) {
            toast.error(error.message || 'Hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-4 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{productName} tekrar stoka girdiğinde email ile bildirim alacaksınız.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">YENİDEN GELİNCE HABER VER</h3>
                    <p className="text-xs text-slate-500 font-medium">Stoka girince e-posta ile bildireceğiz</p>
                </div>
            </div>

            {!open ? (
                <button
                    onClick={() => setOpen(true)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black py-3.5 rounded-2xl text-sm transition-all duration-300 shadow-xl shadow-amber-500/20 active:translate-y-0.5"
                >
                    Takip Et
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="email@adresiniz.com"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-slate-400 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black px-5 py-3 rounded-2xl text-sm transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                    </button>
                </form>
            )}
        </div>
    );
}
