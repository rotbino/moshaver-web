// app/profile/components/TipsList.tsx
'use client';
import React from 'react';
import { Sparkles, AlertTriangle, Package, TrendingUp } from 'lucide-react';

export default function TipsList() {
    const tips = [
        { icon: Sparkles, text: 'قیمت‌های جدیدتر در شرایط مشابه، بالاتر قرار می‌گیرند.' },
        { icon: AlertTriangle, text: 'درج قیمت‌ و موجودی غیر واقعی موجب امتیاز منفی از طرف کاربران خواهد شد.' },
        { icon: Package, text: 'برای هر کالا می‌توانید چند قیمت با حداقل خرید متفاوت ثبت کنید.' },
        { icon: TrendingUp, text: 'همیشه می توانید تا 5 آگهی رایگان روی تابلو داشته باشید.' },
        { icon: TrendingUp, text: 'خرید اعتابر فقط برای آگهی خارج از سهمیه و نردبان کردن نیاز است' },
    ];

    return (
        <div className="space-y-3">
            {tips.map((tip, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-outline-variant/30 dark:border-gray-700 p-3 flex items-start gap-2.5 shadow-sm">
                    <tip.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-on-surface dark:text-gray-300 leading-relaxed">{tip.text}</p>
                </div>
            ))}
        </div>
    );
}