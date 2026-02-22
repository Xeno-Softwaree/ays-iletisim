'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    linkUrl: string | null;
}

export default function HeroSlider() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch slides from public API
        fetch('/api/showcase')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSlides(data);
                }
            })
            .catch(err => console.error('Slider error:', err))
            .finally(() => setLoading(false));
    }, []);

    // Auto-play
    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [slides.length]);

    const nextSlide = () => setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrent(prev => (prev === 0 ? slides.length - 1 : prev - 1));

    if (loading) {
        return (
            <div className="w-full h-[200px] md:h-[400px] bg-gray-100 animate-pulse rounded-2xl md:rounded-[2rem]" />
        );
    }

    if (slides.length === 0) {
        return null; // Don't render anything if no slides, fallback content in page.tsx will take over visually if we structure it right, but here we'll just return null and let parent handle layout
    }

    return (
        <div className="relative w-full h-[250px] xs:h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] bg-slate-100 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden group shadow-2xl shadow-blue-500/5 border border-slate-200">

            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === current ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
                >
                    {/* Background Image */}
                    <Image
                        src={slide.imageUrl}
                        alt={slide.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 100vw"
                        priority={index === 0}
                        className="object-cover"
                    />

                    {/* Subtle Overlay for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center">
                        <div className="container mx-auto px-8 md:px-16">
                            <div className="max-w-2xl space-y-4 md:space-y-8 animate-in slide-in-from-left-12 fade-in duration-1000 ease-out">
                                <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                                    {slide.title}
                                </h2>
                                {slide.description && (
                                    <p className="text-base md:text-xl text-slate-600 font-medium md:max-w-lg leading-relaxed line-clamp-2">
                                        {slide.description}
                                    </p>
                                )}
                                {slide.linkUrl && (
                                    <Link
                                        href={slide.linkUrl}
                                        className="inline-flex items-center gap-3 bg-blue-600 text-white px-6 py-3.5 md:px-10 md:py-5 rounded-2xl text-sm md:text-base font-black hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl shadow-blue-600/25 mt-4"
                                    >
                                        Şimdi Keşfedin <ArrowRight className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-16 md:h-16 bg-white/80 hover:bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-16 md:h-16 bg-white/80 hover:bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3 p-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrent(index)}
                                className={`h-2 rounded-full transition-all duration-500 ${index === current ? 'w-10 bg-blue-600' : 'w-2 bg-slate-400/50 hover:bg-slate-600'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
