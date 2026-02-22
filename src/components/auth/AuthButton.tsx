import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    variant?: "primary" | "secondary";
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
    ({ className, children, loading, variant = "primary", disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={loading || disabled}
                className={cn(
                    "relative w-full group overflow-hidden rounded-xl py-4 font-black tracking-widest uppercase text-sm transition-all duration-300",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed",

                    variant === "primary" && [
                        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
                        "shadow-[0_0_20px_rgba(37,99,235,0.3)]",
                        "hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:brightness-110",
                        "border border-white/10"
                    ],

                    variant === "secondary" && [
                        "bg-white/10 backdrop-blur-md text-white border border-white/10",
                        "hover:bg-white/20",
                    ],

                    className
                )}
                {...props}
            >
                <span className={cn(
                    "flex items-center justify-center gap-2 relative z-10",
                    loading && "opacity-0"
                )}>
                    {children}
                </span>

                {/* Loading Spinner Absolute Center */}
                {loading && (
                    <span className="absolute inset-0 flex items-center justify-center z-20">
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                    </span>
                )}

                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
            </button>
        );
    }
);

AuthButton.displayName = "AuthButton";
