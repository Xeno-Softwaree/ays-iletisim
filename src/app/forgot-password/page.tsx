'use client';

import { useState } from 'react';
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setIsSent(true);
                toast.success('Sıfırlama bağlantısı gönderildi.');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Bir hata oluştu.');
            }
        } catch (error) {
            toast.error('Bağlantı hatası.');
        } finally {
            setLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-blue-500/5 border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">E-postanızı Kontrol Edin</h1>
                    <p className="text-slate-500 mb-10 leading-relaxed">
                        Eğer <strong>{email}</strong> adresi ile kayıtlı bir hesabınız varsa, şifre sıfırlama bağlantısını içeren bir e-posta gönderdik.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" /> Giriş Sayfasına Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-blue-500/5 border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Şifremi Unuttum</h1>
                    <p className="text-slate-500 font-medium">Güvenli bir şekilde şifrenizi sıfırlayalım.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-posta Adresi</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="E-posta adresinizi girin"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-[0.98]"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span>Bağlantı Gönder</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
                    <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Giriş Seçeneklerine Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
