import { ReactNode } from "react";
import { cn } from "@/lib/utils"; // Assuming you have a utils file as per your project

interface AuthCardProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    className?: string;
    theme?: "dark" | "light";
}

export function AuthCard({ children, title, subtitle, className, theme = "dark" }: AuthCardProps) {
    const isDark = theme === "dark";

    return (
        <div className={cn(
            "min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden",
            isDark ? "bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#050505]" : "bg-gray-50"
        )}>
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {isDark ? (
                    <>
                        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
                        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] mix-blend-screen"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                    </>
                ) : (
                    <>
                        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] mix-blend-multiply opacity-50"></div>
                        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[140px] mix-blend-multiply opacity-50"></div>
                    </>
                )}
            </div>

            {/* Glass Card */}
            <div className={cn(
                "w-full max-w-[420px] relative z-10",
                "rounded-[2rem] shadow-2xl",
                "p-8 md:p-10",
                "flex flex-col gap-8",
                "transition-all duration-500",
                "animate-in fade-in zoom-in-95 duration-500",
                isDark
                    ? "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-black/50 hover:shadow-blue-900/10 hover:border-white/20"
                    : "bg-white/80 backdrop-blur-xl border border-white/40 shadow-gray-200/50 hover:shadow-xl hover:bg-white/90",
                className
            )}>
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className={cn(
                        "text-3xl font-black tracking-tight",
                        isDark ? "text-white drop-shadow-lg" : "text-gray-900"
                    )}>{title}</h1>
                    {subtitle && (
                        <p className={cn(
                            "text-sm font-medium tracking-wide uppercase",
                            isDark ? "text-gray-400" : "text-gray-500"
                        )}>{subtitle}</p>
                    )}
                </div>

                {/* Content */}
                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
