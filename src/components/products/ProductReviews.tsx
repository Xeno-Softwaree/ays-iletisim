'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Star, User, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
        fullName: string | null;
        email: string;
    };
}

interface ProductReviewsProps {
    productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/products/${productId}/reviews`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            toast.error('Yorum yapmak için giriş yapmalısınız.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment }),
            });

            if (!res.ok) {
                const msg = await res.text();
                if (msg.includes('Already reviewed')) {
                    toast.error('Bu ürüne zaten yorum yaptınız.');
                } else {
                    throw new Error('Failed to submit review');
                }
                return;
            }

            toast.success('Yorumunuz başarıyla gönderildi!');
            setComment('');
            setRating(5);
            fetchReviews(); // Refresh list
        } catch (error) {
            toast.error('Yorum gönderilirken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    const hasReviewed = session && reviews.some(r => r.user.email === session.user?.email);

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    Değerlendirmeler
                    <span className="text-blue-600 text-lg opacity-40">({reviews.length})</span>
                </h2>
            </div>

            {/* Review Form */}
            {!session ? (
                <div className="bg-white border border-slate-100 rounded-[32px] p-10 text-center shadow-xl shadow-slate-200/50">
                    <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <User className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Deneyiminizi Paylaşın</h3>
                    <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">Ürünü değerlendirmek ve diğer kullanıcılara yardımcı olmak için giriş yapmalısınız.</p>
                    <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs">
                        Giriş Yap <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : hasReviewed ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-[24px] p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-emerald-900 font-black text-sm uppercase tracking-tight">TEŞEKKÜRLER!</p>
                        <p className="text-emerald-700/80 text-xs font-bold">Bu ürünü zaten değerlendirdiniz.</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[32px] p-8 lg:p-10 space-y-8 shadow-xl shadow-slate-200/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Ürünü Değerlendirin</h3>
                            <p className="text-slate-500 text-sm font-medium">Satın aldığınız ürün hakkındaki fikirleriniz bizim için değerli.</p>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            className={cn(
                                                "w-7 h-7 transition-all duration-300",
                                                star <= (hoverRating || rating)
                                                    ? "text-amber-400 fill-current drop-shadow-sm"
                                                    : "text-slate-200"
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="ml-2 text-slate-900 font-black text-base w-6 text-center">
                                {hoverRating || rating}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Yorumunuz</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Ürün hakkındaki düşünceleriniz..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-6 text-slate-900 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all min-h-[160px] resize-none shadow-inner"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-12 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10 uppercase tracking-widest text-xs"
                    >
                        {submitting ? 'GÖNDERİLİYOR...' : 'DEĞERLENDİRMEYİ YAYINLA'}
                    </button>
                </form>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Yorumlar yükleniyor...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-24 bg-white border border-slate-100 rounded-[40px] shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-slate-100">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Henüz Yorum Yapılmamış</h3>
                        <p className="text-slate-500 font-medium">Bu ürünü ilk değerlendiren siz olun!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:border-blue-100 transition-all flex flex-col h-full">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center border border-slate-100 relative group overflow-hidden">
                                            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                                            {review.user.fullName
                                                ? <span className="text-slate-900 font-black text-xl">{review.user.fullName.charAt(0).toUpperCase()}</span>
                                                : <User className="w-6 h-6 text-slate-300" />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-black text-sm uppercase tracking-tight">
                                                {review.user.fullName || 'Gizli Kullanıcı'}
                                            </p>
                                            <div className="flex gap-0.5 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            "w-3.5 h-3.5",
                                                            i < review.rating ? "text-amber-400 fill-current" : "text-slate-200"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        {new Date(review.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                {review.comment && (
                                    <div className="flex-1">
                                        <p className="text-slate-600 text-[15px] leading-relaxed font-medium italic">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
