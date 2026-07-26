// app/admin/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import Link from 'next/link';
import {
    LayoutDashboard,
    Store,
    Ruler,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Building2,
    Tags,
    CreditCard,
    BarChart3,
    Menu,
    X,
    Activity,
    Users,
    Database,
    Globe,
    MapPin,
    Package,
    DollarSign,
    Receipt,
    TrendingUp,
    ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuGroup {
    label: string;
    icon: any;
    items: { href: string; label: string; icon: any }[];
}

const menuGroups: MenuGroup[] = [
    {
        label: 'اصلی',
        icon: LayoutDashboard,
        items: [
            { href: '/admin', label: 'داشبورد', icon: LayoutDashboard },
            { href: '/admin/users', label: 'کاربران', icon: Users },
        ],
    },
    {
        label: 'بازارها',
        icon: Store,
        items: [
            { href: '/admin/arm', label: 'همه بازارها', icon: Globe },
            { href: '/admin/arm/create', label: 'ساخت بازار جدید', icon: Building2 },
            { href: '/admin/ads', label: 'آگهی‌ها', icon: Package },
        ],
    },
    {
        label: 'مالی',
        icon: DollarSign,
        items: [
            { href: '/admin/credits', label: 'اعتبارات فروخته شده', icon: TrendingUp },
            { href: '/admin/payments', label: 'پرداخت‌ها', icon: Receipt },
            { href: '/admin/analytics', label: 'داشبورد گزارش مالی', icon: BarChart3 },
        ],
    },
    {
        label: 'اطلاعات پایه',
        icon: Database,
        items: [
            { href: '/admin/categories', label: 'گروه‌های کالا', icon: Tags },
            { href: '/admin/units', label: 'واحدهای اندازه‌گیری', icon: Ruler },
            { href: '/admin/industries', label: 'صنوف', icon: Users },
            { href: '/admin/activities', label: 'فعالیت‌ها', icon: Activity },
            { href: '/admin/locations', label: 'مناطق جغرافیایی', icon: MapPin },
        ],
    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    useEffect(() => {
        if (pathname.startsWith('/admin/login')) { setIsLoading(false); return; }
        if (!isAuthenticated || !user) { router.replace('/admin/login'); setIsLoading(false); return; }
        if (user.role !== 'admin' && user.role !== 'arm_manager') { router.replace('/admin/login'); setIsLoading(false); return; }
        setIsLoading(false);
    }, [isAuthenticated, user, router, pathname]);

    useEffect(() => { setIsMobileOpen(false); }, [pathname]);

    useEffect(() => {
        const activeGroup = menuGroups.find(g => g.items.some(item => pathname?.startsWith(item.href)));
        if (activeGroup) setExpandedGroup(activeGroup.label);
    }, [pathname]);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname?.startsWith(href);
    };

    const isGroupActive = (group: MenuGroup) => group.items.some(item => isActive(item.href));

    const toggleGroup = (label: string) => {
        setExpandedGroup(prev => prev === label ? null : label);
    };

    if (pathname.startsWith('/admin/login')) return <>{children}</>;
    if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'arm_manager')) return null;
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
    );

    // app/admin/layout.tsx
// فقط بخش renderMenu رو با این جایگزین کن:

    const renderMenu = (onClick?: () => void) => (
        <>
            {menuGroups.map((group) => {
                const isExpanded = expandedGroup === group.label || isCollapsed;
                const isActiveGrp = isGroupActive(group);

                return (
                    <div key={group.label} className="space-y-0.5">
                        {/* عنوان گروه - برجسته و تیره */}
                        <button
                            onClick={() => !isCollapsed && toggleGroup(group.label)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                isActiveGrp
                                    ? 'bg-primary/10 text-primary shadow-sm'
                                    : 'text-on-surface hover:bg-surface-container-high',
                                isCollapsed && 'justify-center'
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                isActiveGrp ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                            )}>
                                <group.icon className="w-4 h-4" />
                            </div>
                            {!isCollapsed && (
                                <>
                                <span className="text-[13px] font-bold flex-1 text-right leading-none">
                                    {group.label}
                                </span>
                                    <span className={cn(
                                        "w-5 h-5 flex items-center justify-center rounded transition-all",
                                        isExpanded && "bg-surface-container-high"
                                    )}>
                                    <ChevronLeft className={cn(
                                        "w-3.5 h-3.5 transition-transform duration-200",
                                        isExpanded && "-rotate-90"
                                    )} />
                                </span>
                                </>
                            )}
                        </button>

                        {/* زیرمنو - کاملاً متمایز با پس‌زمینه روشن‌تر */}
                        <div className={cn(
                            "grid transition-all duration-200 overflow-hidden",
                            isExpanded ? "grid-rows-[1fr] opacity-100 mt-0.5" : "grid-rows-[0fr] opacity-0"
                        )}>
                            <div className="overflow-hidden">
                                <div className={cn(
                                    "bg-white rounded-xl  py-1 px-1",
                                    !isCollapsed && "border border-outline-variant/20"
                                )}>
                                    {group.items.map((item) => {
                                        const active = isActive(item.href);
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={onClick}
                                                className={cn(
                                                    "flex items-center gap-2.5 px-2.5 py-3 pr-8 rounded-lg transition-all duration-200 group",
                                                    active
                                                        ? 'bg-white shadow-sm text-primary font-medium border border-outline-variant/30'
                                                        : 'text-on-surface-variant/80 hover:text-on-surface hover:bg-white/60',
                                                    isCollapsed && 'justify-center'
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "w-3.5 h-3.5 flex-shrink-0",
                                                    active ? 'text-primary' : 'text-on-surface-variant/50 group-hover:text-on-surface-variant'
                                                )} />
                                                {!isCollapsed && (
                                                    <span className="text-[12px] leading-none">{item.label}</span>
                                                )}
                                                {active && !isCollapsed && (
                                                    <span className="mr-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            <div className="border-t border-outline-variant/30 my-3" />

            <Link
                href="/admin/settings"
                onClick={onClick}
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive('/admin/settings')
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface hover:bg-surface-container-high',
                    isCollapsed && 'justify-center'
                )}
            >
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isActive('/admin/settings') ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                )}>
                    <Settings className="w-4 h-4" />
                </div>
                {!isCollapsed && <span className="text-[13px] font-bold">تنظیمات سیستم</span>}
            </Link>

            <button
                onClick={() => { localStorage.removeItem('accessToken'); window.location.href = '/admin/login'; }}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-error/60 hover:bg-error/5 hover:text-error mt-1",
                    isCollapsed && 'justify-center'
                )}
            >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-error/5 text-error/50">
                    <LogOut className="w-4 h-4" />
                </div>
                {!isCollapsed && <span className="text-[13px] font-medium">خروج</span>}
            </button>
        </>
    );

    return (
        <div className="min-h-screen flex bg-background">
            <aside className={cn(
                "hidden lg:flex flex-col fixed top-0 right-0 h-full bg-surface border-l border-outline-variant/50 transition-all duration-300 z-50",
                isCollapsed ? 'w-20' : 'w-72'
            )}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-outline-variant/50 flex-shrink-0 bg-surface/80 backdrop-blur-sm">
                    {!isCollapsed && (
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-white font-bold text-sm">س</span>
                            </div>
                            <span className="font-bold text-lg text-primary tracking-tight">سرنخ</span>
                            <span className="text-[10px] text-on-surface-variant/50 bg-surface-container-high px-2 py-0.5 rounded-full">ادمین</span>
                        </Link>
                    )}
                    <button onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors">
                        {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
                <nav className="p-3 space-y-1.5 overflow-y-auto flex-1">
                    {renderMenu()}
                </nav>
            </aside>

            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-sm border-b border-outline-variant/50 px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-xs">س</span>
                    </div>
                    <span className="font-bold text-base text-primary">سرنخ | ادمین</span>
                </div>
                <button onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {isMobileOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileOpen(false)} />
                    <div className="lg:hidden fixed top-0 right-0 h-full w-72 bg-surface z-50 shadow-2xl overflow-y-auto">
                        <div className="flex items-center justify-between h-14 px-4 border-b">
                            <span className="font-bold text-base text-primary">منو</span>
                            <button onClick={() => setIsMobileOpen(false)} className="p-1.5 hover:bg-surface-container-high rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="p-3 space-y-1.5">
                            {renderMenu(() => setIsMobileOpen(false))}
                        </nav>
                    </div>
                </>
            )}

            <main className={cn("flex-1 transition-all duration-300 pt-14 lg:pt-0", isCollapsed ? 'lg:mr-20' : 'lg:mr-72')}>
                {children}
            </main>
        </div>
    );
}