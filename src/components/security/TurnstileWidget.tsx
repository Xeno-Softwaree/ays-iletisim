"use client";

import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
    onToken: (token: string | null) => void;
    action: "login" | "register" | "forgot-password" | "reset-password" | "trade-in" | "checkout";
    theme?: "light" | "dark";
}

export function TurnstileWidget({ onToken, action, theme = "light" }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Function to render the widget once the script is loaded
        const renderWidget = () => {
            if (window.turnstile && containerRef.current) {
                // Clear any existing widgets in the container before rendering just in case
                containerRef.current.innerHTML = "";
                window.turnstile.render(containerRef.current, {
                    sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
                    action: action,
                    theme: theme,
                    callback: (token: string) => {
                        onToken(token);
                    },
                    "error-callback": () => {
                        onToken(null);
                    },
                    "expired-callback": () => {
                        onToken(null);
                    },
                });
            }
        };

        // Check if script is already loaded
        if (!document.getElementById("turnstile-script")) {
            const script = document.createElement("script");
            script.id = "turnstile-script";
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            // Define global callback
            (window as any).onloadTurnstileCallback = renderWidget;
        } else if (window.turnstile) {
            renderWidget();
        }

        return () => {
            // Cleanup on unmount
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
            onToken(null);
        };
    }, [action, onToken, theme]);

    return (
        <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden flex justify-center p-2 bg-slate-50">
            <div ref={containerRef} className="cf-turnstile"></div>
        </div>
    );
}

// Ensure TypeScript knows about window.turnstile
declare global {
    interface Window {
        turnstile?: any;
    }
}
