'use client';

import { Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ContactInfo {
    address: string;
    phone: string;
    email: string;
    mapEmbedUrl: string;
}

const defaultInfo: ContactInfo = {
    address: 'Ordu Caddesi No:12/B\nMerkez, Erzincan',
    phone: '+90 555 123 45 67',
    email: 'info@aysiletisim.com',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3056.666993685655!2d39.4895!3d39.7500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDQ1JzAwLjAiTiAzOcKwMjknMjIuMiJF!5e0!3m2!1str!2str!4v1635789000000!5m2!1str!2str',
};

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultInfo);
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    useEffect(() => {
        fetch('/api/admin/contact')
            .then(r => r.json())
            .then(result => {
                if (result.success && result.data) {
                    setContactInfo(result.data);
                }
            })
            .catch(() => {/* use defaults */ });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
        setForm({ name: '', email: '', subject: '', message: '' });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">İletişim</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                        Sorularınız, önerileriniz veya teknik destek talepleriniz için bize ulaşın.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-sm">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">İletişim Bilgileri</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 font-bold mb-1">Adres</h3>
                                        <p className="text-slate-500 text-sm font-medium whitespace-pre-line leading-relaxed">
                                            {contactInfo.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 font-bold mb-1">Telefon</h3>
                                        <a
                                            href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                                            className="text-slate-500 text-sm font-medium hover:text-emerald-600 transition-colors"
                                        >
                                            {contactInfo.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 font-bold mb-1">E-posta</h3>
                                        <a
                                            href={`mailto:${contactInfo.email}`}
                                            className="text-slate-500 text-sm font-medium hover:text-purple-600 transition-colors"
                                        >
                                            {contactInfo.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="h-64 bg-white border border-slate-200 rounded-[32px] overflow-hidden relative group shadow-sm">
                            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                                <span className="text-slate-300 font-bold uppercase tracking-widest text-xs">Harita Yükleniyor...</span>
                            </div>
                            {contactInfo.mapEmbedUrl && (
                                <iframe
                                    src={contactInfo.mapEmbedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    className="opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"
                                    title="Konum Haritası"
                                />
                            )}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-sm">
                        <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Bize Yazın</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adınız Soyadınız</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:border-blue-600 focus:bg-white outline-none transition-all"
                                    placeholder="Ad Soyad"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-posta Adresi</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:border-blue-600 focus:bg-white outline-none transition-all"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Konu</label>
                                <input
                                    type="text"
                                    required
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:border-blue-600 focus:bg-white outline-none transition-all"
                                    placeholder="Mesajınızın konusu"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mesajınız</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:border-blue-600 focus:bg-white outline-none transition-all resize-none"
                                    placeholder="Size nasıl yardımcı olabiliriz?"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="uppercase tracking-widest text-xs">Gönderiliyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="uppercase tracking-widest text-xs">MESAJ GÖNDER</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
