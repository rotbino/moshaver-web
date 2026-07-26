// app/arm-admin/settings/components/AppearanceTab.tsx
'use client';

import React from 'react';
import { Lock } from 'lucide-react';

function SwitchField({ label, checked }: { label: string; checked: boolean }) {
    return <div className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-0"><span className="text-sm text-on-surface">{label}</span><span className="w-11 h-6 rounded-full bg-outline-variant relative"><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow-sm ${checked ? 'right-0.5' : 'right-[22px]'}`} /></span></div>;
}

export function AppearanceTab({ config }: { config: any }) {
    return (
        <div className="space-y-4 max-w-2xl">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">تنظیمات ظاهری فقط توسط <span className="font-bold">مدیر سیستم</span> قابل تغییر است.</p>
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden opacity-60">
                <SwitchField label="نمایش نشان تایید" checked={config.showVerifiedBadge} />
                <SwitchField label="نمایش نام شرکت" checked={config.showCompanyName} />
                <SwitchField label="نمایش دکمه درخواست خرید" checked={config.showBuyLeadButton} />
                <SwitchField label="نمایش نوار جستجو" checked={config.showSearchBar} />
                <SwitchField label="نمایش فیلتر دسته‌بندی" checked={config.showCategoryFilter} />
                <SwitchField label="نمایش فیلتر موقعیت" checked={config.showLocationFilter} />
            </div>
        </div>
    );
}