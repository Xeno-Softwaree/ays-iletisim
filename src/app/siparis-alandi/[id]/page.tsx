import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { CheckCircle, Package, MapPin, Smartphone, CreditCard, ArrowRight, Copy } from 'lucide-react';
import Link from 'next/link';

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.email) redirect('/login');

    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) notFound();

    // Verify ownership
    if (order.userId !== session.user.id) notFound();

    const bankAccounts = order.paymentMethod === 'TRANSFER'
        ? await prisma.bankAccount.findMany({ where: { isActive: true } })
        : [];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
            <div className="text-center mb-12">
                <div className="w-24 h-24 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-50">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">SİPARİŞİNİZ ALINDI!</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    Sipariş numaranız: <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">#{order.id.slice(0, 8)}</span>
                </p>
            </div>

            <div className="space-y-8">
                {/* Bank Info for Transfer */}
                {order.paymentMethod === 'TRANSFER' && (
                    <div className="bg-white border border-blue-200 rounded-[40px] p-8 shadow-2xl shadow-blue-500/5 overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
                        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
                            <Smartphone className="w-6 h-6 text-blue-600" />
                            Havale / EFT Bilgileri
                        </h2>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mb-8">
                            <p className="text-sm text-blue-900/70 font-medium leading-relaxed">
                                Siparişinizin onaylanması için lütfen ödemenizi aşağıdaki hesaplardan birine yapınız.
                                Açıklama kısmına <span className="text-blue-600 font-black">#{order.id.slice(0, 8)}</span> yazmayı unutmayınız.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {bankAccounts.map((acc) => (
                                <div key={acc.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all duration-300 shadow-sm group/acc">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="font-black text-slate-900 uppercase tracking-tight">{acc.bankName}</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Alıcı:</span>
                                            <span className="font-bold text-slate-700">{acc.accountHolder}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 group-hover/acc:border-blue-100 transition-colors">
                                            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">IBAN:</span>
                                            <span className="font-mono font-bold text-slate-900 text-sm">{acc.iban}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Order Details */}
                <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                        <Package className="w-6 h-6 text-slate-300" />
                        Sipariş Detayları
                    </h2>

                    <div className="space-y-6 mb-10">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex gap-5 items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                                <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                                    <Package className="w-8 h-8 text-slate-100" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 font-black uppercase tracking-tight truncate">{item.product.name}</p>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">{item.quantity} ADET</p>
                                </div>
                                <div className="text-slate-900 font-black text-lg tracking-tight">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Number(item.price) * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Teslimat Adresi
                            </h3>
                            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-50">
                                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                    <span className="font-black block text-slate-900 uppercase tracking-tight mb-2">{order.fullName}</span>
                                    {order.address}<br />
                                    <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] mt-1 inline-block">{order.city}</span>
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                {order.paymentMethod === 'TRANSFER' ? <Smartphone className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                                Ödeme Yöntemi
                            </h3>
                            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-50">
                                <p className="text-slate-900 font-black uppercase tracking-tight text-sm">
                                    {order.paymentMethod === 'TRANSFER' ? 'Havale / EFT' : 'Kredi Kartı'}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-between items-center">
                                    <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Toplam Tutar</span>
                                    <span className="text-2xl font-black text-blue-600 tracking-tighter">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Number(order.totalAmount))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <Link
                    href="/hesabim/siparisler"
                    className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-xl active:translate-y-0.5 uppercase tracking-widest text-xs"
                >
                    SİPARİŞLERİME GİT
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
