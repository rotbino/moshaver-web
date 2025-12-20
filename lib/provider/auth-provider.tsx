// lib/auth/AuthProvider.tsx

'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { RootState } from '@/lib/store/store';

interface AuthProviderProps {
    children: React.ReactNode;
    publicPaths?: string[];
    protectedRoutePrefixes?: string[];
}

export function AuthProvider({
                                 children,
                                 publicPaths = [
                                     "/",
                                     "/login",
                                     "/register",
                                     "/forgot-password",
                                     "/reset-password",
                                 ],
                                 protectedRoutePrefixes = [
                                     '/lawyer-dashboard',
                                     '/user-dashboard',
                                     '/profile',
                                     '/booking',
                                     '/messages',
                                     '/admin',
                                 ]
                             }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user);

    // اگر کاربر احراز هویت نشده و در مسیر عمومی نیست، به صفحه لاگین هدایت شود
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
        // بررسی می‌کنیم که آیا مسیر فعلی با پیشوندهای مسیرهای محافظت شده شروع می‌شود
        const isProtectedRoute = protectedRoutePrefixes.some(prefix =>
            pathname.startsWith(prefix)
        );

        // اگر مسیر محافظت شده است، به صفحه لاگین هدایت شود
        if (isProtectedRoute) {
            router.push("/login");
            return null;
        }
    }

    // اگر کاربر احراز هویت شده و در صفحه لاگین یا ثبت‌نام است، به صفحه اصلی هدایت شود
    /*if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
        router.push("/");
        return null;
    }*/

    return <>{children}</>;
}