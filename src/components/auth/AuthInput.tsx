import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Mail, User, Phone, ShieldCheck } from "lucide-react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: "mail" | "lock" | "user" | "phone" | "shield";
    error?: string;
    theme?: "dark" | "light";
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
    ({ className, type, label, icon, error, theme = "dark", ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const [isFocused, setIsFocused] = useState(false);

        const isDark = theme === "dark";

        const isPassword = type === "password";
        const inputType = isPassword ? (showPassword ? "text" : "password") : type;

        const IconData = {
            mail: Mail,
            lock: Lock,
            user: User,
            phone: Phone,
            shield: ShieldCheck
        };

        const IconComponent = icon ? IconData[icon] : null;

        return (
            <div className="group relative w-full mb-5">
                <div className={cn(
                    "relative w-full transition-all duration-300",
                    isFocused ? "scale-[1.02]" : "scale-100"
                )}>
                    {/* Input Wrapper */}
                    <div className={cn(
                        "relative flex items-center w-full rounded-xl overflow-hidden transition-all duration-300 border-2",
                        isDark ? [
                            "bg-black/20",
                            error
                                ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                : isFocused
                                    ? "border-blue-500/50 bg-black/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                    : "border-white/10 hover:border-white/20"
                        ] : [
                            "bg-gray-50",
                            error
                                ? "border-red-500 shadow-red-100"
                                : isFocused
                                    ? "border-blue-600 bg-white shadow-xl shadow-blue-100 ring-4 ring-blue-50"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                        ]
                    )}>
                        {/* Icon */}
                        {IconComponent && (
                            <div className={cn(
                                "pl-4 transition-colors duration-300",
                                isDark
                                    ? "text-gray-500 group-focus-within:text-blue-400"
                                    : "text-gray-400 group-focus-within:text-blue-600"
                            )}>
                                <IconComponent className="w-5 h-5" />
                            </div>
                        )}

                        {/* Actual Input */}
                        <input
                            ref={ref}
                            type={inputType}
                            className={cn(
                                "w-full bg-transparent border-none outline-none px-4 py-4 placeholder-transparent font-bold text-sm h-14",
                                isDark ? "text-white" : "text-gray-900",
                                "autofill:bg-transparent",
                                className
                            )}
                            placeholder={label} // Required for floating label trick
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            {...props}
                            data-lpignore="true" // Ignore LastPass helper
                        />

                        {/* Floating Label */}
                        <label className={cn(
                            "absolute left-4 transition-all duration-200 pointer-events-none font-bold uppercase tracking-wider",
                            IconComponent ? "left-12" : "left-4",
                            isFocused || props.value
                                ? cn("top-2 text-[10px]", isDark ? "text-blue-400" : "text-blue-600")
                                : "top-1/2 -translate-y-1/2 text-xs text-gray-400"
                        )}>
                            {label}
                        </label>

                        {/* Password Toggle */}
                        {isPassword && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={cn(
                                    "pr-4 transition-colors focus:outline-none",
                                    isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-black"
                                )}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <p className="absolute -bottom-5 left-1 text-[10px] font-bold text-red-400 tracking-wide animate-in fade-in slide-in-from-top-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

AuthInput.displayName = "AuthInput";
