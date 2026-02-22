'use client';

import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

interface Props {
    whatsappUrl: string;
    productName: string;
}

export default function WhatsAppButton({ whatsappUrl, productName }: Props) {
    const handleClick = () => {
        toast.success('WhatsApp açılıyor!', {
            description: `${productName} için mesaj hazırlandı.`,
            icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        });
        window.open(whatsappUrl, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="group relative w-full flex items-center justify-center gap-3 overflow-hidden bg-[#25D366] text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-[#25D366]/25 hover:shadow-[#25D366]/40 hover:-translate-y-0.5 active:translate-y-0"
        >
            {/* Shimmer */}
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-base">WhatsApp ile Bilgi Al</span>
        </button>
    );
}
