'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { sanitize } from '@/lib/sanitize';
import LegalPageShell from '@/components/LegalPageShell';

export default function DistanceSalesPage() {
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dynamic-pages/mesafeli-satis-sozlesmesi')
            .then(res => res.json())
            .then(data => {
                if (data.success) setPage(data.data);
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
        <LegalPageShell title={page?.title || 'Mesafeli Satış Sözleşmesi'}>
            <div
                dangerouslySetInnerHTML={{ __html: sanitize(page?.content || '') }}
            />
        </LegalPageShell>
    );
}
