// app/arm-admin/settings/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, RefreshCw, TrendingUp, ShoppingCart, Check, Save } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';
import { cn } from '@/lib/utils';

import { GeneralSection } from '@/app/admin/arm/components/GeneralSection';
import { PaymentSection } from '@/app/admin/arm/components/PaymentSection';
import { ModuleSettingsSection } from '@/app/admin/arm/components/ModuleSettingsSection';
import { AccessRulesSection } from '@/app/admin/arm/components/AccessRulesSection';
import { EconomySection } from '@/app/admin/arm/components/EconomySection';
import { FormLabelsSection } from '@/app/admin/arm/components/FormLabelsSection';
import { ArmPermissionSection } from '@/app/admin/arm/components/ArmPermissionSection';
import { CategorySelector } from '@/app/admin/arm/components/CategorySelector';
import { CategoryScopeSelector } from '@/app/admin/arm/components/CategoryScopeSelector';
import { IndustrySelector } from '@/app/admin/arm/components/IndustrySelector';
import { LocationSelector } from '@/app/admin/arm/components/LocationSelector';

type SettingsTab = 'general' | 'modules' | 'access' | 'payment' | 'labels' | 'economy' | 'permissions' | 'categories' | 'industries' | 'locations';

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'عمومی', icon: '🏠' },
    { id: 'payment', label: 'درگاه پرداخت', icon: '💳' },
    { id: 'economy', label: 'اقتصاد', icon: '💰' },
    { id: 'modules', label: 'ماژول‌ها', icon: '🧩' },
    { id: 'access', label: 'دسترسی', icon: '🔐' },
    { id: 'categories', label: 'دسته‌بندی‌ها', icon: '📂' },
    { id: 'industries', label: 'صنوف', icon: '🏭' },
    { id: 'locations', label: 'موقعیت‌ها', icon: '📍' },
    { id: 'labels', label: 'برچسب‌ها', icon: '🏷️' },
    { id: 'permissions', label: 'دسترسی مالک', icon: '🛡️' },
];

export default function ArmAdminSettings() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentSlug } = useSelector((state: RootState) => state.arm);
    const { user } = useSelector((state: RootState) => state.auth);

    const isSystemAdmin = user?.role === 'system_admin';

    const tabFromUrl = (searchParams.get('tab') as SettingsTab) || 'general';
    const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromUrl);
    const [loading, setLoading] = useState(true);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeScopeId, setActiveScopeId] = useState<string | null>(null);

    // ✅ useForm - همیشه تعریف می‌شود
    const { register, watch, setValue, control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: settings || {},
    });

    // تغییر تب با آپدیت URL
    const handleTabChange = (tab: SettingsTab) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        const tab = searchParams.get('tab') as SettingsTab;
        if (tab && TABS.some(t => t.id === tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const fetchSettings = useCallback(async () => {
        if (!currentSlug) return;
        setLoading(true);
        try {
            const arm = await apiService.armAdmin.getArm(currentSlug);
            const cfg = arm.config || {};
            const formData = {
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
            };
            setSettings(formData);
            reset(formData);
            setHasChanges(false);
        } catch (error: any) {
            toast.error(error?.message || 'خطا در دریافت تنظیمات');
        } finally {
            setLoading(false);
        }
    }, [currentSlug, reset]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    // ✅ تابع ذخیره واقعی
    const saveSettings = useCallback(async (data: any) => {
        if (!currentSlug || !settings) return;
        try {
            const updateData: any = {
                name: data.name || settings.name,
                shortName: data.shortName || settings.shortName,
                slogan: data.slogan || settings.slogan,
                description: data.description || settings.description,
                mission: data.mission || settings.mission,
                status: data.status || settings.status,
                colorPrimary: data.colorPrimary || settings.colorPrimary,
                colorSecondary: data.colorSecondary || settings.colorSecondary,
                config: data.config || settings.config,
            };
            await apiService.armAdmin.updateSettings(currentSlug, updateData);
            setHasChanges(false);
            await fetchSettings();
        } catch (error: any) {
            toast.error(error?.message || 'خطا در ذخیره تنظیمات');
            throw error;
        }
    }, [currentSlug, settings, fetchSettings]);

    // ✅ Auto-save
    const handleAutoSave = useCallback(() => {
        if (!isAutoSaving && hasChanges) {
            setIsAutoSaving(true);
            handleSubmit((data) => {
                saveSettings(data)
                    .then(() => {
                        setTimeout(() => setIsAutoSaving(false), 500);
                    })
                    .catch(() => {
                        setIsAutoSaving(false);
                    });
            })();
        }
    }, [handleSubmit, saveSettings, isAutoSaving, hasChanges]);

    // ✅ مانیتور تغییرات فرم
    useEffect(() => {
        const subscription = watch(() => {
            setHasChanges(true);
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    // ✅ تغییر تب با ذخیره خودکار
    const handleTabChangeWithSave = (tab: SettingsTab) => {
        if (hasChanges) {
            handleAutoSave();
        }
        handleTabChange(tab);
    };

    const handleSetValue = useCallback((name: any, value: any) => {
        setValue(name, value, { shouldDirty: true });
        setHasChanges(true);
    }, [setValue]);

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

    return (
        <div className="space-y-4 pb-20">
            {/* وضعیت ذخیره‌سازی */}
            <div className="text-[11px] flex justify-end items-center gap-2 ">
                {isAutoSaving ? (
                    <span className="flex items-center gap-2 text-on-surface-variant">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        در حال ذخیره...
                    </span>
                ) : hasChanges ? (
                    <span className="text-amber-600 dark:text-amber-400">تغییرات ذخیره نشده</span>
                ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        ذخیره شد
                    </span>
                )}
            </div>

            {/* تب‌ها */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full">
                    <div
                        className="no-scrollbar"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        <div className="flex items-center gap-1 bg-surface-container-low dark:bg-gray-800 rounded-xl p-1 w-max h-full">
                            {TABS.map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChangeWithSave(tab.id)}
                                        className={cn(
                                            "flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0",
                                            isActive
                                                ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-400 shadow-sm'
                                                : 'text-on-surface-variant dark:text-gray-400 hover:text-on-surface dark:hover:text-gray-200',
                                        )}
                                    >
                                        <span>{tab.icon}</span>
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div style={{ height: '52px' }}></div>
                </div>
            </div>

            {/* محتوای تب‌ها */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-outline-variant/20 dark:border-gray-800 p-4 sm:p-6">
                {activeTab === 'general' && (
                    <GeneralSection
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={handleSetValue}
                        armId={settings.id}
                        isSystemAdmin={isSystemAdmin}
                    />
                )}

                {activeTab === 'modules' && (
                    <div className="space-y-6">
                        <ModuleSettingsSection
                            watch={watch}
                            setValue={handleSetValue}
                            onSave={handleAutoSave}
                            isSaving={isAutoSaving}
                            moduleKey="priceTable"
                            moduleName="تابلوی قیمت"
                            moduleIcon={TrendingUp}
                            isAdmin={isSystemAdmin}
                        />
                        <ModuleSettingsSection
                            watch={watch}
                            setValue={handleSetValue}
                            onSave={handleAutoSave}
                            isSaving={isAutoSaving}
                            moduleKey="buyLead"
                            moduleName="تابلوی درخواست خرید"
                            moduleIcon={ShoppingCart}
                            isAdmin={isSystemAdmin}
                        />
                    </div>
                )}

                {activeTab === 'access' && (
                    <AccessRulesSection
                        watch={watch}
                        setValue={handleSetValue}
                        onSave={handleAutoSave}
                        isSaving={isAutoSaving}
                        isAdmin={isSystemAdmin}
                    />
                )}

                {activeTab === 'payment' && (
                    <PaymentSection
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={handleSetValue}
                        control={control}
                        isAdmin={isSystemAdmin}
                    />
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <CategoryScopeSelector
                            watch={watch}
                            setValue={setValue}
                            disabled={true}
                            categorySelections={watch('config.categorySelections')}
                            onSave={handleAutoSave}
                            activeScopeId={activeScopeId}
                            onScopeSelect={setActiveScopeId}
                            isAdmin={isSystemAdmin}
                            canAddScope={true}
                            canRemoveScope={true}
                        />
                        <CategorySelector
                            control={control}
                            watch={watch}
                            setValue={setValue}
                            disabled={true}
                            onSave={handleAutoSave}
                            activeScopeId={activeScopeId}
                            isAdmin={isSystemAdmin}
                            canAddLeaf={true}
                            canRemoveLeaf={true}
                            canChangeUnit={true}
                        />
                    </div>
                )}

                {activeTab === 'industries' && (
                    <IndustrySelector
                        watch={watch}
                        setValue={handleSetValue}
                        onSave={handleAutoSave}
                        isSaving={isAutoSaving}
                        isAdmin={isSystemAdmin}
                    />
                )}

                {activeTab === 'locations' && (
                    <LocationSelector
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        onSave={handleAutoSave}
                        isAdmin={isSystemAdmin}
                        isSaving={isAutoSaving}
                    />
                )}

                {activeTab === 'labels' && (
                    <FormLabelsSection
                        watch={watch}
                        setValue={handleSetValue}
                        onSave={handleAutoSave}
                        isSaving={isAutoSaving}
                        isAdmin={isSystemAdmin}
                    />
                )}

                {activeTab === 'economy' && (
                    <EconomySection
                        watch={watch}
                        setValue={handleSetValue}
                        onSave={handleAutoSave}
                        isSaving={isAutoSaving}
                        isAdmin={isSystemAdmin}
                    />
                )}

                {activeTab === 'permissions' && (
                    <ArmPermissionSection
                        watch={watch}
                        setValue={handleSetValue}
                        isAdmin={isSystemAdmin}
                        isSaving={isAutoSaving}
                        onSave={handleAutoSave}
                    />
                )}
            </div>

            {/* دکمه ذخیره موبایل */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-outline-variant/20 dark:border-gray-800 p-4 z-40 lg:hidden">
                <button
                    onClick={handleAutoSave}
                    disabled={!hasChanges || isAutoSaving}
                    className="w-full bg-primary text-on-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isAutoSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isAutoSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
            </div>
        </div>
    );
}