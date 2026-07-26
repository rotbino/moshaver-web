// app/arm-admin/settings/components/PaymentTab.tsx
'use client';

import React, { useState } from 'react';
import { CreditCard, Banknote, Info, ChevronDown, ChevronUp, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <div className="space-y-1.5"><label className="text-sm font-medium text-on-surface block">{label}</label>{children}</div>;
}

const GATEWAY_NAMES: Record<string, any> = {
    pec: { label: 'پارسیان', icon: '🏦', website: 'https://pec.shaparak.ir/' },
    zarinpal: { label: 'زرین‌پال', icon: '🟣', website: 'https://www.zarinpal.com/' },
    rayanpay: { label: 'رایان‌پی', icon: '🔵', website: 'https://rayanpay.com/' },
};

export function PaymentTab({ config, updateSetting }: { config: any; updateSetting: (path: string[], v: any) => void }) {
    const [showPins, setShowPins] = useState<Record<string, boolean>>({});
    const [showHelp, setShowHelp] = useState(false);
    const payment = config || {};
    const manual = payment.manual || {};
    const gateways = payment.gateways || [];

    const updateManual = (field: string, value: any) => updateSetting(['config', 'payment', 'manual', field], value);
    const updateGateway = (index: number, field: string, value: any) => {
        const newGateways = [...gateways];
        newGateways[index] = { ...newGateways[index], [field]: value };
        updateSetting(['config', 'payment', 'gateways'], newGateways);
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <span className="font-bold">توجه:</span> مشخصات بانکی خود را وارد کنید تا درآمدهای بازار مستقیما به حساب شما بعنوان مدیر بازار، واریز شود.
            </div>

            {/* کارت به کارت */}
            <div className="bg-surface rounded-xl border-2 border-primary/30 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">پرداخت فیشی</h3>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={manual.enabled} onChange={e => updateManual('enabled', e.target.checked)} className="w-4 h-4 accent-primary" />
                        فعال
                    </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="شماره کارت"><input type="text" value={manual.cardNumber || ''} onChange={e => updateManual('cardNumber', e.target.value)} dir="ltr" className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm font-mono text-left focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></Field>
                    <Field label="شماره شبا"><input type="text" value={manual.shebaNumber || ''} onChange={e => updateManual('shebaNumber', e.target.value)} dir="ltr" className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm font-mono text-left focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></Field>
                    <Field label="نام صاحب حساب"><input type="text" value={manual.accountOwner || ''} onChange={e => updateManual('accountOwner', e.target.value)} className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></Field>
                    <Field label="نام بانک"><input type="text" value={manual.bankName || ''} onChange={e => updateManual('bankName', e.target.value)} className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" /></Field>
                    <div className="sm:col-span-2"><Field label="راهنمای کاربران"><textarea value={manual.instructions || ''} onChange={e => updateManual('instructions', e.target.value)} rows={3} className="w-full bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" /></Field></div>
                </div>
            </div>

            {/* آنلاین */}
            <div className="bg-surface rounded-xl border border-outline-variant/50 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">پرداخت آنلاین</h3>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={payment.paymentMode !== 'manual_only'} onChange={e => updateSetting(['config', 'payment', 'paymentMode'], e.target.checked ? (manual.enabled ? 'both' : 'online_only') : 'manual_only')} className="w-4 h-4 accent-primary" />
                        فعال
                    </label>
                </div>
                {payment.paymentMode !== 'manual_only' && (
                    <>
                        <button onClick={() => setShowHelp(!showHelp)} className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                            <span className="text-sm font-medium text-blue-800 flex items-center gap-2"><Info className="w-4 h-4" />راهنمای راه‌اندازی</span>
                            {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {showHelp && <div
                            className="bg-gray-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-800">
                            <p className={"tex-sm text-gray-500"}>شما می توانید برای بازار خود درگاه آنلاین راه اندازی کنید. تا کاربران بدون نیاز به کارت به کارت، پرداخت خود را آنلاین  انجام دهند و بدون نیاز به تایید اعتبار دریافت کنند. برای اینکار به سایت یکی از
                            پرداختیاران معتبر زیر، مراجعه کرده و بعد از مطالعه قوانین و ثبت نام و دریافت درگاه، کلید آنرا در بخش مربوطه وارد کنید. به همین سادگی درگاه پرداخت آنلاین شما آماده است
                            </p>
                            <p className={"pt-4"}>۱. ثبت‌نام در درگاه | ۲. دریافت PIN | ۳. وارد کردن PIN</p>
                        </div>}
                        <div className="space-y-3">
                            {gateways.map((gw: any, i: number) => {
                                const info = GATEWAY_NAMES[gw.name];
                                return (
                                    <div key={gw.name} className={cn("border rounded-xl p-4", gw.enabled && (gw.pin || gw.merchantId) ? "border-green-200 bg-green-50/30" : gw.enabled ? "border-yellow-200 bg-yellow-50/30" : "border-outline-variant")}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{info?.label || gw.name}</span>
                                            <label><input type="checkbox" checked={gw.enabled} onChange={e => updateGateway(i, 'enabled', e.target.checked)} className="w-4 h-4 accent-primary" /></label>
                                        </div>
                                        {gw.enabled && (
                                            <div className="mt-3 pt-3 border-t">
                                                <Field label={gw.name === 'zarinpal' ? 'Merchant ID' : 'PIN'}>
                                                    <div className="relative">
                                                        <input type={showPins[gw.name] ? 'text' : 'password'} value={gw.pin || gw.merchantId || ''} onChange={e => updateGateway(i, gw.name === 'zarinpal' ? 'merchantId' : 'pin', e.target.value)} dir="ltr"
                                                               className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm font-mono text-left focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                                                        <button onClick={() => setShowPins(p => ({ ...p, [gw.name]: !p[gw.name] }))} className="absolute left-3 top-1/2 -translate-y-1/2">
                                                            {showPins[gw.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </Field>
                                                {info?.website && <a href={info.website} target="_blank" className="text-xs text-primary inline-flex items-center gap-0.5 mt-1"><ExternalLink className="w-3 h-3" />دریافت کلید</a>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}