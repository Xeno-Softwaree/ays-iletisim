'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import Link from 'next/link';
import { CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    // If already logged in as admin, redirect immediately
    useEffect(() => {
        if (status === 'authenticated' && (session?.user as any)?.role === 'ADMIN') {
            router.replace('/admin');
        }
    }, [session, status, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // If a non-admin session is active and user hasn't confirmed yet, block
        if (session && !confirmed) {
            setConfirmed(true);
            toast.warning('Aktif oturum bulundu', {
                description: 'Devam etmek için tekrar butona basın — mevcut oturum kapatılacak.',
            });
            return;
        }

        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const securityCode = formData.get('securityCode') as string;

        try {
            // Sign out existing session first to avoid cookie conflict
            if (session) {
                await signOut({ redirect: false });
            }

            const res = await signIn('credentials', {
                email,
                password,
                securityCode,
                redirect: false,
            });

            if (res?.error) {
                setConfirmed(false);
                toast.error('Erişim Reddedildi', {
                    description: 'Email, şifre veya güvenlik kodu hatalı.',
                    className: 'bg-red-500/10 border-red-500/20 text-red-500 font-bold backdrop-blur-md',
                });
            } else {
                toast.success('Yönetim Paneli Girişi', {
                    description: 'Güvenlik doğrulaması başarılı.',
                    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
                    className: 'bg-green-500/10 border-green-500/20 text-green-500 font-bold backdrop-blur-md',
                });
                router.push('/admin');
                router.refresh();
            }
        } catch (error) {
            toast.error('Sistem Hatası');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="YÖNETİM KONSOLU"
            subtitle="GÜVENLİ GİRİŞ PANELİ"
            className="border-red-500/20 shadow-red-900/20 hover:shadow-red-900/30"
        >
            <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse-slow">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
            </div>

            {/* Active session warning */}
            {session && (session?.user as any)?.role !== 'ADMIN' && (
                <div className={`mb-5 flex items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors ${confirmed
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                        {confirmed
                            ? <>Tekrar gönder — <strong>{session.user?.email}</strong> oturumu kapatılacak.</>
                            : <><strong>{session.user?.name || session.user?.email}</strong> olarak giriş yapılmış. Admin girişi bu oturumu sonlandıracak.</>
                        }
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput
                    name="email"
                    label="Yönetici Email"
                    type="email"
                    icon="mail"
                    required
                    autoComplete="email"
                />

                <AuthInput
                    name="password"
                    label="Şifre"
                    type="password"
                    icon="lock"
                    required
                    autoComplete="current-password"
                />

                <AuthInput
                    name="securityCode"
                    label="Güvenlik Kodu"
                    type="password"
                    icon="shield"
                    required
                    autoComplete="off"
                    className="tracking-widest"
                />

                <AuthButton
                    type="submit"
                    loading={loading}
                    className={confirmed
                        ? 'bg-gradient-to-r from-red-700 to-red-600 shadow-red-700/30'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-600/30 hover:shadow-red-600/50'
                    }
                >
                    {confirmed ? 'OTURUMU KAPAT VE GİRİŞ YAP' : 'PANEL GİRİŞİ YAP'}
                </AuthButton>
            </form>

            <p className="text-center mt-6 text-xs font-bold text-gray-600">
                <Link href="/login" className="hover:text-white transition-colors">Normal Girişe Dön</Link>
            </p>
        </AuthCard>
    );
}
