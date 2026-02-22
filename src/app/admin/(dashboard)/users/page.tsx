'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Shield, ShieldAlert, CheckCircle, XCircle, User as UserIcon, Calendar, Mail, Phone, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: string;
    fullName: string | null;
    email: string;
    phone: string | null;
    isAdmin: boolean;
    isVerified: boolean;
    createdAt: string;
    _count: {
        orders: number;
    };
}

import { cn } from '@/lib/utils';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`/api/admin/users?search=${search}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Kullanıcılar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const toggleAdmin = async (id: string, currentStatus: boolean) => {
        const confirmMsg = currentStatus
            ? 'Bu kullanıcının yöneticiliğini almak istiyor musunuz?'
            : 'Bu kullanıcıyı yönetici yapmak istiyor musunuz?';

        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAdmin: !currentStatus }),
            });

            if (res.ok) {
                toast.success('Kullanıcı rolü güncellendi');
                fetchUsers();
            } else {
                toast.error('Güncelleme başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Kullanıcı silindi');
                fetchUsers();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Silme başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kullanıcı Yönetimi</h1>
                    <p className="text-sm text-slate-500 font-medium">Platformdaki tüm kullanıcıları ve erişim yetkilerini kontrol edin.</p>
                </div>
            </div>

            {/* Actions & Search Row */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative group w-full md:flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="İsim, e-posta veya telefon numarası ile ara..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-10 py-2.5 text-sm outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                            <XCircle size={16} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 px-2">
                    <div className="h-8 w-px bg-slate-200 hidden md:block" />
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <UserIcon size={16} className="text-slate-400" />
                        Toplam: <span className="text-slate-900 font-bold">{users.length}</span>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Kullanıcı</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Durum & Rol</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Siparişler</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Kayıt Tarihi</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-10 bg-slate-50 rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <UserIcon size={48} className="text-slate-300" />
                                            <p className="font-bold text-slate-900 uppercase tracking-widest">Kullanıcı Bulunamadı</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm",
                                                    user.isAdmin ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {(user.fullName?.[0] || user.email[0]).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                                                        {user.fullName || 'İsimsiz Kullanıcı'}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                        <Mail size={12} className="opacity-70" /> {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    {user.isAdmin ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-black uppercase tracking-tight border border-slate-200">
                                                            <Shield size={10} /> YÖNETİCİ
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-tight border border-blue-100">
                                                            <UserIcon size={10} /> MÜŞTERİ
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {user.isVerified ? (
                                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                                                            <CheckCircle size={10} /> DOĞRULANMIŞ
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
                                                            <XCircle size={10} /> BEKLEMEDE
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                                                    <ShoppingBag size={14} className="text-slate-400" />
                                                    {user._count.orders}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Sipariş Sayısı</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">
                                                    {new Date(user.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                                                    <Calendar size={10} /> KAYIT
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleAdmin(user.id, user.isAdmin)}
                                                    title={user.isAdmin ? "Yöneticiliği Al" : "Yönetici Yap"}
                                                    className={cn(
                                                        "p-2 rounded-xl transition-all border shadow-sm",
                                                        user.isAdmin
                                                            ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100"
                                                            : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-white"
                                                    )}
                                                >
                                                    {user.isAdmin ? <ShieldAlert size={18} /> : <Shield size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 bg-red-50 border border-red-100 text-red-500 rounded-xl hover:bg-red-100 transition-all shadow-sm"
                                                    title="Kullanıcıyı Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
