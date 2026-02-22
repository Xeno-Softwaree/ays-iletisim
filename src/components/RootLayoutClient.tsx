'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublic = !pathname.startsWith('/admin') && !pathname.startsWith('/hesabim');
    const isAdmin = pathname.startsWith('/admin');

    return (
        <>
            {!isAdmin && (
                <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200 w-full z-50 fixed top-0" />}>
                    <Navbar />
                </Suspense>
            )}
            <main className={cn(isPublic && "pt-16")}>
                {children}
            </main>
            {!isAdmin && <Footer />}
        </>
    );
}
