'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Lock,
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react';

function FieldGroup({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-50 border border-blue-100/50 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-slate-900 font-semibold tracking-tight">{label}</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Yönetmek için formu kullanın</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function Input({ label, type = 'text', ...props }: any) {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">{label}</label>
            <div className="relative">
                <input
                    {...props}
                    type={isPassword ? (show ? 'text' : 'password') : type}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:border-blue-600 focus:bg-white outline-none transition-all pr-12"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { data: session, update, status } = useSession();
    const router = useRouter();

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        router.push('/login?callbackUrl=/hesabim/ayarlar');
        return null;
    }

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProfileLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
        };

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success('Profil bilgileriniz güncellendi.');
                await update({ ...session, user: { ...session.user, name: data.fullName } });
            } else {
                const err = await res.json();
                toast.error(err.message || 'Güncelleme başarısız.');
            }
        } catch (error) {
            toast.error('Bir hata oluştu.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            return toast.error('Yeni şifreler eşleşmiyor.');
        }

        setPasswordLoading(true);

        try {
            const res = await fetch('/api/user/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (res.ok) {
                toast.success('Şifreniz başarıyla değiştirildi.');
                (e.target as HTMLFormElement).reset();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Şifre değiştirme başarısız.');
            }
        } catch (error) {
            toast.error('Bir hata oluştu.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const user = session.user as any;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href="/hesabim"
                        className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center transition-all hover:bg-slate-50 shadow-sm active:scale-90"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Hesap Ayarları</h1>
                        <p className="text-slate-400 text-xs font-medium mt-0.5">Bilgilerini ve şifreni güncelle</p>
                    </div>
                </div>

                <div className="max-w-xl mx-auto space-y-8">
                    {/* Profile Info */}
                    <FieldGroup label="Kişisel Bilgiler" icon={User}>
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <Input
                                label="Ad Soyad"
                                name="fullName"
                                defaultValue={user?.name || ''}
                                placeholder="Adınız Soyadınız"
                                required
                            />
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Adresi</label>
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-not-allowed group">
                                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <span className="text-slate-500 font-medium text-sm flex-1">{user?.email}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-slate-200/60 rounded-lg px-2 py-0.5">Sabit</span>
                                </div>
                            </div>
                            <Input
                                label="Telefon"
                                name="phone"
                                type="tel"
                                placeholder="+90 5XX XXX XX XX"
                                defaultValue={user?.phone || ''}
                            />
                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:translate-y-0.5"
                            >
                                {profileLoading
                                    ? <Loader2 className="w-5 h-5 animate-spin" />
                                    : 'Bilgileri Güncelle'}
                            </button>
                        </form>
                    </FieldGroup>

                    {/* Password */}
                    <FieldGroup label="Şifre İşlemleri" icon={Lock}>
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <Input label="Mevcut Şifre" name="currentPassword" type="password" required />
                            <div className="grid grid-cols-1 gap-6">
                                <Input label="Yeni Şifre" name="newPassword" type="password" required />
                                <Input label="Yeni Şifre Tekrar" name="confirmPassword" type="password" required />
                            </div>
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg active:translate-y-0.5"
                            >
                                {passwordLoading
                                    ? <Loader2 className="w-5 h-5 animate-spin" />
                                    : 'Şifreyi Güncelle'}
                            </button>
                        </form>
                    </FieldGroup>
                </div>
            </div>
        </div>
    );
}
