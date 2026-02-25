'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { TurnstileWidget } from '@/components/security/TurnstileWidget';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!turnstileToken) {
            toast.error('Giriş Başarısız', {
                description: 'Lütfen doğrulamayı tamamlayın.',
                className: 'bg-red-500/10 border-red-500/20 text-red-500 font-bold backdrop-blur-md'
            });
            setLoading(false);
            return;
        }

        try {
            const res = await signIn('credentials', {
                email,
                password,
                turnstileToken,
                redirect: false,
            });

            if (res?.error) {
                toast.error('Giriş Başarısız', {
                    description: 'Email veya şifre hatalı.',
                    className: 'bg-red-500/10 border-red-500/20 text-red-500 font-bold backdrop-blur-md'
                });
            } else {
                toast.success('Giriş Başarılı', {
                    description: 'Yönlendiriliyorsunuz...',
                    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
                    className: 'bg-green-500/10 border-green-500/20 text-green-500 font-bold backdrop-blur-md'
                });
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            toast.error('Sistem Hatası', { description: 'Lütfen daha sonra tekrar deneyin.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="GİRİŞ YAP"
            subtitle="HESABINIZA ERİŞİN"
            theme="light"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput
                    name="email"
                    label="Email Adresi"
                    type="email"
                    icon="mail"
                    required
                    autoComplete="email"
                    theme="light"
                />

                <AuthInput
                    name="password"
                    label="Şifre"
                    type="password"
                    icon="lock"
                    required
                    autoComplete="current-password"
                    theme="light"
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input type="checkbox" className="peer sr-only" />
                            <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 left-1 top-1 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-gray-500 group-hover:text-black transition-colors uppercase tracking-wide">Beni Hatırla</span>
                    </label>
                    <Link href="/forgot-password" title="Şifremi Unuttum" className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors uppercase tracking-wide">Şifremi Unuttum?</Link>
                </div>

                <TurnstileWidget action="login" onToken={setTurnstileToken} />

                <AuthButton type="submit" loading={loading} disabled={!turnstileToken || loading}>
                    GİRİŞ YAP
                </AuthButton>
            </form>

            <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 px-4 text-gray-400 font-bold tracking-widest">veya</span>
                </div>
            </div>

            <p className="text-center mt-6 text-sm font-bold text-gray-500">
                Hesabın yok mu? <Link href="/register" className="text-black hover:text-blue-600 transition-colors underline decoration-2 underline-offset-4 decoration-blue-100 hover:decoration-blue-600">Kayıt Ol</Link>
            </p>
        </AuthCard>
    );
}
