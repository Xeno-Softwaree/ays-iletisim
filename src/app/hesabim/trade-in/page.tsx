import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRightLeft,
    Smartphone,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Battery,
    Banknote,
    Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
    'Beklemede': { label: 'Beklemede', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-600' },
    'İnceleniyor': { label: 'İnceleniyor', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-600' },
    'Onaylandı': { label: 'Onaylandı', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-600' },
    'Reddedildi': { label: 'Reddedildi', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-600' },
};

export default async function TradeInRequestsPage() {
    const session = await auth();
    if (!session?.user?.email) {
        redirect('/login?callbackUrl=/hesabim/trade-in');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { phone: true },
    });

    // Normalize phone to last 10 digits for loose matching
    // e.g. +905418968443  →  5418968443
    //      05418968443    →  5418968443
    const normalizePhone = (p: string) => p.replace(/\D/g, '').slice(-10);

    let requests: any[] = [];
    if (user?.phone) {
        const normalized = normalizePhone(user.phone);
        // Fetch all and filter – trade-in table may use different formats
        const all = await prisma.tradeInRequest.findMany({ orderBy: { createdAt: 'desc' } });
        requests = all.filter(r => normalizePhone(r.customerPhone) === normalized);
    }

    const formatPrice = (val: any) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Number(val));

    const formatDate = (d: Date) =>
        new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href="/hesabim"
                        className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center transition-all hover:bg-slate-50 shadow-sm active:scale-90"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Eskiyi Getir Başvuruları</h1>
                        <p className="text-slate-400 text-xs font-medium mt-0.5">{requests.length} başvuru kaydı bulundu</p>
                    </div>
                </div>

                {/* Phone number warning */}
                {!user?.phone && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 flex items-start gap-4 shadow-sm animate-in slide-in-from-top-4 duration-500">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-100">
                            <Phone className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-amber-900 font-semibold text-sm mb-1">Telefon numarası eksik</p>
                            <p className="text-amber-700 text-sm font-medium leading-relaxed">
                                Başvurularınızı görebilmek için sistemde kayıtlı olan telefon numaranızı{' '}
                                <Link href="/hesabim/ayarlar" className="font-bold underline decoration-amber-300 hover:text-amber-900 transition-colors">
                                    ayarlar kısmından
                                </Link>{' '}
                                eklemeniz gerekmektedir.
                            </p>
                        </div>
                    </div>
                )}

                {requests.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ArrowRightLeft className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-xl mb-2">Henüz başvuru yok</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs mx-auto">
                            {user?.phone
                                ? 'Eski telefonunuzu değerlendirmek için hemen başvuru yapabilirsiniz.'
                                : 'Telefon numaranızı ekledikten sonra başvurularınız burada listelenecektir.'}
                        </p>
                        <Link
                            href="/eskiyi-getir"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:translate-y-0.5"
                        >
                            Hemen Başvuru Yap
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {requests.map((req) => {
                            const s = STATUS_MAP[req.status] ?? STATUS_MAP['Beklemede'];
                            return (
                                <div key={req.id} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:border-blue-200 transition-all duration-300 group">
                                    {/* Top bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-6 border-b border-slate-50 bg-slate-50/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500">
                                                <Smartphone className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-semibold">
                                                    {req.brand} {req.model}
                                                </p>
                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">{formatDate(req.createdAt)}</p>
                                            </div>
                                        </div>
                                        <span className={cn("self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm", s.color, s.bg, s.border)}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                                            {s.label}
                                        </span>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8">
                                        <div className="space-y-1">
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Ekran Durumu</p>
                                            <p className="text-slate-900 font-semibold text-sm">{req.screenCondition}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">Pil Sağlığı</p>
                                            <p className="text-slate-900 font-semibold text-sm">%{req.batteryHealth}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">Ön Teklif</p>
                                            <p className="text-slate-900 font-bold text-sm">{formatPrice(req.estimatedPrice)}</p>
                                        </div>
                                        <div className={cn("p-3 rounded-xl transition-colors", req.finalOffer ? "bg-green-50/50 border border-green-100" : "bg-slate-50/50 border border-slate-100")}>
                                            <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", req.finalOffer ? "text-green-600" : "text-slate-400")}>Kesin Teklif</p>
                                            <p className={cn("font-bold text-sm", req.finalOffer ? "text-green-700" : "text-slate-400")}>
                                                {req.finalOffer ? formatPrice(req.finalOffer) : 'BEKLENİYOR'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Admin note */}
                                    {req.adminNote && (
                                        <div className="px-8 py-5 border-t border-slate-50 bg-blue-50/30">
                                            <div className="flex items-start gap-3">
                                                <Search className="w-4 h-4 text-blue-400 mt-0.5" />
                                                <p className="text-slate-600 text-sm leading-relaxed font-medium italic">"{req.adminNote}"</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {requests.length > 0 && (
                    <div className="mt-12 text-center">
                        <Link
                            href="/eskiyi-getir"
                            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 font-semibold px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95"
                        >
                            Yeni Başvuru Yap
                            <ArrowRightLeft className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
