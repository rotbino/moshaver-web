// app/admin/arm/components/EconomySection.tsx
'use client';

import React, { useState } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Save, Loader2, Check, Coins, Gift, UserPlus, CalendarCheck, MessageSquare, Eye, AlertCircle } from 'lucide-react';

interface EconomySectionProps {
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    onSave?: () => void;
    isSaving?: boolean;
}

export function EconomySection({ watch, setValue, onSave, isSaving }: EconomySectionProps) {
    const [saved, setSaved] = useState(false);
    const economy = watch('config.economy') || {};
    const setEconomy = (key: string, value: any) => setValue('config.economy', { ...economy, [key]: value });
    const creditRules = economy.creditRules || {};
    const setCreditRule = (key: string, value: any) => setValue('config.economy.creditRules', { ...creditRules, [key]: value });

    const handleSave = () => { onSave?.(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const currencyOptions = [
        { value: 'IRR', label: 'تومان (IRR)', symbol: 'تومان' },
        { value: 'IRR1', label: 'ریال (IRR1)', symbol: 'ریال' },
        { value: 'USD', label: 'دلار (USD)', symbol: '$' },
        { value: 'EUR', label: 'یورو (EUR)', symbol: '€' },
        { value: 'AED', label: 'درهم (AED)', symbol: 'د.إ' },
        { value: 'TRY', label: 'لیر (TRY)', symbol: '₺' },
    ];

    const bonusRules = [
        { key: 'signupBonus', label: 'هدیه ثبت‌نام', hint: 'اعتبار هدیه به کاربر جدید', icon: Gift },
        { key: 'referralBonus', label: 'پاداش دعوت', hint: 'اعتبار برای دعوت هر کاربر جدید', icon: UserPlus },
        { key: 'dailyLoginBonus', label: 'پاداش ورود روزانه', hint: 'اعتبار برای ورود روزانه به سایت', icon: CalendarCheck },
        { key: 'commentBonus', label: 'پاداش ثبت نظر', hint: 'اعتبار برای هر نظر در آگهی‌ها', icon: MessageSquare },
        { key: 'adViewBonus', label: 'پاداش بازدید آگهی', hint: 'اعتبار برای هر بازدید از آگهی', icon: Eye },
    ];

    return (
        <div className="space-y-6">
            {/* هدر */}
            <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <div>
                    <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                        <Coins className="w-5 h-5 text-primary" />
                        تنظیمات اقتصادی
                    </h3>
                    <p className="text-xs text-on-surface-variant">واحد پول و قوانین اعتبارات بازار</p>
                </div>
                <button type="button" onClick={handleSave} disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'ذخیره' : saved ? 'ذخیره شد' : 'ذخیره'}
                </button>
            </div>

            {/* ═══════════ واحد پول ═══════════ */}
            <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-primary" />واحد پول بازار
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currencyOptions.map(opt => (
                        <button key={opt.value} type="button"
                                onClick={() => setEconomy('currency', opt.value)}
                                className={`p-3 rounded-xl border-2 text-center transition-all hover:shadow-sm ${
                                    (economy.currency || 'IRR') === opt.value
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-outline-variant/30 hover:border-primary/30'
                                }`}>
                            <p className="text-lg font-bold text-on-surface">{opt.symbol}</p>
                            <p className="text-xs text-on-surface-variant mt-1">{opt.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════════ قوانین اعتبار ═══════════ */}
            <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant">
                <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />قوانین اعتبارات
                </h4>
                <p className="text-xs text-on-surface-variant mb-4">اعتباراتی که کاربران از طریق فعالیت‌های مختلف دریافت می‌کنند</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bonusRules.map(rule => {
                        const Icon = rule.icon;
                        const value = creditRules[rule.key] ?? 0;
                        return (
                            <div key={rule.key} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-3 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-on-surface">{rule.label}</p>
                                    <p className="text-[10px] text-on-surface-variant/60 truncate">{rule.hint}</p>
                                </div>
                                <input type="number" value={value} min={0}
                                       onChange={e => setCreditRule(rule.key, parseInt(e.target.value) || 0)}
                                       className="w-16 bg-surface border border-outline rounded-lg h-8 px-2 text-sm text-center focus:ring-1 focus:ring-primary/30 outline-none flex-shrink-0" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════ نکته ═══════════ */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-on-surface-variant">
                    <p className="font-medium text-primary mb-1">نحوه دریافت اعتبار توسط کاربران:</p>
                    <ul className="space-y-1 list-disc list-inside">
                        <li><span className="font-medium">هدیه:</span> اعتبار رایگان در مناسبت‌های خاص (ثبت‌نام، دعوت، فعالیت)</li>
                        <li><span className="font-medium">خرید:</span> کاربر با پرداخت آنلاین یا فیشی اعتبار می‌خرد</li>
                        <li><span className="font-medium">فعالیت:</span> پاداش فعالیت‌های مفید مانند ثبت نظر یا بازدید آگهی</li>
                    </ul>
                    <p className="mt-2">هزینه نردبان و سایر مصرف‌ها در تنظیمات هر ماژول (مثلاً تابلوی قیمت) تعیین می‌شود.</p>
                </div>
            </div>
        </div>
    );
}