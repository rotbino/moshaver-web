// app/admin/arm/components/AccessRulesSection.tsx
'use client';

import React, { useState } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Save, Loader2, Check, Shield, Building2, Users, Lock, Phone, MapPin, AlertTriangle, Zap } from 'lucide-react';

interface AccessRulesSectionProps {
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    onSave?: () => void;
    isSaving?: boolean;
    isAdmin?: boolean;
}

export function AccessRulesSection({ watch, setValue, onSave, isSaving, isAdmin = false }: AccessRulesSectionProps) {
    const [saved, setSaved] = useState(false);
    const rules = watch('config.accessRules') || {};

    // ⭐ ست کردن یه rule خاص
    const setRule = (key: string, value: any) => {
        const updated = { ...rules, [key]: value };

        // ⭐ اگر autoJoinOnEntry فعال شد، محدودیت صنفی رو می‌تونیم تنظیم کنیم
        // ولی غیرفعالش نمی‌کنیم - فقط به مدیر اخطار می‌دیم
        setValue('config.accessRules', updated);
    };

    const handleSave = () => { onSave?.(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const ruleGroups = [
        {
            title: 'عضویت در بازار',
            icon: Users,
            rules: [
                {
                    key: 'autoJoinOnEntry',
                    label: 'عضویت خودکار هنگام ورود',
                    hint: 'کاربران لاگین‌کرده به‌محض ورود به بازار، عضو می‌شوند (در صورت محدودیت صنفی، فقط مشمولان)',
                    icon: Zap,
                    adminOnly: false,
                    warning: rules.restrictMembershipByIndustry
                        ? '⚠️ با محدودیت صنفی فعال، فقط کاربرانی که صنفشان در لیست باشد عضو می‌شوند'
                        : undefined,
                },
                {
                    key: 'restrictMembershipByIndustry',
                    label: 'محدودیت صنفی برای عضویت',
                    hint: 'فقط کسب‌وکارهایی با صنف تعریف‌شده می‌توانند عضو شوند',
                    icon: Building2,
                    adminOnly: true,
                },
                {
                    key: 'allowManualRoleSelection',
                    label: 'انتخاب دستی نقش',
                    hint: 'اگر صنف کاربر در لیست نبود، خودش نقش را انتخاب کند',
                    icon: Users,
                    adminOnly: false,
                    dependsOn: 'restrictMembershipByIndustry',
                },
                {
                    key: 'requireAdminApprovalForMembership',
                    label: 'تأیید مدیر برای عضویت',
                    hint: 'هر درخواست عضویت باید توسط مدیر تأیید شود (در عضویت خودکار بی‌اثر است)',
                    icon: Lock,
                    adminOnly: false,
                },
            ],
        },
        {
            title: 'تأیید هویت',
            icon: Shield,
            rules: [
                { key: 'requirePhoneVerification', label: 'تأیید موبایل اجباری', hint: 'کاربر باید شماره موبایلش تأیید شده باشد', icon: Phone, adminOnly: true },
                { key: 'requireBusinessVerification', label: 'تیک اعتماد اجباری', hint: 'کاربر باید تیک اعتماد داشته باشد', icon: Shield, adminOnly: true },
            ],
        },
        {
            title: 'محدودیت‌های جغرافیایی',
            icon: MapPin,
            rules: [
                { key: 'restrictMembershipByLocation', label: 'محدودیت موقعیت مکانی', hint: 'فقط کاربران شهر/استان‌های بازار می‌توانند عضو شوند', icon: MapPin, adminOnly: true },
            ],
        },
    ];

    const renderRule = (rule: any) => {
        const Icon = rule.icon;
        const value = rules[rule.key];
        const disabled = (rule.adminOnly && !isAdmin);
        const dependsOnRule = rule.dependsOn ? rules[rule.dependsOn] === true : true;

        return (
            <div key={rule.key} className={`bg-surface-container-lowest border rounded-xl p-3 transition-all ${!dependsOnRule ? 'opacity-50 pointer-events-none' : value === true ? 'border-primary/30 bg-primary/5' : 'border-outline-variant/20'}`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${value ? 'text-primary' : 'text-on-surface-variant/50'}`} />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{rule.label}</span>
                                {disabled && <span className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full"><Lock className="w-2.5 h-2.5 inline" /> مدیر</span>}
                                {rule.key === 'autoJoinOnEntry' && value && (
                                    <span className="text-[9px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">فعال</span>
                                )}
                            </div>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">{rule.hint}</p>
                            {rule.warning && value && (
                                <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {rule.warning}
                                </p>
                            )}
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input type="checkbox" checked={value ?? false} onChange={e => setRule(rule.key, e.target.checked)} disabled={disabled} className="sr-only peer" />
                        <div className={`w-10 h-6 rounded-full transition-all ${disabled ? 'bg-outline-variant/30' : value ? 'bg-primary' : 'bg-outline-variant'} peer-checked:after:translate-x-full after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`} />
                    </label>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <div>
                    <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />قوانین دسترسی</h3>
                    <p className="text-xs text-on-surface-variant">تنظیمات کلی عضویت و تأیید هویت (مستقل از ماژول‌ها)</p>
                </div>
                <button type="button" onClick={handleSave} disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'در حال ذخیره...' : saved ? 'ذخیره شد' : 'ذخیره'}
                </button>
            </div>

            {ruleGroups.map(group => (
                <div key={group.title} className="bg-surface-container-low p-5 border border-outline-variant rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <group.icon className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold">{group.title}</h4>
                    </div>
                    <div className="space-y-2">{group.rules.map(renderRule)}</div>
                </div>
            ))}
        </div>
    );
}