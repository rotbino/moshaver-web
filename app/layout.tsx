// app/layout.tsx
import React from "react";
import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import {Providers} from "@/lib/providers/providers";
import {ArmProvider} from "@/lib/providers/ArmProvider";
import {MembershipBanner} from "@/app/components";
import {ThemeProvider} from "@/lib/providers/ThemeProvider";
import {FloatingAdminButton} from "@/app/components/FloatingAdminButton";

// ✅ تنظیم فونت وزیر با اعداد فارسی
const vazirmatn = Vazirmatn({
    subsets: ["arabic"],
    variable: "--font-vazirmatn",
    display: "swap",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "سرنخ | پلتفرم ساخت بازارهای تخصصی B2B",
    description: "پلتفرم ساخت بازارهای تخصصی عمده‌فروشی",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#610000",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fa" dir="rtl" suppressHydrationWarning>
        <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <div className="w-full mx-auto min-h-screen flex flex-col overflow-x-hidden">
            <Providers>
                <ThemeProvider>
                    <ArmProvider>
                        <MembershipBanner />
                        {children}
                        <FloatingAdminButton />
                    </ArmProvider>
                </ThemeProvider>
            </Providers>

        </div>
        </body>
        </html>
    );
}

