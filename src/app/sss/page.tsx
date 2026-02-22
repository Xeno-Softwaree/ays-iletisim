'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import LegalPageShell from '@/components/LegalPageShell';

const faqs = [
    {
        q: "Siparişim ne zaman kargoya verilir?",
        a: "Saat 15:00'a kadar verilen siparişler aynı gün kargoya teslim edilir. Kargo takip numarası SMS ve e-posta ile tarafınıza iletilir."
    },
    {
        q: "Hangi kargo firmalarıyla çalışıyorsunuz?",
        a: "Yurtiçi Kargo ve Aras Kargo ile anlaşmamız bulunmaktadır. Teslimat adresinize göre size en uygun firmayı seçebilirsiniz."
    },
    {
        q: "Kapıda ödeme var mı?",
        a: "Şu an için kapıda ödeme seçeneğimiz bulunmamaktadır. Kredi kartı veya Havale/EFT ile güvenli ödeme yapabilirsiniz."
    },
    {
        q: "Eskiyi Getir kampanyası nasıl çalışır?",
        a: "Eski cihazınızın modelini ve durumunu 'Eskiyi Getir' sayfasından seçerek tahmini fiyat alabilir, cihazınızı bize gönderdikten sonra netleşen tutarı yeni telefon alımında indirim olarak kullanabilirsiniz."
    },
    {
        q: "Ürünler garantili mi?",
        a: "Satışını yaptığımız tüm sıfır ürünler 2 yıl Türkiye garantilidir. İkinci el ürünler ise AYS İletişim güvencesiyle 6 ay veya 1 yıl garantili olarak satılmaktadır."
    },
    {
        q: "İade süreci nasıldır?",
        a: "Satın aldığınız ürünü, teslim tarihinden itibaren 14 gün içinde, kullanılmamış olması şartıyla iade edebilirsiniz. Detaylı bilgi için İade ve Değişim sayfasını inceleyebilirsiniz."
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dynamic-pages/sss')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data.content) {
                    try {
                        const parsed = JSON.parse(data.data.content);
                        setFaqs(Array.isArray(parsed) ? parsed : []);
                    } catch (e) {
                        setFaqs([]);
                    }
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <LegalPageShell title="Sıkça Sorulan Sorular">
            <div className="space-y-4 -mt-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className={`bg-white border rounded-3xl transition-all duration-300 ${openIndex === index ? 'border-blue-500/20 shadow-xl shadow-blue-500/5' : 'border-slate-100'}`}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
                        >
                            <span className={`font-bold transition-colors duration-300 ${openIndex === index ? 'text-blue-600' : 'text-slate-900'}`}>
                                {faq.q}
                            </span>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </button>

                        <div
                            className={`transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 invisible overflow-hidden'}`}
                        >
                            <div className="px-6 md:px-8 pb-8 pt-0 text-slate-500 font-medium leading-relaxed">
                                <div className="h-px w-full bg-slate-50 mb-6" />
                                {faq.a}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </LegalPageShell>
    );
}
