import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Ays İletişim - Güvenilir Teknoloji",
  description: "Sıfır ve ikinci el telefon, aksesuar ve daha fazlası. Eskiyi getir, yeniyi al.",
};

import RootLayoutClient from "@/components/RootLayoutClient";
import AuthProvider from "@/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} antialiased`}>
        <AuthProvider>
          <Providers>
            <Toaster
              position="top-right"
              theme="light"
              toastOptions={{
                className: 'border border-slate-100 shadow-2xl rounded-2xl',
                style: {
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                },
              }}
            />
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </Providers>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
