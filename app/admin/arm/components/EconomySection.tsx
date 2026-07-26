// app/admin/arm/components/EconomySection.tsx
'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface EconomySectionProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
}

export function EconomySection({ register, errors, watch, setValue }: EconomySectionProps) {
    return (
        <div className="space-y-4 bg-surface-container-low p-6 border border-outline-variant">
            <h3 className="text-lg font-semibold">تنظیمات اقتصادی</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant block">
                        واحد پول
                    </label>
                    <select
                        {...register('config.economy.currency')}
                        className="w-full bg-surface-container-lowest border border-outline h-12 px-4 font-body-md text-right appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    >
                        <option value="IRR">تومان</option>
                        <option value="IRR1">ریال</option>
                        <option value="USD">دلار</option>
                        <option value="EUR">یورو</option>
                        <option value="BTC">بیت‌کوین</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant block">
                        هزینه نردبان (اعتبار)
                    </label>
                    <input
                        {...register('config.economy.bumpCost')}
                        type="number"
                        className="w-full bg-surface-container-lowest border border-outline h-12 px-4 font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                    <p className="text-xs text-on-surface-variant/60">
                        تعداد اعتباری که برای نردبان آگهی کسر می‌شود
                    </p>
                </div>

                {/* ✅ فیلد جدید: قیمت هر اعتبار */}
                <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant block">
                        قیمت هر اعتبار (تومان)
                    </label>
                    <input
                        {...register('config.economy.creditPrice')}
                        type="number"
                        className="w-full bg-surface-container-lowest border border-outline h-12 px-4 font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                    <p className="text-xs text-on-surface-variant/60">
                        مبلغی که کاربر برای هر واحد اعتبار پرداخت می‌کند
                    </p>
                </div>
            </div>

            <h4 className="font-semibold text-sm text-on-surface-variant mt-4">قوانین اعتبارات</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">هدیه ثبت‌نام</label>
                    <input
                        {...register('config.economy.creditRules.signupBonus')}
                        type="number"
                        className="w-full bg-surface-container-lowest border border-outline h-10 px-3 text-sm font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">پاداش دعوت</label>
                    <input
                        {...register('config.economy.creditRules.referralBonus')}
                        type="number"
                        className="w-full bg-surface-container-lowest border border-outline h-10 px-3 text-sm font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">پاداش ورود روزانه</label>
                    <input
                        {...register('config.economy.creditRules.dailyLoginBonus')}
                        type="number"
                        className="w-full bg-surface-container-lowest border border-outline h-10 px-3 text-sm font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">پاداش کامنت</label>
                    <input
                        {...register('config.economy.creditRules.commentBonus')}
                        type="number"
                        className="w-full bg-surface-container-lowest border border-outline h-10 px-3 text-sm font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">پاداش بازدید آگهی</label>
                    <input
                        {...register('config.economy.creditRules.adViewBonus')}
                        type="number"
                        className="w-full bg-surface-container-lowest border border-outline h-10 px-3 text-sm font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">سقف درآمد روزانه</label>
                    <input
                        {...register('config.economy.creditRules.maxDailyEarn')}
                        type="number"
                        className="w-full bg-surface-container-lowest border border-outline h-10 px-3 text-sm font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">سقف موجودی</label>
                    <input
                        {...register('config.economy.creditRules.maxBalance')}
                        type="number"
                        className="w-full bg-surface-container-lowest border border-outline h-10 px-3 text-sm font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">حداکثر دعوت پاداش‌دار</label>
                    <input
                        {...register('config.economy.creditRules.referralMaxCount')}
                        type="number"
                        className="w-full bg-surface-container-lowest border border-outline h-10 px-3 text-sm font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
}