import { Smartphone, ShieldCheck, Users, Target, ArrowRightLeft } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50">

            {/* Hero Section */}
            <div className="relative py-32 bg-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight uppercase">
                        Teknolojide<br />Güvenilir Adresiniz
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        AYS İletişim olarak, kaliteli ürün ve kusursuz hizmet anlayışı ile teknolojiyi sizlerle buluşturuyoruz.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
                <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Biz Kimiz?</h2>
                        <p className="text-slate-600 text-lg font-medium leading-relaxed">
                            2010 yılından bu yana Erzincan'da faaliyet gösteren AYS İletişim, teknoloji sektöründeki yenilikleri yakından takip eden ve müşteri memnuniyetini her zaman ön planda tutan bir teknoloji mağazasıdır.
                        </p>
                        <p className="text-slate-600 text-lg font-medium leading-relaxed">
                            Sıfır ve ikinci el telefon satışı, profesyonel teknik servis hizmeti ve geniş aksesuar çeşitliliğimizle bölgenin lider teknoloji mağazası olma yolunda emin adımlarla ilerliyoruz. "Eskiyi Getir, Yeniyi Al" kampanyalarımızla teknolojiyi herkes için ulaşılabilir kılıyoruz.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                <Smartphone className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-slate-900 font-black mb-2 uppercase tracking-tight">Geniş Ürün Gamı</h3>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">En yeni model telefonlar ve aksesuarlar.</p>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h3 className="text-slate-900 font-black mb-2 uppercase tracking-tight">Güvenilir Hizmet</h3>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">Garantili satış ve şeffaf işlem süreçleri.</p>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                                <Users className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-slate-900 font-black mb-2 uppercase tracking-tight">Uzman Kadro</h3>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">Alanında deneyimli satış ve teknik ekibimiz.</p>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                                <Target className="w-7 h-7 text-orange-600" />
                            </div>
                            <h3 className="text-slate-900 font-black mb-2 uppercase tracking-tight">Müşteri Odaklılık</h3>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">%100 Müşteri memnuniyeti hedefi.</p>
                        </div>
                    </div>
                </div>

                {/* Values */}
                <div className="text-center mb-12">
                    <div className="bg-white border border-slate-200 rounded-[64px] p-12 md:p-24 shadow-2xl shadow-slate-200/50">
                        <h2 className="text-3xl font-black text-slate-900 mb-16 uppercase tracking-tight">Değerlerimiz</h2>
                        <div className="grid md:grid-cols-3 gap-16">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Dürüstlük</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">Tüm iş süreçlerimizde şeffaflık ve dürüstlük ilkesiyle hareket ederiz.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Kalite</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">Satışını yaptığımız her ürünün ve sunduğumuz her hizmetin arkasındayız.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Yenilikçilik</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">Teknoloji dünyasındaki gelişmeleri yakından takip eder ve uygularız.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
