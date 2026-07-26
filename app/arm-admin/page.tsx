// app/arm-admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
    Users,
    Package,
    CreditCard,
    TrendingUp,
    CheckCircle,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';

interface DashboardStats {
    totalMembers: number;
    activeMembers: number;
    totalAds: number;
    activeAds: number;
    pendingPayments: number;
    totalCredits: number;
}

export default function ArmAdminDashboard() {
    const { currentSlug, currentArm } = useSelector((state: RootState) => state.arm);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ============================================================
    // ✅ واکشی آمار از بک‌اند (ترکیب دو API)
    // ============================================================
    useEffect(() => {
        const fetchStats = async () => {
            if (!currentSlug) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // ✅ ۱. دریافت آمار بازو (اعضا، آگهی‌ها) - از armAdmin
                const armStats = await apiService.armAdmin.getStats(currentSlug);

                // ✅ ۲. دریافت آمار مالی (فیش‌ها، اعتبارات) - از credit
                const financialStats = await apiService.credit.getArmFinancialStats(currentSlug);

                setStats({
                    totalMembers: armStats.totalMembers || 0,
                    activeMembers: armStats.activeMembers || 0,
                    totalAds: armStats.totalAds || 0,
                    activeAds: armStats.activeAds || 0,
                    pendingPayments: financialStats.pendingPayments || 0,
                    totalCredits: financialStats.totalCredits || 0,
                });
            } catch (error: any) {
                console.error('Error fetching stats:', error);
                setError(error?.message || 'خطا در دریافت آمار');
                toast.error(error?.message || 'خطا در دریافت آمار');

                setStats({
                    totalMembers: 0,
                    activeMembers: 0,
                    totalAds: 0,
                    activeAds: 0,
                    pendingPayments: 0,
                    totalCredits: 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [currentSlug]);

    // ============================================================
    // ✅ کارت‌های آمار
    // ============================================================
    const statCards = [
        {
            title: 'کل اعضا',
            value: stats?.totalMembers || 0,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            title: 'اعضای فعال',
            value: stats?.activeMembers || 0,
            icon: Users,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
        },
        {
            title: 'کل آگهی‌ها',
            value: stats?.totalAds || 0,
            icon: Package,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
        },
        {
            title: 'آگهی‌های فعال',
            value: stats?.activeAds || 0,
            icon: Package,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            title: 'فیش‌های در انتظار',
            value: stats?.pendingPayments || 0,
            icon: CreditCard,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
        },
        {
            title: 'کل اعتبارات فروخته شده',
            value: stats?.totalCredits || 0,
            icon: TrendingUp,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
        },
    ];

    // ============================================================
    // ✅ در حال بارگذاری
    // ============================================================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-on-surface-variant">در حال بارگذاری آمار...</p>
                </div>
            </div>
        );
    }

    // ============================================================
    // ✅ رندر اصلی
    // ============================================================
    return (
        <div>
            {/* هدر */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">داشبورد مدیریت</h1>
                    <p className="text-sm text-on-surface-variant">
                        {currentArm?.name || currentSlug} | خلاصه وضعیت بازار
                    </p>
                </div>
                <span className="text-xs text-on-surface-variant">
                    {new Date().toLocaleDateString('fa-IR')}
                </span>
            </div>

            {/* کارت‌های آماری */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`p-2 rounded-lg ${card.bg}`}>
                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <span className="text-2xl font-bold text-on-surface">
                                    {card.value.toLocaleString('fa-IR')}
                                </span>
                            </div>
                            <p className="text-sm text-on-surface-variant mt-2">{card.title}</p>
                        </div>
                    );
                })}
            </div>

            {/* لینک‌های سریع */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Link
                    href="/arm-admin/financial/verify"
                    className="bg-primary/5 border border-primary/20 p-4 rounded-xl hover:bg-primary/10 transition-colors group"
                >
                    <h3 className="font-semibold text-primary">مدیریت فیش‌ها</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                        {stats?.pendingPayments || 0} فیش در انتظار بررسی
                    </p>
                    <span className="inline-block mt-3 text-sm text-primary group-hover:underline">
                        مشاهده و بررسی →
                    </span>
                </Link>

                <Link
                    href="/arm-admin/members"
                    className="bg-surface-container-low border border-outline-variant p-4 rounded-xl hover:bg-surface-container transition-colors group"
                >
                    <h3 className="font-semibold text-on-surface">مدیریت اعضا</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                        {stats?.totalMembers || 0} عضو در بازار
                    </p>
                    <span className="inline-block mt-3 text-sm text-primary group-hover:underline">
                        مدیریت اعضا →
                    </span>
                </Link>
            </div>

            {/* آخرین فعالیت‌ها */}
            <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl">
                <h2 className="text-lg font-semibold text-on-surface mb-4">آخرین فعالیت‌ها</h2>
                <p className="text-sm text-on-surface-variant">هیچ فعالیتی ثبت نشده است</p>
            </div>
        </div>
    );
}