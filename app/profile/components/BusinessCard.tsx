// app/profile/components/BusinessCard.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Edit, BadgeCheck, Clock, XCircle, Shield, MapPin, Phone, Building2 } from 'lucide-react';
import { getApiUrl } from '@/lib/api/apiRequest';
import { cn } from '@/lib/utils';

interface BusinessCardProps {
    business: any;
    completionPercentage: number;
    isComplete: boolean;
    isPending: boolean;
    isRejected: boolean;
    hasApprovedTier: boolean;
    currentTier: string;
    canRequestInitial: boolean;
    canUpgrade: boolean;
    isGold: boolean;
    totalAds: number;
    activeAds: number;
    expiredAds: number;
    onVerificationClick: () => void;
}

export default function BusinessCard({
                                         business,
                                         isComplete,
                                         isPending,
                                         isRejected,
                                         hasApprovedTier,
                                         currentTier,
                                         canRequestInitial,
                                         canUpgrade,
                                         isGold,
                                         totalAds,
                                         activeAds,
                                         expiredAds,
                                         onVerificationClick,
                                     }: BusinessCardProps) {
    const router = useRouter();
    const logoUrl = business?.logoUrl ? getApiUrl(`/file/${business.logoUrl}`) : null;

    const tierColor =
        currentTier === 'gold' ? 'text-yellow-500 dark:text-yellow-400' :
            currentTier === 'silver' ? 'text-blue-500 dark:text-blue-400' :
                currentTier === 'blue' ? 'text-gray-400 dark:text-gray-300' : '';

    const tierLabel =
        currentTier === 'gold' ? 'طلایی' :
            currentTier === 'silver' ? 'نقره‌ای' :
                currentTier === 'blue' ? 'آبی' : '';

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-outline-variant/50 dark:border-gray-700 p-5 shadow-sm">
            {/* بخش بالایی: لوگو + دکمه ویرایش (چپ) | نام + تیک + موقعیت (راست) */}
            <div className="flex items-start gap-2">
                {/* ستون چپ: لوگو + دکمه ویرایش */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-surface-container-high dark:bg-gray-800 border border-outline dark:border-gray-700 flex items-center justify-center overflow-hidden">
                        {logoUrl ? (
                            <img src={logoUrl} alt={business.name} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-8 h-8 text-primary" />
                        )}
                    </div>
                    <button
                        onClick={() => router.push(`/business/edit/${business.id}`)}
                        className="flex items-center justify-center gap-1.5 w-full min-w-[70px] px-2 py-2 bg-primary/15 dark:bg-primary/25 text-primary dark:text-primary-300 rounded-lg text-xs font-semibold border border-primary/30 dark:border-primary/40 hover:bg-primary/20 dark:hover:bg-primary/30 active:scale-95 transition-all"
                    >
                        <Edit className="w-4 h-4" />
                        <span>ویرایش</span>
                    </button>
                </div>

                {/* ستون راست: نام، تیک، موقعیت */}
                <div className="flex-1 min-w-0">
                    {/* خط اول: عنوان (راست) ← space-between → تیک اعتماد (چپ) */}
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-semibold text-on-surface dark:text-gray-100 truncate">
                            {business.name}
                        </h2>
                        {hasApprovedTier && (
                            <span className={cn("flex items-center gap-1 text-xs font-medium flex-shrink-0", tierColor)}>
                                <BadgeCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">{tierLabel}</span>
                            </span>
                        )}
                    </div>
                    {/* خط دوم: شهر و تلفن */}
                    <div className="flex items-center gap-3 mt-1 text-sm text-on-surface-variant dark:text-gray-400">
                        {business.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{business.city}</span>}
                        {business.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{business.phone}</span>}
                    </div>
                </div>
            </div>

            {/* وضعیت‌های دیگر (بدون border) */}
            {isPending && (
                <div className="mt-3 flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                    <Clock className="w-4 h-4" />
                    <span>در انتظار دریافت تیک</span>
                </div>
            )}
            {isRejected && (
                <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span>درخواست شما رد شد</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant dark:text-gray-400">
                        {business.latestVerification?.notes ? `دلیل: ${business.latestVerification.notes}` : 'با پشتیبان خود تماس بگیرید.(09196421264).'}
                    </p>
                    <button onClick={onVerificationClick} className="text-[10px] font-medium text-primary hover:underline">
                        ارسال مجدد
                    </button>
                </div>
            )}
            {canRequestInitial && (
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-on-surface dark:text-gray-200">
                        <Shield className="w-4 h-4 text-primary" />
                        <span>اطلاعات شما کامل است</span>
                    </div>
                    <button onClick={onVerificationClick} className="text-[10px] font-medium bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                        دریافت تیک اعتماد
                    </button>
                </div>
            )}

            {/* آمار */}
            <div className="grid grid-cols-3 gap-4 mt-2 pt-4 border-t border-outline-variant/50 dark:border-gray-700">
                {[
                    { value: totalAds, label: 'کل آگهی‌ها', color: 'text-primary' },
                    { value: activeAds, label: 'فعال', color: 'text-green-600 dark:text-green-400' },
                    { value: expiredAds, label: 'منقضی', color: 'text-warning' },
                ].map(s => (
                    <div key={s.label} className="text-center">
                        <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                        <p className="text-[10px] text-on-surface-variant dark:text-gray-400">{s.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}