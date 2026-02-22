'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.some(char => isNaN(Number(char)))) return;

        const newOtp = [...otp];
        pastedData.forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = otp.join('');
        if (token.length !== 6) return;

        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Doğrulama başarısız.');
                return;
            }

            toast.success('Hesabınız başarıyla doğrulandı!', {
                icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
            });

            router.push('/');
        } catch (error) {
            toast.error('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const res = await fetch('/api/auth/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Kod Tekrar Gönderildi');
            } else {
                toast.error(data.message || 'Hata oluştu');
            }
        } catch (error) {
            toast.error('Bağlantı hatası');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
            >
                <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative z-10 flex justify-center mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="relative z-10 text-2xl font-black text-white tracking-tight">DOĞRULAMA KODU</h1>
                    <p className="relative z-10 text-blue-100 mt-2 text-sm font-medium">
                        {email ? `${email} adresine` : 'Email adresinize'} gönderilen 6 haneli kodu giriniz.
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex gap-2 justify-center">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => { inputRefs.current[index] = el }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all text-gray-800"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Doğrula ve Devam Et'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Kod gelmedi mi? <button type="button" onClick={handleResend} className="text-blue-600 font-bold hover:underline">Tekrar Gönder</button>
                        </p>
                        <Link href="/login" className="block mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                            GİRİŞ EKRANINA DÖN
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
