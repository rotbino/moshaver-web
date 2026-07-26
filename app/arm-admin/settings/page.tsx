// app/arm-admin/settings/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
    Globe, MapPin, Palette, Wrench, Coins, CreditCard,
    Save, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';
import { cn } from '@/lib/utils';
import { GeneralTab } from './components/GeneralTab';
import { ScopeTab } from './components/ScopeTab';
import { AppearanceTab } from './components/AppearanceTab';
import { FeaturesTab } from './components/FeaturesTab';
import { EconomyTab } from './components/EconomyTab';
import { PaymentTab } from './components/PaymentTab';

type SettingsTab = 'general' | 'scope' | 'appearance' | 'features' | 'economy' | 'payment';

interface SettingsData {
    id: string;
    name: string;
    slogan: string;
    description: string;
    colorPrimary: string;
    colorSecondary: string;
    logoFileId?: string;
    mission: string;
    config: {
        appearance: any;
        features: any;
        economy: any;
        payment: any;
    };
}

const TABS: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'general', label: 'عمومی', icon: Globe },
    { id: 'scope', label: 'دامنه فعالیت', icon: MapPin },
    { id: 'appearance', label: 'ظاهری', icon: Palette },
    { id: 'features', label: 'امکانات', icon: Wrench },
    { id: 'economy', label: 'اقتصادی', icon: Coins },
    { id: 'payment', label: 'درگاه پرداخت', icon: CreditCard },
];

export default function ArmAdminSettings() {
    const { currentSlug, currentArm } = useSelector((state: RootState) => state.arm);

    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
    const [logoFileId, setLogoFileId] = useState<string | undefined>(undefined);

    // ============================================================
    // واکشی
    // ============================================================
    const fetchSettings = useCallback(async () => {
        if (!currentSlug) return;
        setLoading(true);
        try {
            const data = await apiService.armAdmin.getSettings(currentSlug);
            const payment = await apiService.armAdmin.getPaymentSettings(currentSlug).catch(() => null);

            setSettings({
                id: data.id || '',
                name: data.name || '',
                slogan: data.slogan || '',
                description: data.description || '',
                colorPrimary: data.colorPrimary || '#8b0000',
                colorSecondary: data.colorSecondary || '#904d00',
                logoFileId: data.logoFileId || undefined,
                mission: data.mission || '',
                config: {
                    appearance: data.config?.appearance || {},
                    features: data.config?.features || {},
                    economy: {
                        bumpCost: data.config?.economy?.bumpCost ?? 10,
                        creditPrice: data.config?.economy?.creditPrice ?? 2000,
                        creditRules: data.config?.economy?.creditRules || {},
                    },
                    payment: payment || data.config?.payment || {},
                },
            });
            setLogoFileId(data.logoFileId || undefined);
            setHasChanges(false);
            setSelectedLogoFile(null);
        } catch (error: any) {
            toast.error(error?.message || 'خطا در دریافت تنظیمات');
        } finally {
            setLoading(false);
        }
    }, [currentSlug]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    // ============================================================
    // ذخیره
    // ============================================================
    const handleSave = async () => {
        if (!currentSlug || !settings) return;
        setSaving(true);
        try {
            switch (activeTab) {
                case 'general':
                    await apiService.armAdmin.updateSettings(currentSlug, {
                        name: settings.name,
                        slogan: settings.slogan,
                        description: settings.description,
                        colorPrimary: settings.colorPrimary,
                        colorSecondary: settings.colorSecondary,
                        mission: settings.mission,
                        logoFileId,
                    });
                    break;
                case 'economy':
                    await apiService.armAdmin.updateSettings(currentSlug, {
                        economy: settings.config.economy,
                    });
                    break;
                case 'payment':
                    await apiService.armAdmin.updatePaymentSettings(currentSlug, settings.config.payment);
                    break;
                // scope, appearance, features نیازی به ذخیره ندارن (فقط خواندنی)
            }
            toast.success('تنظیمات ذخیره شد');
            setHasChanges(false);
            setSelectedLogoFile(null);
        } catch (error: any) {
            toast.error(error?.message || 'خطا در ذخیره');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (path: string[], value: any) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const newSettings = structuredClone(prev);
            let current: any = newSettings;
            for (let i = 0; i < path.length - 1; i++) current = current[path[i]];
            current[path[path.length - 1]] = value;
            return newSettings;
        });
        setHasChanges(true);
    };

    // ============================================================
    // لودینگ
    // ============================================================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-sm text-on-surface-variant">در حال بارگذاری...</p>
                </div>
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

    const showSaveButton = ['general', 'economy', 'payment'].includes(activeTab);

    return (
        <div className="pb-24">
            {/* هدر */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">تنظیمات بازار</h1>
                    <p className="text-sm text-on-surface-variant">{currentArm?.name || currentSlug}</p>
                </div>
                {showSaveButton && (
                    <button onClick={handleSave} disabled={!hasChanges || saving}
                            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all", hasChanges ? "bg-primary text-on-primary hover:bg-primary/90" : "bg-surface-container-high text-on-surface-variant cursor-not-allowed")}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </button>
                )}
            </div>

            {/* تب‌ها */}
            <div className="overflow-x-auto pb-1 mb-6 no-scrollbar">
                <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 border border-outline-variant/30 w-max min-w-full sm:min-w-0">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={cn("flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap", isActive ? "bg-surface text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface")}>
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* محتوا */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 sm:p-6">
                {activeTab === 'general' && <GeneralTab settings={settings} updateSetting={updateSetting} selectedLogoFile={selectedLogoFile} setSelectedLogoFile={setSelectedLogoFile} logoFileId={logoFileId} setLogoFileId={setLogoFileId} setHasChanges={setHasChanges} />}
                {activeTab === 'scope' && <ScopeTab />}
                {activeTab === 'appearance' && <AppearanceTab config={settings.config.appearance} />}
                {activeTab === 'features' && <FeaturesTab config={settings.config.features} />}
                {activeTab === 'economy' && <EconomyTab config={settings.config.economy} updateSetting={updateSetting} />}
                {activeTab === 'payment' && <PaymentTab config={settings.config.payment} updateSetting={updateSetting} />}
            </div>

            {/* نوار ذخیره موبایل */}
            {hasChanges && showSaveButton && (
                <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant p-4 z-40 lg:hidden">
                    <button onClick={handleSave} disabled={saving}
                            className="w-full bg-primary text-on-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        ذخیره تغییرات
                    </button>
                </div>
            )}
        </div>
    );
}