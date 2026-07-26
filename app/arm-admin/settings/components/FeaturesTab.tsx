// app/arm-admin/settings/components/FeaturesTab.tsx
'use client';

import React from 'react';
import { Lock } from 'lucide-react';

function SwitchField({ label, checked }: { label: string; checked: boolean }) {
    return <div className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-0"><span className="text-sm text-on-surface">{label}</span><span className="w-11 h-6 rounded-full bg-outline-variant relative"><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow-sm ${checked ? 'right-0.5' : 'right-[22px]'}`} /></span></div>;
}

export function FeaturesTab({ config }: { config: any }) {
    return (
        <div className="space-y-4 max-w-2xl">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">تنظیمات امکانات فقط توسط <span className="font-bold">مدیر سیستم</span> قابل تغییر است.</p>
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden opacity-60">
                <SwitchField label="ثبت آگهی ناشناس" checked={config.allowAnonymousPublishing} />
                <SwitchField label="درخواست خرید (Buy Lead)" checked={config.enableBuyLead} />
                <SwitchField label="نام کسب‌وکار اجباری" checked={config.requireBusinessName} />
                <SwitchField label="انتخاب شهر اجباری" checked={config.requireCity} />
                <SwitchField label="تایید خودکار آگهی" checked={config.autoApproveAds} />
            </div>
            <div className="grid grid-cols-2 gap-4 opacity-60">
                <div><label className="text-sm text-on-surface-variant">اعتبار آگهی</label><div className="bg-surface-container border rounded-lg h-10 px-3 text-sm flex items-center">{config.adValidityDefaultDays} روز</div></div>
                <div><label className="text-sm text-on-surface-variant">آگهی رایگان ماهانه</label><div className="bg-surface-container border rounded-lg h-10 px-3 text-sm flex items-center">{config.maxFreeAdsPerMonth} عدد</div></div>
            </div>
        </div>
    );
}