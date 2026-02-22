'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
    productName: string;
}

export function WhatsAppButton({ productName }: WhatsAppButtonProps) {
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [messageTemplate, setMessageTemplate] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const result = await res.json();

            if (result.success && result.data) {
                setWhatsappNumber(result.data.whatsappNumber);
                setMessageTemplate(result.data.defaultMessage);
            }
        } catch (error) {
            console.error('Settings fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = () => {
        const message = messageTemplate.replace('{productName}', productName);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    if (loading || !whatsappNumber) {
        return null;
    }

    return (
        <button
            onClick={handleClick}
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl"
        >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp ile Bilgi Al</span>
        </button>
    );
}
