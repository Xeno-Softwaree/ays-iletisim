'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Smartphone, MapPin, CreditCard, Wallet, CheckCircle, CheckCircle2, Loader2, ShieldCheck, Filter, ArrowLeft, Heart, ShoppingBag, Settings, LogOut, Search, Smartphone as Phone, Instagram, Twitter, Facebook, Mail, ChevronRight, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: session?.user?.name || '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'CREDIT_CARD' as 'CREDIT_CARD' | 'TRANSFER',
  });

  const [contracts, setContracts] = useState({
    distanceSalesAccepted: false,
    preInfoAccepted: false,
    kvkkRead: false,
  });
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ Coupon state'leri EN ÜSTE taşındı (hook rule fix)
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const res = await fetch('/api/admin/bank-accounts');
        if (res.ok) {
          const data = await res.json();
          setBankAccounts(data.filter((acc: any) => acc.isActive));
        }
      } catch (error) {
        console.error('Failed to fetch bank accounts', error);
      }
    };

    const fetchAddresses = async () => {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/user/addresses');
          if (res.ok) {
            const data = await res.json();
            setSavedAddresses(data);
            const defaultAddr = data.find((a: any) => a.isDefault);
            if (defaultAddr) selectAddress(defaultAddr);
          }
        } catch (error) {
          console.error('Failed to fetch addresses', error);
        }
      }
    };

    fetchBankAccounts();
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const selectAddress = (addr: any) => {
    setForm((prev) => ({
      ...prev,
      fullName: addr.fullName,
      phone: addr.phone,
      city: addr.city,
      address: `${addr.openAddress} ${addr.district}/${addr.city}`,
    }));
    setShowAddressSelector(false);
  };

  useEffect(() => {
    if (!isSuccess && items.length === 0) {
      router.push('/sepet');
    }
  }, [items, router, isSuccess]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Render loading or null based on status
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0 && !isSuccess) {
    return null; // redirect useEffect handles it
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setVerifyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await fetch('/api/coupons/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal: totalPrice }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setCouponError(msg || 'Geçersiz kupon.');
        setDiscountAmount(0);
        setAppliedCoupon(null);
      } else {
        const data = await res.json();
        setDiscountAmount(data.discountAmount);
        setAppliedCoupon(data.code);
        setCouponSuccess(
          `Kupon uygulandı: -${new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
          }).format(data.discountAmount)}`
        );
      }
    } catch (error) {
      setCouponError('Kupon doğrulanırken hata oluştu.');
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponSuccess('');
    setCouponError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side Contract Validation
    if (!contracts.distanceSalesAccepted || !contracts.preInfoAccepted) {
      toast.error('Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu\'nu onaylamanız gerekmektedir.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shipping: {
            fullName: form.fullName,
            phone: form.phone,
            address: form.address,
            city: form.city,
          },
          paymentMethod: form.paymentMethod,
          couponCode: appliedCoupon,
          contracts: {
            ...contracts,
            acceptedAt: new Date().toISOString(),
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Sipariş oluşturulurken bir hata oluştu.');
      }

      const data = await res.json();

      toast.success('Siparişiniz başarıyla alındı!');
      setIsSuccess(true);
      clearCart();
      router.push(`/siparis-alandi/${data.orderId}`);
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className="flex flex-col items-center opacity-40">
              <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">Sepet</span>
            </div>
            <div className="w-16 sm:w-24 h-[2px] bg-slate-200 mt-[-20px] mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/20 ring-4 ring-blue-50">2</div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2">Teslimat</span>
            </div>
            <div className="w-16 sm:w-24 h-[2px] bg-slate-200 mt-[-20px] mx-2" />
            <div className="flex flex-col items-center opacity-40">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Ödeme</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          {/* Main Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Delivery */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                    <h2 className="text-xl font-bold text-slate-900">Teslimat Bilgileri</h2>
                  </div>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressSelector(!showAddressSelector)}
                      className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-blue-100"
                    >
                      {showAddressSelector ? "Kapat" : `Kayıtlı Adreslerim (${savedAddresses.length})`}
                    </button>
                  )}
                </div>

                {showAddressSelector && (
                  <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {savedAddresses.map((addr) => {
                      const isSelected = form.address.includes(addr.openAddress);
                      return (
                        <div
                          key={addr.id}
                          onClick={() => selectAddress(addr)}
                          className={cn(
                            "border p-4 rounded-xl cursor-pointer transition-all group relative",
                            isSelected
                              ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                              : "border-slate-200 bg-white hover:border-blue-300"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-slate-900 text-[10px] uppercase tracking-widest">{addr.title}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-slate-900 font-semibold mb-1">{addr.fullName}</p>
                          <p className="text-xs text-slate-500 line-clamp-2">{addr.openAddress}</p>
                          <p className="text-xs text-slate-400 mt-2 font-medium">{addr.district} / {addr.city}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 ml-1">Ad Soyad</label>
                      <input
                        type="text"
                        required
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 ml-1">Telefon</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 ml-1">Şehir</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="Örn: İstanbul"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 ml-1">Açık Adres</label>
                    <textarea
                      required
                      rows={3}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                      placeholder="Mahalle, Sokak, No, Daire..."
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Payment */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center font-bold">2</div>
                  <h2 className="text-xl font-bold text-slate-900">Ödeme Seçenekleri</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    onClick={() => setForm({ ...form, paymentMethod: 'CREDIT_CARD' })}
                    className={cn(
                      "flex flex-col gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all",
                      form.paymentMethod === 'CREDIT_CARD'
                        ? 'bg-blue-50/50 border-blue-500 ring-4 ring-blue-500/10'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-slate-100", form.paymentMethod === 'CREDIT_CARD' ? 'bg-white text-blue-600' : 'bg-slate-50 text-slate-400')}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", form.paymentMethod === 'CREDIT_CARD' ? 'border-blue-600' : 'border-slate-300')}>
                        {form.paymentMethod === 'CREDIT_CARD' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-base">Kredi/Banka Kartı</div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Güvenli Online Ödeme</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setForm({ ...form, paymentMethod: 'TRANSFER' })}
                    className={cn(
                      "flex flex-col gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all",
                      form.paymentMethod === 'TRANSFER'
                        ? 'bg-blue-50/50 border-blue-500 ring-4 ring-blue-500/10'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-slate-100", form.paymentMethod === 'TRANSFER' ? 'bg-white text-blue-600' : 'bg-slate-50 text-slate-400')}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", form.paymentMethod === 'TRANSFER' ? 'border-blue-600' : 'border-slate-300')}>
                        {form.paymentMethod === 'TRANSFER' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-base">Havale / EFT</div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Banka Transferi</p>
                    </div>
                  </label>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-xl text-xs text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Tüm ödemeler 256-bit SSL şifreleme ile korunmaktadır.
                </div>

                {form.paymentMethod === 'TRANSFER' && (
                  <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-400">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 font-medium flex items-start gap-3 leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Havale sonrası slip gönderimine gerek yoktur. Alıcı kısmına <strong>AYS İletişim</strong> yazınız. Siparişiniz ödeme onayından sonra işleme alınacaktır.</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bankAccounts.map((account) => (
                        <div
                          key={account.id}
                          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all group shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-slate-900 text-xs uppercase tracking-widest">{account.bankName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(account.iban);
                                toast.success('IBAN kopyalandı');
                              }}
                              className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline bg-blue-50 px-2 py-1 rounded"
                            >
                              Kopyala
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Alıcı</p>
                              <p className="text-sm text-slate-900 font-semibold">{account.accountHolder}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">IBAN</p>
                              <p className="text-sm text-slate-900 font-mono font-semibold break-all">{account.iban}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Sticky Side Column: Summary & Place Order */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
                Sipariş Özeti
                <span className="text-xs text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded-md">{items.length} Çeşit Sipariş Edilecek</span>
              </h2>

              <div className="space-y-4 max-h-[320px] overflow-y-auto px-1 custom-scrollbar mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedColor}`} className="flex gap-4 items-center group">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0 p-1 group-hover:bg-white transition-all">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500 font-medium">{item.quantity} Adet</span>
                        <span className="text-sm font-bold text-slate-900">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-6 pt-6 border-t border-slate-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 uppercase">{appliedCoupon} uygulanıyor</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs font-bold text-slate-400 hover:text-red-500">Kaldır</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="İndirim Kodu"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:bg-white focus:border-blue-500 transition-all uppercase placeholder:normal-case placeholder:font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || verifyingCoupon}
                      className="bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95"
                    >
                      {verifyingCoupon ? 'Bekleniyor...' : 'Uygula'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500 font-medium mt-2">{couponError}</p>}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Ara Toplam</span>
                  <span className="font-bold text-slate-900">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Gönderim Ücreti</span>
                  <span className="text-emerald-500 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded">ÜCRETSİZ</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-emerald-600">
                    <span>İndirim Tutarı</span>
                    <span>-{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(discountAmount)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-100 my-4" />
                <div className="flex justify-between text-lg font-black text-slate-900">
                  <span>Toplam</span>
                  <span className="text-blue-600 text-2xl tracking-tight">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalPrice - discountAmount)}</span>
                </div>
              </div>

              {/* Trust Row */}
              <div className="flex flex-wrap justify-between gap-2 mb-6 text-[10px] font-bold text-slate-500 uppercase">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  256-bit SSL
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Güvenli Ödeme
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  14 Gün İade
                </div>
              </div>

              {/* Constraints & Checkout CTA */}
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none group bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="relative flex items-center mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={contracts.distanceSalesAccepted && contracts.preInfoAccepted}
                      onChange={(e) => setContracts(prev => ({ ...prev, distanceSalesAccepted: e.target.checked, preInfoAccepted: e.target.checked }))}
                      className="peer h-5 w-5 appearance-none rounded border-2 border-slate-300 transition-all checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
                    />
                    <CheckCircle className="absolute w-3.5 h-3.5 text-white scale-0 transition-transform peer-checked:scale-100 left-0.5 pointer-events-none" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium leading-normal">
                    <a href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-blue-600 font-bold hover:underline">Şartları</a> ve <a href="/on-bilgilendirme-formu" target="_blank" className="text-blue-600 font-bold hover:underline">Sözleşmeleri</a> okudum, anladım ve onaylıyorum. <span className="text-red-500">*</span>
                  </span>
                </label>

                {/* Urgency Text */}
                <p className="text-[10px] font-bold text-red-500 text-center uppercase tracking-widest animate-pulse">
                  Siparişini tamamlamak için son adım!
                </p>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold h-14 rounded-xl transition-all shadow-lg shadow-blue-500/20 group flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Ödemeyi Tamamla</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex flex-col items-center gap-4">
                {/* Minimal Grayscale Payment Logos */}
                <div className="flex items-center gap-3 opacity-30 grayscale">
                  <div className="w-10 h-6 bg-slate-300 rounded text-[8px] font-black flex items-center justify-center text-white">VISA</div>
                  <div className="w-10 h-6 bg-slate-300 rounded text-[8px] font-black flex items-center justify-center text-white">MC</div>
                  <div className="w-10 h-6 bg-slate-300 rounded text-[8px] font-black flex items-center justify-center text-white">TROY</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA for Checkout */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOPLAM</span>
            <span className="text-xl font-black text-slate-900 leading-tight">
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              }).format(totalPrice - discountAmount)}
            </span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="flex-1 h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ödemeyi Tamamla'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>    </div>
  );
}