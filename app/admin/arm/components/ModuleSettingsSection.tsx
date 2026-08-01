// app/admin/arm/components/ModuleSettingsSection.tsx
'use client';

import React, { useState } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Save, Loader2, Check, Eye, Phone, Shield, Star, Clock, Package, TrendingUp, ShoppingCart, Lock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleSettingsSectionProps {
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    onSave?: () => void;
    isSaving?: boolean;
    moduleKey: string;
    moduleName: string;
    isAdmin?: boolean;
}

const moduleConfigs: Record<string, { title: string; icon: any; rules: any[] }> = {
    priceTable: {
        title: 'تابلوی قیمت',
        icon: TrendingUp,
        rules: [
            { key: 'requireLoginToViewPrices', label: 'مشاهده قیمت فقط برای اعضای سایت', hint: 'کاربر مهمان قیمت‌ها را نمی‌بیند', icon: Eye },
            { key: 'requireMembershipToViewPrices', label: 'عضویت در بازار برای مشاهده قیمت', hint: 'تا عضو بازار نشده قیمت مخفی است', icon: Shield },
            { key: 'requireMembershipToCall', label: 'تماس فقط برای اعضای بازار', hint: 'دکمه تماس فقط برای اعضا فعال است', icon: Phone },
            { key: 'allowAnonymousPublishing', label: 'انتشار ناشناس آگهی', hint: 'فروشنده بدون نمایش نام کسب‌وکار آگهی دهد', icon: Shield },
            { key: 'autoApproveAds', label: 'تأیید خودکار آگهی‌ها', hint: 'آگهی بدون بررسی مدیر منتشر شود', icon: Check },
            { key: 'maxFreeAdsPerMonth', label: 'سهمیه آگهی رایگان', icon: Star, isNumber: true, min: 0, max: 1000, suffix: 'عدد' },
            { key: 'adValidityDefaultHours', label: 'اعتبار پیش‌فرض آگهی', icon: Clock, isNumber: true, min: 1, max: 240, suffix: 'ساعت' },
            { key: 'maxActiveAdsPerUser', label: 'حداکثر آگهی فعال', icon: Package, isNumber: true, min: 0, max: 100, suffix: 'عدد' },
            { key: 'bumpCost', label: 'هزینه نردبان', icon: TrendingUp, isNumber: true, min: 0, max: 10000, suffix: 'اعتبار' },
        ],
    },
    buyLead: {
        title: 'تابلوی درخواست خرید',
        icon: ShoppingCart,
        rules: [
            { key: 'requireMembershipToView', label: 'عضویت برای مشاهده درخواست‌ها', hint: 'فقط اعضای بازار ببینند', icon: Shield },
            { key: 'requireMembershipToSubmit', label: 'عضویت برای ثبت درخواست', hint: 'فقط اعضای بازار ثبت کنند', icon: Shield },
            { key: 'maxActiveRequestsPerUser', label: 'حداکثر درخواست فعال', icon: Package, isNumber: true, min: 1, max: 50, suffix: 'عدد' },
        ],
    },
};

export function ModuleSettingsSection({
                                          watch,
                                          setValue,
                                          onSave,
                                          isSaving,
                                          moduleKey,
                                          moduleName,
                                          isAdmin = false
                                      }: ModuleSettingsSectionProps) {
    const [saved, setSaved] = useState(false);

    // ✅ گرفتن دسترسی از armAdminPermission
    const armAdminPermission = watch('config.armAdminPermission') || {};
    const moduleAccess = armAdminPermission.modules || {};

    // ✅ دسترسی ویرایش ماژول - فقط ادمین سیستم یا اگر صراحتاً true باشه
    const canEdit = isAdmin || moduleAccess.canEdit === true;

    // ✅ اگر مالک بازار باشه و دسترسی نداشته باشه، پیام هشدار نشون بده
    const isOwnerWithNoAccess = !isAdmin && !canEdit;

    const moduleSettings = watch(`config.modules.${moduleKey}`) || {};
    const isEnabled = moduleSettings.enabled ?? true;

    const config = moduleConfigs[moduleKey];
    if (!config) return null;

    const ModuleIcon = config.icon;

    const setSetting = (key: string, value: any) => {
        if (!canEdit) return;
        setValue(`config.modules.${moduleKey}`, { ...moduleSettings, [key]: value });
    };

    const handleSave = () => {
        if (!canEdit) return;
        onSave?.();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className={cn(
            "bg-surface-container-low rounded-xl border transition-all",
            isEnabled ? 'border-outline-variant' : 'border-outline-variant/30 opacity-70',
            !canEdit && 'opacity-80'
        )}>
            {/* ═══════════════ هدر ماژول ═══════════════ */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/30">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        isEnabled ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant/50'
                    )}>
                        <ModuleIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-on-surface">{config.title}</h3>
                        <p className="text-[10px] text-on-surface-variant">{moduleName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {canEdit ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={e => setSetting('enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className={cn(
                                "w-11 h-6 rounded-full relative transition-all duration-200",
                                isEnabled ? 'bg-primary after:translate-x-5' : 'bg-outline-variant after:translate-x-0.5',
                                "after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-200 after:shadow-sm"
                            )} />
                        </label>
                    ) : (
                        <div className="flex items-center gap-1.5 text-on-surface-variant/50">
                            <Lock className="w-3.5 h-3.5" />
                            <span className="text-[10px]">فقط مشاهده</span>
                        </div>
                    )}

                    {canEdit && (
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                            {isSaving ? 'ذخیره' : saved ? 'ذخیره شد' : 'ذخیره'}
                        </button>
                    )}
                </div>
            </div>

            {/* ⭐ پیام هشدار برای مالک بازار */}
            {isOwnerWithNoAccess && (
                <div className="mx-4 mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-amber-800 dark:text-amber-300">
                        تغییر تنظیمات این قسمت فعلا برای شما فعال نیست.
                        در صورت نیاز با پشتیبانی سرنخ تماس بگیرید.
                    </p>
                </div>
            )}

            {/* ═══════════════ تنظیمات (grid فشرده) ═══════════════ */}
            <div className={cn(
                "transition-all duration-300 overflow-hidden",
                isEnabled ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            )}>
                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {config.rules.map(rule => {
                            const Icon = rule.icon;
                            const value = moduleSettings[rule.key];
                            const isActive = rule.isNumber ? (value > (rule.min || 0)) : value === true;

                            return (
                                <div key={rule.key}
                                     className={cn(
                                         "flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-all",
                                         isActive ? 'bg-primary/5 border-primary/20' : 'bg-surface-container-lowest border-outline-variant/20 hover:border-outline-variant/50',
                                         !canEdit && 'cursor-default opacity-60'
                                     )}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Icon className={cn(
                                            "w-3.5 h-3.5 flex-shrink-0",
                                            isActive ? 'text-primary' : 'text-on-surface-variant/40'
                                        )} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-on-surface truncate">{rule.label}</p>
                                        </div>
                                    </div>

                                    {rule.isNumber ? (
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <input
                                                type="number"
                                                value={value ?? rule.min ?? 0}
                                                onChange={e => setSetting(rule.key, parseInt(e.target.value) || 0)}
                                                min={rule.min} max={rule.max}
                                                disabled={!canEdit}
                                                className="w-14 bg-surface border border-outline rounded-md h-7 px-1.5 text-xs text-center focus:ring-1 focus:ring-primary/30 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                            <span className="text-[9px] text-on-surface-variant/60 w-8">{rule.suffix}</span>
                                        </div>
                                    ) : (
                                        <label className={cn(
                                            "relative inline-flex items-center",
                                            canEdit ? 'cursor-pointer' : 'cursor-default'
                                        )}>
                                            <input
                                                type="checkbox"
                                                checked={value ?? false}
                                                onChange={e => setSetting(rule.key, e.target.checked)}
                                                disabled={!canEdit}
                                                className="sr-only peer"
                                            />
                                            <div className={cn(
                                                "w-9 h-5 rounded-full relative transition-all duration-200",
                                                value ? 'bg-primary after:translate-x-4' : 'bg-outline-variant after:translate-x-0',
                                                "after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-200 after:shadow-sm",
                                                !canEdit && 'opacity-50'
                                            )} />
                                        </label>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}