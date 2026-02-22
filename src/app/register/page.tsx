'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const checkPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length > 5) strength += 1; // Length
        if (pass.length > 7) strength += 1; // Good length
        if (/[A-Z]/.test(pass)) strength += 1; // Uppercase
        if (/[0-9]/.test(pass)) strength += 1; // Number
        setPasswordStrength(strength);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        const pass = data.password as string;
        const confirmPass = formData.get('confirmPassword') as string;

        if (pass !== confirmPass) {
            toast.error('Hata', {
                description: 'Şifreler eşleşmiyor.',
                className: 'bg-red-500/10 border-red-500/20 text-red-500 font-bold backdrop-blur-md'
            });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                toast.success('Kayıt Başarılı!', {
                    description: 'Doğrulama kodu email adresinize gönderildi.',
                    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
                    className: 'bg-green-500/10 border-green-500/20 text-green-500 font-bold backdrop-blur-md'
                });

                // Use `data.email` captured before the async fetch — 
                // re-reading from e.currentTarget returns null after submit.
                const email = data.email as string;
                setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(email)}`), 1500);
            } else {
                toast.error('Kayıt Başarısız', {
                    description: result.message || 'Bir hata oluştu.',
                    className: 'bg-red-500/10 border-red-500/20 text-red-500 font-bold backdrop-blur-md'
                });
            }

        } catch (error) {
            toast.error('Hata', { description: 'Bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="KAYIT OL"
            subtitle="AYS İLETİŞİM AİLESİNE KATILIN"
            theme="light"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthInput
                    name="fullName"
                    label="Ad Soyad"
                    type="text"
                    icon="user"
                    required
                    theme="light"
                />

                <AuthInput
                    name="email"
                    label="Email Adresi"
                    type="email"
                    icon="mail"
                    required
                    theme="light"
                />

                <AuthInput
                    name="phone"
                    label="Telefon Numarası"
                    type="tel"
                    icon="phone"
                    required
                    theme="light"
                />

                <div className="space-y-2">
                    <AuthInput
                        name="password"
                        label="Şifre"
                        type="password"
                        icon="lock"
                        required
                        onChange={(e) => checkPasswordStrength(e.target.value)}
                        theme="light"
                    />

                    {/* Password Strength Indicator */}
                    <div className="flex gap-1 h-1 px-1">
                        {[1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level
                                    ? (passwordStrength < 3 ? 'bg-red-500 shadow-sm' : passwordStrength === 3 ? 'bg-yellow-500 shadow-sm' : 'bg-green-500 shadow-sm')
                                    : 'bg-gray-100'
                                    }`}
                            ></div>
                        ))}
                    </div>
                </div>

                <AuthInput
                    name="confirmPassword"
                    label="Şifre Tekrar"
                    type="password"
                    icon="lock"
                    required
                    theme="light"
                />

                <AuthButton type="submit" loading={loading} className="mt-4">
                    HESAP OLUŞTUR
                </AuthButton>
            </form>

            <p className="text-center mt-6 text-sm font-bold text-gray-500">
                Zaten hesabın var mı? <Link href="/login" className="text-black hover:text-blue-600 transition-colors underline decoration-2 underline-offset-4 decoration-blue-100 hover:decoration-blue-600">Giriş Yap</Link>
            </p>
        </AuthCard>
    );
}
