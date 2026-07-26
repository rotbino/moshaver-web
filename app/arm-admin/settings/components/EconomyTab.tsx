// app/arm-admin/settings/components/EconomyTab.tsx
'use client';

import React from 'react';
import { Coins, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return <div className="space-y-1.5"><label className="text-sm font-medium text-on-surface block">{label}</label>{children}{hint && <p className="text-xs text-on-surface-variant">{hint}</p>}</div>;
}
function NumberInput({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix?: string }) {
    return <div className="relative"><input type="number" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)} className={cn("w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none", suffix ? "pl-12" : "")} />{suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">{suffix}</span>}</div>;
}

export function EconomyTab({ config, updateSetting }: { config: any; updateSetting: (path: string[], v: any) => void }) {
    return (
        <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="هزینه نردبان (bump)" hint="اعتبار لازم برای هر bump">
                    <NumberInput value={config.bumpCost} onChange={v => updateSetting(['config', 'economy', 'bumpCost'], v)} suffix="اعتبار" />
                </Field>
                <Field label="قیمت هر اعتبار" hint="مبلغ ریالی هر واحد">
                    <NumberInput value={config.creditPrice} onChange={v => updateSetting(['config', 'economy', 'creditPrice'], v)} suffix="تومان" />
                </Field>
            </div>

            <div>
                <h3 className="text-base font-semibold flex items-center gap-2 mb-3"><Coins className="w-4 h-4 text-primary" />قوانین اعتبار</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-sm text-amber-800 flex items-start gap-2">
                    <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>فقط توسط <span className="font-bold">مدیر سیستم</span> قابل تغییر است.</span>
                </div>
                <div className="grid grid-cols-2 gap-3 bg-surface rounded-xl border border-outline-variant/20 p-4 opacity-60">
                    {[
                        ['signupBonus', 'اعتبار ثبت‌نام'],
                        ['referralBonus', 'اعتبار معرفی'],
                        ['dailyLoginBonus', 'اعتبار روزانه'],
                        ['commentBonus', 'اعتبار هر نظر'],
                        ['maxDailyEarn', 'حداکثر درآمد روزانه'],
                        ['maxBalance', 'حداکثر موجودی'],
                    ].map(([key, label]) => (
                        <div key={key}><label className="text-xs text-on-surface-variant">{label}</label><div className="bg-surface-container border rounded-lg h-10 px-3 text-sm flex items-center mt-1">{config.creditRules?.[key] || 0} اعتبار</div></div>
                    ))}
                </div>
            </div>
        </div>
    );
}