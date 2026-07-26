// app/arm-admin/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import Link from 'next/link';
import {
    LayoutDashboard,
    CreditCard,
    Users,
    Package,
    Settings,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Menu,
    X,
    Home,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';


const menuItems = [
    { href: '/arm-admin', label: 'داشبورد', icon: LayoutDashboard },
    { href: '/arm-admin/financial', label: 'مالی', icon: CreditCard },
   /* { href: '/arm-admin/settings/payments', label: 'تنظیمات پرداخت', icon: Settings },*/
    { href: '/arm-admin/members', label: 'مدیریت اعضا', icon: Users },
    { href: '/arm-admin/settings', label: 'تنظیمات بازار', icon: Settings },
];

export default function ArmAdminLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { currentSlug, currentArm } = useSelector((state: RootState) => state.arm);

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ============================================================
    // ✅ بررسی دسترسی مدیر بازار
    // ============================================================
    useEffect(() => {
        const checkAuthorization = async () => {
            if (!isAuthenticated || !user) {
                router.push(`/login?redirect=/arm-admin`);
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            if (!currentSlug) {
                toast.error('هیچ بازویی انتخاب نشده است');
                router.push('/');
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            try {
                const arms = await apiService.arm.getUserArms();
                const isAdmin = arms.some(
                    (a: any) => a.slug === currentSlug && a.role === 'admin'
                );

                if (!isAdmin) {
                    toast.error('شما دسترسی به پنل مدیریت این بازار را ندارید');
                    router.push(`/${currentSlug}`);
                    setIsAuthorized(false);
                    setIsLoading(false);
                    return;
                }

                setIsAuthorized(true);
            } catch (error: any) {
                console.error('Error checking authorization:', error);
                toast.error('خطا در بررسی دسترسی');
                router.push(`/${currentSlug}`);
                setIsAuthorized(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthorization();
    }, [isAuthenticated, user, currentSlug, router]);

    // ============================================================
    // ✅ بستن منوی موبایل
    // ============================================================
    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    // ============================================================
    // ✅ بررسی فعال بودن مسیر
    // ============================================================
    const isActive = (href: string) => {
        if (href === '/arm-admin') return pathname === '/arm-admin';
        return pathname===href+"/"
    };

    // ============================================================
    // ✅ در حال بارگذاری
    // ============================================================
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-on-surface-variant">در حال بررسی دسترسی...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    // ============================================================
    // ✅ رندر اصلی
    // ============================================================
    return (
        <div className="min-h-screen flex bg-surface">
            {/* سایدبار دسکتاپ */}
            <aside
                className={`hidden lg:block fixed top-0 right-0 h-full bg-surface-container-low border-l border-outline-variant transition-all duration-300 z-50 overflow-y-auto ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-outline-variant sticky top-0 bg-surface-container-low z-10">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary">مدیریت بازار</span>
                            <span className="text-xs text-on-surface-variant">| {currentArm?.name || currentSlug}</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                        )}
                    </button>
                </div>

                <nav className="p-3 space-y-1">
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                    active
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'flex-shrink-0'}`} />
                                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}

                    <div className="border-t border-outline-variant my-3" />

                    <Link
                        href={`/${currentSlug}`}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface ${
                            isCollapsed ? 'justify-center' : ''
                        }`}
                    >
                        <Home className="w-5 h-5" />
                        {!isCollapsed && <span className="text-sm font-medium">بازگشت به بازار</span>}
                    </Link>

                    <button
                        onClick={() => router.push(`/${currentSlug}`)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-error hover:bg-error/10 ${
                            isCollapsed ? 'justify-center' : ''
                        }`}
                    >
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span className="text-sm font-medium">خروج</span>}
                    </button>
                </nav>
            </aside>

            {/* منوی موبایل */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface border-b border-outline-variant px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">مدیریت بازار</span>
                    <span className="text-xs text-on-surface-variant">| {currentArm?.name || currentSlug}</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
                >
                    {isMobileMenuOpen ? (
                        <X className="w-6 h-6 text-on-surface" />
                    ) : (
                        <Menu className="w-6 h-6 text-on-surface" />
                    )}
                </button>
            </div>

            {isMobileMenuOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="lg:hidden fixed top-0 left-0 h-full w-72 bg-surface z-50 shadow-xl overflow-y-auto">
                        <div className="flex items-center justify-between h-16 px-4 border-b border-outline-variant">
                            <span className="text-sm font-bold text-primary">پنل مدیریت</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-on-surface" />
                            </button>
                        </div>

                        <nav className="p-3 space-y-1">
                            {menuItems.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={handleLinkClick}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                            active
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}

                            <div className="border-t border-outline-variant my-3" />

                            <Link
                                href={`/${currentSlug}`}
                                onClick={handleLinkClick}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                            >
                                <Home className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">بازگشت به بازار</span>
                            </Link>

                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    router.push(`/${currentSlug}`);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-error hover:bg-error/10"
                            >
                                <LogOut className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">خروج</span>
                            </button>
                        </nav>
                    </div>
                </>
            )}

            {/* محتوای اصلی */}
            <main
                className={`flex-1 transition-all duration-300 pt-16 lg:pt-0 ${
                    isCollapsed ? 'lg:mr-20' : 'lg:mr-64'
                }`}
            >
                <div className="p-4 md:p-6 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}