'use client';

import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FavoriteButtonProps {
    productId: string;
    initialIsFavorite?: boolean;
    className?: string;
    iconSize?: number;
}

export default function FavoriteButton({
    productId,
    initialIsFavorite = false,
    className = "",
    iconSize = 20
}: FavoriteButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);

    // Sync with initial prop if it changes (e.g. from SWR/React Query revalidation)
    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to product detail
        e.stopPropagation();

        if (!session) {
            toast.error('Favorilere eklemek için giriş yapmalısınız.');
            router.push('/login');
            return;
        }

        // Optimistic UI update
        const previousState = isFavorite;
        setIsFavorite(!isFavorite);
        setLoading(true);

        try {
            const res = await fetch('/api/user/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });

            if (!res.ok) throw new Error('Failed to toggle favorite');

            const data = await res.json();
            setIsFavorite(data.isFavorite);

            if (data.isFavorite) {
                toast.success('Ürün favorilere eklendi');
            } else {
                toast.success('Ürün favorilerden çıkarıldı');
            }
        } catch (error) {
            setIsFavorite(previousState); // Revert on error
            toast.error('Bir hata oluştu, lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center justify-center transition-all ${isFavorite ? 'text-red-500' : 'text-white/40 hover:text-red-400'} ${className}`}
            title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        >
            <Heart
                size={iconSize}
                className={`transition-all ${isFavorite ? 'fill-current scale-110' : 'scale-100'}`}
            />
        </button>
    );
}
