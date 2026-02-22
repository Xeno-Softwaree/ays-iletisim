'use client';

import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';

interface LegalPageShellProps {
    title: string;
    children: ReactNode;
}

export default function LegalPageShell({ title, children }: LegalPageShellProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 md:py-32">
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-blue-500/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-12 tracking-tight border-b border-slate-50 pb-8 uppercase">
                        {title}
                    </h1>

                    <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-500 prose-p:font-medium prose-p:leading-relaxed prose-strong:text-slate-900 prose-strong:font-bold prose-li:text-slate-500 prose-li:font-medium">
                        {children}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">
                        Ays İletişim Güvencesiyle
                    </p>
                </div>
            </div>
        </div>
    );
}
