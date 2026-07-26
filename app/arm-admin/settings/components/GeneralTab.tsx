// app/arm-admin/settings/components/GeneralTab.tsx
'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Globe, MapPin, Building2 } from 'lucide-react';
import { FileUploader } from '@/components/common/FileUploader';
import { cn } from '@/lib/utils';

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
    return <div className={cn("space-y-1.5", className)}><label className="text-sm font-medium text-on-surface block">{label}</label>{children}{hint && <p className="text-xs text-on-surface-variant">{hint}</p>}</div>;
}
function ReadonlyField({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
    return <div className="space-y-1.5"><label className="text-sm font-medium text-on-surface-variant flex items-center gap-1.5">{Icon && <Icon className="w-4 h-4" />}{label}</label><div className="bg-surface-container border border-outline/50 rounded-lg h-10 px-3 text-sm flex items-center text-on-surface">{value}</div></div>;
}
function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return <div className="flex items-center gap-2"><div className="relative flex-shrink-0"><input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" /><div className="w-10 h-10 rounded-lg border-2 border-outline-variant shadow-sm" style={{ backgroundColor: value }} /></div><input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" /></div>;
}

interface GeneralTabProps {
    settings: any;
    updateSetting: (path: string[], value: any) => void;
    selectedLogoFile: File | null;
    setSelectedLogoFile: (f: File | null) => void;
    logoFileId: string | undefined;
    setLogoFileId: (id: string | undefined) => void;
    setHasChanges: (v: boolean) => void;
}

export function GeneralTab({ settings, updateSetting, selectedLogoFile, setSelectedLogoFile, logoFileId, setLogoFileId, setHasChanges }: GeneralTabProps) {
    const { currentArm } = useSelector((state: RootState) => state.arm);
    const locationTree = currentArm?.locationTree || [];
    const supplierIndustries = (currentArm as any)?.config?.supplierIndustries || [];
    const buyerIndustries = (currentArm as any)?.config?.buyerIndustries || [];

    const locationDisplay = locationTree.map((p: any) => {
        const cities = p.children?.filter((c: any) => c.isSelected).map((c: any) => c.customLabel || c.title).join('، ');
        return cities ? `${p.title} (${cities})` : null;
    }).filter(Boolean).join(' | ') || 'تعیین نشده';

    return (
        <div className="space-y-6 max-w-2xl">
            <ReadonlyField label="شناسه بازار (اسلاگ)" value={currentArm?.slug || ''} icon={Globe} />
            <p className="text-[10px] text-on-surface-variant/60 -mt-4">فقط توسط مدیر سیستم قابل تغییر است</p>

            <Field label="نام بازار">
                <input type="text" value={settings.name} onChange={e => updateSetting(['name'], e.target.value)}
                       className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            </Field>
            <Field label="شعار" hint="مثال: قیمت امروز فروشندگان عمده">
                <input type="text" value={settings.slogan} onChange={e => updateSetting(['slogan'], e.target.value)}
                       className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            </Field>
            <Field label="توضیحات">
                <textarea value={settings.description} onChange={e => updateSetting(['description'], e.target.value)} rows={3}
                          className="w-full bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
            </Field>
            <Field label="ماموریت">
                <textarea value={settings.mission} onChange={e => updateSetting(['mission'], e.target.value)} rows={2}
                          className="w-full bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
            </Field>

            <Field label="لوگوی بازار">
                <div className="flex items-center gap-4">
                    <FileUploader value={logoFileId} onFileSelect={(file) => { setSelectedLogoFile(file); setHasChanges(true); }} onRemove={() => { setSelectedLogoFile(null); setLogoFileId(undefined); setHasChanges(true); }} rounded={false} width={120} height={80} />
                    <div className="text-xs text-on-surface-variant">
                        {selectedLogoFile ? <span className="text-green-600">تصویر جدید انتخاب شد</span> : logoFileId ? <span>لوگو آپلود شده</span> : <span>برای آپلود کلیک کنید</span>}
                        <p className="mt-1">پیشنهاد: ۲۰۰×۸۰ پیکسل</p>
                    </div>
                </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="رنگ اصلی"><ColorInput value={settings.colorPrimary} onChange={v => updateSetting(['colorPrimary'], v)} /></Field>
                <Field label="رنگ فرعی"><ColorInput value={settings.colorSecondary} onChange={v => updateSetting(['colorSecondary'], v)} /></Field>
            </div>

            <ReadonlyField label="دامنه جغرافیایی فعالیت" value={locationDisplay} icon={MapPin} />
            <p className="text-[10px] text-on-surface-variant/60 -mt-4">فقط توسط مدیر سیستم قابل تغییر است</p>

            <ReadonlyField label="صنوف تامین‌کنندگان" value={supplierIndustries.map((i: any) => i.title).join('، ') || 'تعیین نشده'} icon={Building2} />
            <ReadonlyField label="صنوف خریداران" value={buyerIndustries.map((i: any) => i.title).join('، ') || 'تعیین نشده'} icon={Building2} />
            <p className="text-[10px] text-on-surface-variant/60 -mt-4">فقط توسط مدیر سیستم قابل تغییر است</p>
        </div>
    );
}