import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Smartphone, ArrowRightLeft, Zap, CheckCircle } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/products/ProductCard';

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage(props: Props) {
  const searchParams = await props.searchParams;
  const categorySlug = searchParams.kategori as string | undefined;

  let categoryCondition: any = {};
  let activeCategoryName = '';

  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: { children: true },
    });

    if (category) {
      activeCategoryName = category.name;
      // Filter by this category OR its children
      const categoryIds = [category.id, ...category.children.map(c => c.id)];
      categoryCondition = { categoryId: { in: categoryIds } };
    }
  }

  const rawProducts = await prisma.product.findMany({
    where: {
      stock: { gt: 0 },
      ...categoryCondition,
    },
    include: { category: true, brand: true },
    orderBy: { createdAt: 'desc' },
  });

  const products = rawProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  })) as any;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Hero Slider */}
      <section className="relative px-4 sm:px-6 pt-24 pb-12 max-w-[1440px] mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-500/5 to-transparent -z-10 blur-3xl opacity-50" />
        <HeroSlider />
      </section>

      {/* Trust & Features Section */}
      <section className="relative overflow-hidden py-20 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-2 text-sm text-blue-600 font-bold shadow-sm">
              <Zap className="w-4 h-4 text-blue-600 fill-blue-600/10" />
              Türkiye'nin Güvenilir Teknoloji Mağazası
            </span>
          </div>

          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-6">
              Modern
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent ml-3">
                Teknoloji
              </span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
              Sıfır ve ikinci el telefon, aksesuar ve daha fazlası. Test edilmiş, garantili ve Apple standartlarında güvenli alışveriş deneyimi.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-20">
            <Link
              href="/eskiyi-getir"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-1"
            >
              <ArrowRightLeft className="w-5 h-5" />
              Eskiyi Getir, Yeniyi Al
            </Link>
            <a
              href="#urunler"
              className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold px-8 py-4 rounded-2xl transition-all border border-slate-200 hover:-translate-y-1 shadow-sm"
            >
              Ürünleri Keşfet
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {['Test Edilmiş Ürünler', 'Güvenli Ödeme', 'Hızlı Teslimat', '7/24 Destek'].map((item) => (
              <div key={item} className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-slate-600 font-bold text-sm tracking-tight">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="urunler" className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {activeCategoryName ? `${activeCategoryName} Ürünleri` : 'Yeni Gelenler'}
            </h2>
            <p className="text-slate-500 font-medium">En son teknoloji ve fırsatlar sizleri bekliyor.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 text-sm font-bold border border-slate-200">
              {products.length} Ürün Bulundu
            </span>
            <Link href="/urunler" className="text-blue-600 font-bold text-sm hover:underline">Tümünü Gör →</Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
            <Smartphone className="w-20 h-20 mx-auto mb-6 text-slate-200" />
            <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Henüz ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Trade-in Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-32">
        <div className="relative bg-slate-900 rounded-[3rem] p-10 md:p-20 overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl mb-6 shadow-lg shadow-blue-600/30">
                <ArrowRightLeft className="w-4 h-4 text-white" />
                <span className="text-white font-black text-xs uppercase tracking-widest">Ays Trade-In</span>
              </div>
              <h3 className="text-white font-black text-4xl md:text-5xl mb-6 leading-tight">Eski Telefonunuzu <br /><span className="text-blue-500">Nakit Değerinde</span> Beraber Kullanalım</h3>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">Cihazınızı en iyi fiyata sayalım, hayalinizdeki yeni telefona hemen sahip olun. Formu doldurun, teklifimizi iletelim.</p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/eskiyi-getir"
                className="inline-flex items-center gap-3 bg-white hover:bg-blue-50 text-slate-900 font-black px-10 py-5 rounded-2xl transition-all shadow-2xl hover:-translate-y-1 hover:scale-105 active:scale-95"
              >
                HEMEN TEKLİF AL <ArrowRightLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Subtle patterns/decorative elements */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] -z-10" />
        </div>
      </section>

    </div>
  );
}
