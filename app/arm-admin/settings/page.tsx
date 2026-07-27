// app/arm-admin/settings/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
    Save,
    Loader2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';
import { cn } from '@/lib/utils';

// ✅ استفاده از کامپوننت‌های پنل ادمین
import { GeneralSection } from '@/app/admin/arm/components/GeneralSection';
import { PaymentSection } from '@/app/admin/arm/components/PaymentSection';
import { ModuleSettingsSection } from '@/app/admin/arm/components/ModuleSettingsSection';
import { AccessRulesSection } from '@/app/admin/arm/components/AccessRulesSection';
import { EconomySection } from '@/app/admin/arm/components/EconomySection';
import { FormLabelsSection } from '@/app/admin/arm/components/FormLabelsSection';

// ✅ تب‌ها با کامپوننت‌های مربوطه
type SettingsTab = 'general' | 'modules' | 'access' | 'payment' | 'labels' | 'economy';

interface SettingsData {
    id: string;
    name: string;
    slogan: string;
    description: string;
    colorPrimary: string;
    colorSecondary: string;
    shortName?: string;
    status?: string;
    logoFileId?: string;
    mission: string;
    config: any;
}

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'عمومی', icon: '🏠' },
    { id: 'modules', label: 'ماژول‌ها', icon: '🧩' },
    { id: 'access', label: 'دسترسی', icon: '🔐' },
    { id: 'payment', label: 'پرداخت', icon: '💳' },
    { id: 'labels', label: 'برچسب‌ها', icon: '🏷️' },
    { id: 'economy', label: 'اقتصاد', icon: '💰' },
];

export default function ArmAdminSettings() {
    const { currentSlug, currentArm } = useSelector((state: RootState) => state.arm);
    const { user } = useSelector((state: RootState) => state.auth);

    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // ✅ isSystemAdmin از user گرفته میشه
    const isSystemAdmin = user?.role === 'system_admin' || user?.role === 'system_super_admin';

    const fetchSettings = useCallback(async () => {
        if (!currentSlug) return;
        setLoading(true);
        try {
            const arm = await apiService.armAdmin.getArm(currentSlug);
            const cfg = arm.config || {};
            setSettings({
                id: arm.id || '',
                name: arm.name || '',
                shortName: arm.shortName || '',
                slogan: arm.slogan || '',
                description: arm.description || '',
                status: arm.status || 'active',
                colorPrimary: arm.colorPrimary || '#e65100',
                colorSecondary: arm.colorSecondary || '#bf360c',
                logoFileId: cfg.general?.logoFileId || arm.logoUrl || undefined,
                mission: arm.mission || '',
                config: cfg,
            });
            setHasChanges(false);
        } catch (error: any) {
            toast.error(error?.message || 'خطا در دریافت تنظیمات');
        } finally {
            setLoading(false);
        }
    }, [currentSlug]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const handleSave = async () => {
        if (!currentSlug || !settings) return;
        setSaving(true);
        try {
            const updateData: any = {
                name: settings.name,
                shortName: settings.shortName,
                slogan: settings.slogan,
                description: settings.description,
                mission: settings.mission,
                status: settings.status,
                colorPrimary: settings.colorPrimary,
                colorSecondary: settings.colorSecondary,
                config: {
                    ...settings.config,
                },
            };
            await apiService.armAdmin.updateSettings(currentSlug, updateData);
            toast.success('تنظیمات ذخیره شد');
            setHasChanges(false);
            await fetchSettings();
        } catch (error: any) {
            toast.error(error?.message || 'خطا در ذخیره');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = useCallback((path: string[], value: any) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const newSettings = structuredClone(prev);
            let current: any = newSettings;
            for (let i = 0; i < path.length - 1; i++) current = current[path[i]];
            current[path[path.length - 1]] = value;
            return newSettings;
        });
        setHasChanges(true);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                <h3 className="text-lg font-semibold">خطا در بارگذاری</h3>
                <button onClick={fetchSettings} className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-lg inline-flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />تلاش مجدد
                </button>
            </div>
        );
    }

    const showSaveButton = ['general', 'economy', 'payment', 'labels'].includes(activeTab);

    return (
        <div className="space-y-6">
            {/* تب‌ها */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
                    <div className="flex items-center gap-1 bg-surface-container-low dark:bg-gray-800 rounded-xl p-1 w-max min-w-full sm:min-w-0">
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                                        isActive
                                            ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-400 shadow-sm'
                                            : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-gray-200'
                                    )}
                                >
                                    <span>{tab.icon}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {showSaveButton && (
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className={cn(
                            "hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0",
                            hasChanges
                                ? "bg-primary text-on-primary hover:bg-primary/90"
                                : "bg-surface-container-high dark:bg-gray-800 text-on-surface-variant dark:text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </button>
                )}
            </div>

            {/* محتوای تب‌ها */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-outline-variant/20 dark:border-gray-800 p-4 sm:p-6">
                {activeTab === 'general' && (
                    <GeneralSection
                        register={() => ({})}
                        errors={{}}
                        watch={() => settings}
                        setValue={() => {}}
                        armId={settings.id}
                        isSystemAdmin={isSystemAdmin}
                    />
                )}

                {activeTab === 'modules' && (
                    <div className="space-y-6">
                        <ModuleSettingsSection
                            watch={() => settings.config?.modules?.priceTable || {}}
                            setValue={() => {}}
                            onSave={() => {}}
                            isSaving={saving}
                            moduleKey="priceTable"
                            moduleName="تابلوی قیمت"
                        />
                        <ModuleSettingsSection
                            watch={() => settings.config?.modules?.buyLead || {}}
                            setValue={() => {}}
                            onSave={() => {}}
                            isSaving={saving}
                            moduleKey="buyLead"
                            moduleName="تابلوی درخواست خرید"
                        />
                    </div>
                )}

                {activeTab === 'access' && (
                    <AccessRulesSection
                        watch={() => settings.config?.accessRules || {}}
                        setValue={() => {}}
                        onSave={() => {}}
                        isSaving={saving}
                        isAdmin={isSystemAdmin}
                    />
                )}

                {activeTab === 'payment' && (
                    <PaymentSection
                        register={() => ({})}
                        errors={{}}
                        watch={() => settings.config?.payment || {}}
                        setValue={() => {}}
                        control={{} as any}
                    />
                )}

                {activeTab === 'labels' && (
                    <FormLabelsSection
                        watch={() => settings.config?.formLabels || {}}
                        setValue={() => {}}
                        onSave={() => {}}
                        isSaving={saving}
                        isAdmin={isSystemAdmin}
                    />
                )}

                {activeTab === 'economy' && (
                    <EconomySection
                        watch={() => settings.config?.economy || {}}
                        setValue={() => {}}
                        onSave={() => {}}
                        isSaving={saving}
                    />
                )}
            </div>

            {/* دکمه ذخیره موبایل */}
            {showSaveButton && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-outline-variant/20 dark:border-gray-800 p-4 z-40 lg:hidden">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="w-full bg-primary text-on-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        ذخیره تغییرات
                    </button>
                </div>
            )}
        </div>
    );
}