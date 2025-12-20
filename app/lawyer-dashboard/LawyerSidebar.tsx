// app/lawyer-dashboard/LawyerSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import {
    User,
    Calendar,
    FileText,
    Clock,
    Briefcase,
    BarChart3,
    Settings,
    LogOut,
    Headphones,
    Menu,
    X,
    ArrowLeft, MessageSquare
} from "lucide-react";
import Link from "next/link";
import {useAuth} from "@/lib/data-transfer/api-hooks";


interface LawyerSidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
}

export default function LawyerSidebar({ isSidebarOpen, setIsSidebarOpen }: LawyerSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { useCurrentUser, useLogout } = useAuth();
    const currentUser = useCurrentUser();
    const logoutMutation = useLogout();

    const handleLogout = () => {
        logoutMutation.mutate();
        router.push('/');
    };

    const isActive = (href: string) => {
        return pathname === href;
    };

    const menuItems = [
        {
            title: "داشبورد",
            href: "/lawyer-dashboard",
            icon: BarChart3
        },
        {
            title: "مشاوره‌های من",
            href: "/lawyer-dashboard/consultations",
            icon: Calendar
        },
        {
            title: "سفارشات خدمات",
            href: "/lawyer-dashboard/services",
            icon: FileText
        },
        {
            title: "مدیریت مشتریان",
            href: "/lawyer-dashboard/clients",
            icon: User
        }
    ];

    const professionalTools = [
        {
            title: "ساعات کاری",
            href: "/lawyer-dashboard/schedule",
            icon: Clock
        },
        {
            title: "قیمت‌های مشاوره",
            href: "/lawyer-dashboard/pricing",
            icon: Settings
        },
        {
            title: "خدمات من",
            href: "/lawyer-dashboard/my-services",
            icon: Briefcase
        },
        {
            title: "درآمد و گزارشات",
            href: "/lawyer-dashboard/reports",
            icon: BarChart3
        },
        {
            title: "سوالات حقوقی",
            href: "/lawyer-dashboard/questions",
            icon: MessageSquare
        }
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="w-64 flex flex-col border-r bg-white">
                    <div className="p-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="font-medium">{currentUser?.name} {currentUser?.lastName}</div>
                                <span className="text-xs">
                                    پنل وکالت
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        isActive(item.href)
                                            ? "bg-orange-50 text-orange-600"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.title}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-6 pt-6 border-t">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">ابزارهای حرفه‌ای</h3>
                            <nav className="space-y-1">
                                {professionalTools.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                            isActive(item.href)
                                                ? "bg-orange-50 text-orange-600"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <Link
                                href="/lawyer-dashboard/support"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <Headphones className="w-5 h-5" />
                                تماس با پشتیبانی
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-right"
                            >
                                <LogOut className="w-5 h-5" />
                                خروج از حساب
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">پنل وکالت</h2>
                                <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="font-medium">{currentUser?.name} {currentUser?.lastName}</div>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                            isActive(item.href)
                                                ? "bg-orange-50 text-orange-600"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                        onClick={() => setIsSidebarOpen(false)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-6 pt-6 border-t">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">ابزارهای حرفه‌ای</h3>
                                <nav className="space-y-1">
                                    {professionalTools.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                                isActive(item.href)
                                                    ? "bg-orange-50 text-orange-600"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                            onClick={() => setIsSidebarOpen(false)}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            {item.title}
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <Link
                                    href="/lawyer-dashboard/support"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <Headphones className="w-5 h-5" />
                                    تماس با پشتیبانی
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-right"
                                >
                                    <LogOut className="w-5 h-5" />
                                    خروج از حساب
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}