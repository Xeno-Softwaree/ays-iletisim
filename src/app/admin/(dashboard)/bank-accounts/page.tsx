'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, CreditCard, Save, X, Building, User, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface BankAccount {
    id: string;
    bankName: string;
    accountHolder: string;
    iban: string;
    branchCode?: string;
    accountNumber?: string;
    isActive: boolean;
}

import { cn } from '@/lib/utils';

export default function BankAccountsPage() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

    const [formData, setFormData] = useState({
        bankName: '',
        accountHolder: '',
        iban: '',
        branchCode: '',
        accountNumber: ''
    });

    useEffect(() => { fetchAccounts(); }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/admin/bank-accounts');
            const data = await res.json();
            if (Array.isArray(data)) setAccounts(data);
        } catch { toast.error('Hesaplar yüklenemedi'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Kaydediliyor...');
        try {
            const url = editingAccount ? `/api/admin/bank-accounts/${editingAccount.id}` : '/api/admin/bank-accounts';
            const method = editingAccount ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error();
            toast.success('Başarıyla kaydedildi', { id: toastId });
            setIsModalOpen(false);
            setEditingAccount(null);
            setFormData({ bankName: '', accountHolder: '', iban: '', branchCode: '', accountNumber: '' });
            fetchAccounts();
        } catch { toast.error('Hata oluştu', { id: toastId }); }
    };

    const handleDeleteClick = (id: string) => {
        setAccountToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!accountToDelete) return;
        const toastId = toast.loading('Siliniyor...');
        try {
            const res = await fetch(`/api/admin/bank-accounts/${accountToDelete}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('Hesap silindi', { id: toastId });
            fetchAccounts();
        } catch {
            toast.error('Hata oluştu', { id: toastId });
        } finally {
            setIsDeleteModalOpen(false);
            setAccountToDelete(null);
        }
    };

    const openEditModal = (account: BankAccount) => {
        setEditingAccount(account);
        setFormData({
            bankName: account.bankName,
            accountHolder: account.accountHolder,
            iban: account.iban,
            branchCode: account.branchCode || '',
            accountNumber: account.accountNumber || ''
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Banka Hesapları</h1>
                    <p className="text-sm text-slate-500 font-medium">Ödeme altyapısı için banka hesaplarını yönetin.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAccount(null);
                        setFormData({ bankName: '', accountHolder: '', iban: '', branchCode: '', accountNumber: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                >
                    <Plus size={18} strokeWidth={3} /> Yeni Hesap Ekle
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-[240px] bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse" />
                    ))
                ) : accounts.map((account) => (
                    <div key={account.id} className="group bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div>
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                    <Building size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(account)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all scale-90 hover:scale-100">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(account.id)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all scale-90 hover:scale-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h3 className="font-black text-xl text-slate-900 tracking-tight leading-tight uppercase group-hover:text-blue-600 transition-colors">{account.bankName}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kurumsal Havale Hesabı</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User size={14} className="text-slate-400" />
                                        <span className="font-bold text-slate-700 text-xs truncate uppercase tracking-tight">{account.accountHolder}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Hash size={14} className="text-slate-400" />
                                        <span className="font-black text-slate-900 text-xs tracking-tighter truncate">{account.iban}</span>
                                    </div>
                                </div>

                                {(account.branchCode || account.accountNumber) && (
                                    <div className="flex items-center gap-4 px-1">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Şube</span>
                                            <span className="text-xs font-bold text-slate-600">{account.branchCode || '-'}</span>
                                        </div>
                                        <div className="w-px h-4 bg-slate-100" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Hesap</span>
                                            <span className="text-xs font-bold text-slate-600">{account.accountNumber || '-'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && accounts.length === 0 && (
                    <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                            <Building size={40} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-slate-900 uppercase tracking-tight">Kayıtlı Hesap Bulunmuyor</p>
                            <p className="text-sm text-slate-400 font-medium">Sisteme ödeme alabilmek için banka hesaplarını ekleyin.</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            + Hesabı Şimdi Ekleyin
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="p-10 pb-6">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                        {editingAccount ? 'Hesabı Güncelle' : 'Yeni Banka Hesabı'}
                                    </h2>
                                    <p className="text-xs font-medium text-slate-400 mt-1">Lütfen hesap detaylarını eksiksiz doldurun.</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">BANKA ADI</label>
                                        <div className="relative group">
                                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                value={formData.bankName}
                                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 outline-none transition-all shadow-sm"
                                                placeholder="Örn: Ziraat Bankası"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HESAP SAHİBİ</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                value={formData.accountHolder}
                                                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 outline-none transition-all shadow-sm"
                                                placeholder="Ad Soyad veya Unvan"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IBAN NUMARASI</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.iban}
                                            onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                                            className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-4 py-4 font-black text-slate-900 outline-none transition-all shadow-sm tracking-wider"
                                            placeholder="TR00 0000 0000..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ŞUBE KODU (OPSİYONEL)</label>
                                        <input
                                            type="text"
                                            value={formData.branchCode}
                                            onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-4 font-bold text-slate-900 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HESAP NO (OPSİYONEL)</label>
                                        <input
                                            type="text"
                                            value={formData.accountNumber}
                                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-4 font-bold text-slate-900 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-slate-100 text-slate-500 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-blue-600 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} />
                                        {editingAccount ? 'DEĞİŞİKLİKLERİ KAYDET' : 'HESABI OLUŞTUR'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden border border-slate-100">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
                                <Trash2 size={32} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2">Emin Misiniz?</h2>
                            <p className="text-sm font-medium text-slate-500 mb-10">Bu banka hesabını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 bg-slate-100 text-slate-500 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 bg-red-500 text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-95"
                                >
                                    Evet, Sil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
