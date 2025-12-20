// app/layout.tsx
import React from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Head from "next/head";
import { Providers } from "@/lib/provider/providers";
import { LocalStorageInitializer } from "@/app/public/LocalStorageInitializer";

export const metadata: Metadata = {
    title: "وکیل یاب - پلتفرم ارتباط با بهترین وکلا",
    description: "پلتفرم جامع معرفی و ارتباط با وکلای متخصص در سراسر ایران. جستجو، انتخاب و رزرو وقت مشاوره با وکلای پایه یک دادگستری.",
    keywords: "وکیل, وکیل پایه یک, وکیل متخصص, مشاوره حقوقی, بهترین وکیل, رزرو وکیل, وکیل آنلاین",
    authors: [{ name: "وکیل یاب" }],
    creator: "وکیل یاب",
    publisher: "وکیل یاب",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://vakilyab.com"),
    openGraph: {
        title: "وکیل یاب - پلتفرم ارتباط با بهترین وکلا",
        description: "پلتفرم جامع معرفی و ارتباط با وکلای متخصص در سراسر ایران",
        url: "https://vakilyab.com",
        siteName: "وکیل یاب",
        locale: "fa_IR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "وکیل یاب - پلتفرم ارتباط با بهترین وکلا",
        description: "پلتفرم جامع معرفی و ارتباط با وکلای متخصص در سراسر ایران",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/images/favicon.png",
        apple: "/images/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#ca2a30",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="fa"
            dir="rtl"
            suppressHydrationWarning
            className={`${GeistSans.variable} ${GeistMono.variable}`}
        >
        <Head>
            <meta name="application-name" content="وکیل یاب" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="وکیل یاب" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="msapplication-config" content="/browserconfig.xml" />
            <meta name="msapplication-TileColor" content="#ca2a30" />
            <meta name="msapplication-tap-highlight" content="no" />
            <link rel="icon" href="/images/favicon.png" sizes="any" />
            <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        </Head>
        <body className={GeistSans.className}>
        <Providers>
            <LocalStorageInitializer />
            {children}
        </Providers>
        </body>
        </html>
    );
}