'use client';

import { useState, Suspense } from 'react';
import { Key, Lock, Loader2, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { TurnstileWidget } from '@/components/security/TurnstileWidget';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Şifreler eşleşmiyor.');
            return;
        }

        if (password.length < 8) {
            toast.error('Şifre en az 8 karakter olmalıdır.');
            return;
        }

        setLoading(true);

        if (!turnstileToken) {
            toast.error('Lütfen güvenlik doğrulamasını tamamlayın.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password, turnstileToken }),
            });

            if (res.ok) {
                setSuccess(true);
                toast.success('Şifreniz başarıyla güncellendi.');
                setTimeout(() => router.push('/login'), 3000);
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

    if (!token) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <ShieldCheck className="w-10 h-10 text-red-400 opacity-50" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Geçersiz Bağlantı</h2>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium">Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş olabilir. Lütfen tekrar deneyin.</p>
                <Link href="/forgot-password" className="inline-flex items-center gap-2 bg-blue-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/20">
                    Yeni Bağlantı İste
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Şifreniz Güncellendi!</h2>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium">Yeni şifreniz başarıyla kaydedildi. Birkaç saniye içinde giriş sayfasına yönlendirileceksiniz.</p>
                <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Yönlendiriliyor...</span>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Yeni Şifre</label>
                <div className="relative">
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="En az 8 karakter"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Şifre Tekrar</label>
                <div className="relative">
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Şifreyi onaylayın"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
            </div>

            <TurnstileWidget action="reset-password" onToken={setTurnstileToken} />

            <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Şifreyi Güncelle'}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-blue-500/5 border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Key className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Yeni Şifre</h1>
                    <p className="text-slate-500 font-medium">Hesabınız için güçlü bir şifre belirleyin.</p>
                </div>

                <Suspense fallback={
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
                        <p className="mt-4 text-slate-500 font-bold">Hazırlanıyor...</p>
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>

                <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
                    <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Vazgeç ve Girişe Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
