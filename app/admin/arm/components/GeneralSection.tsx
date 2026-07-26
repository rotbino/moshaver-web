// app/admin/arm/components/GeneralSection.tsx
'use client';

import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { FileUploader } from '@/components/common/FileUploader';
import { useUploadFile } from '@/lib/api/apiHooks';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

interface GeneralSectionProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    armId?: string;
}


const THEME_PRESETS = [
    {
        id: 'crimson',
        label: 'زرشکی',
        primary: '#8b0000',
        spectrum: ['#4a0000', '#8b0000', '#c62828', '#e57373', '#ffcdd2'],
    },
    {
        id: 'navy',
        label: 'سرمه‌ای',
        primary: '#1a237e',
        spectrum: ['#0d1137', '#1a237e', '#283593', '#5c6bc0', '#c5cae9'],
    },
    {
        id: 'teal',
        label: 'سبز دریایی',
        primary: '#00695c',
        spectrum: ['#003d33', '#00695c', '#00897b', '#4db6ac', '#b2dfdb'],
    },
    {
        id: 'orange',
        label: 'نارنجی',
        primary: '#e65100',
        spectrum: ['#7a2e00', '#e65100', '#f57c00', '#ffb74d', '#ffe0b2'],
    },
    {
        id: 'purple',
        label: 'بنفش',
        primary: '#4a148c',
        spectrum: ['#2a0d54', '#4a148c', '#7b1fa2', '#ba68c8', '#e1bee7'],
    },
    {
        id: 'green',
        label: 'سبز',
        primary: '#1b5e20',
        spectrum: ['#0d3311', '#1b5e20', '#2e7d32', '#66bb6a', '#c8e6c9'],
    },
    {
        id: 'brown',
        label: 'قهوه‌ای',
        primary: '#4e342e',
        spectrum: ['#2a1c18', '#4e342e', '#6d4c41', '#a1887f', '#d7ccc8'],
    },
];
export function GeneralSection({ register, errors, watch, setValue, armId }: GeneralSectionProps) {
    const uploadMutation = useUploadFile();
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const logoFileId = watch('config.general.logoFileId');

    const handleLogoUpload = async (file: File) => {
        if (!armId) { toast.error('ابتدا بازار را ذخیره کنید'); return; }
        if (file.size > 200 * 1024) { toast.error('حجم فایل نباید بیشتر از ۲۰۰ کیلوبایت باشد'); return; }
        setIsUploadingLogo(true);
        try {
            const result = await uploadMutation.mutateAsync({ file, model: 'Arm', modelId: armId, fieldKey: 'logo' });
            setValue('config.general.logoFileId', result.id, { shouldDirty: true });
            setValue('config.general.logoUrl', '', { shouldDirty: true });
            toast.success('لوگو با موفقیت آپلود شد');
        } catch (error: any) {
            toast.error(error?.message || 'خطا در آپلود لوگو');
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleLogoRemove = () => {
        setValue('config.general.logoFileId', undefined, { shouldDirty: true });
        setValue('config.general.logoUrl', '', { shouldDirty: true });
        toast.success('لوگو حذف شد');
    };

    return (
        <div className="space-y-6">
            {/* ═══════════════ اطلاعات پایه ═══════════════ */}
            <div className="bg-surface-container-low p-6 border border-outline-variant rounded-xl">
                <h3 className="text-lg font-semibold mb-4">اطلاعات عمومی بازار</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* slug */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface block">
                            شناسه یکتا (slug) <span className="text-primary">*</span>
                        </label>
                        <input
                            {...register('slug', { required: 'شناسه یکتا الزامی است' })}
                            placeholder="barton"
                            className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                        {errors.slug && <p className="text-error text-xs">{errors.slug.message as string}</p>}
                    </div>

                    {/* name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface block">
                            نام بازار <span className="text-primary">*</span>
                        </label>
                        <input
                            {...register('name', { required: 'نام بازار الزامی است' })}
                            placeholder="بارتون"
                            className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                        {errors.name && <p className="text-error text-xs">{errors.name.message as string}</p>}
                    </div>

                    {/* shortName */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface block">نام کوتاه</label>
                        <input
                            {...register('shortName')}
                            placeholder="بارتون"
                            className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>

                    {/* slogan */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface block">
                            شعار <span className="text-primary">*</span>
                        </label>
                        <input
                            {...register('slogan', { required: 'شعار الزامی است' })}
                            placeholder="قیمت امروز فروشندگان عمده مصالح ساختمانی"
                            className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                        {errors.slogan && <p className="text-error text-xs">{errors.slogan.message as string}</p>}
                    </div>

                    {/* status - فقط برای غیرفعال کردن سایت */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-on-surface block">وضعیت بازار</label>
                        <select
                            {...register('status')}
                            className="w-full bg-surface-container-lowest border border-outline rounded-lg h-10 px-3 text-sm text-right appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        >
                            <option value="active">فعال</option>
                            <option value="draft">پیش‌نویس</option>
                            <option value="archived">بایگانی</option>
                        </select>
                        <p className="text-[10px] text-on-surface-variant/60">برای غیرفعال‌سازی موقت بازار (تعمیرات)</p>
                    </div>

                    {/* description */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-on-surface block">توضیحات</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            placeholder="توضیحات کامل بازار..."
                            className="w-full bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-sm text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                        />
                    </div>

                    {/* mission */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-on-surface block">مأموریت</label>
                        <textarea
                            {...register('mission')}
                            rows={2}
                            placeholder="مأموریت و هدف بازار..."
                            className="w-full bg-surface-container-lowest border border-outline rounded-lg px-3 py-2 text-sm text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* ═══════════════ لوگو ═══════════════ */}
            {armId && (
                <div className="bg-surface-container-low p-6 border border-outline-variant rounded-xl">
                    <h3 className="text-lg font-semibold mb-1">لوگوی بازار</h3>
                    <p className="text-xs text-on-surface-variant mb-4">
                        لوگو در هدر سایت نمایش داده می‌شود. سایز پیشنهادی: ۲۰۰×۸۰ پیکسل، پس‌زمینه شفاف
                    </p>

                    <div className="flex items-start gap-4">
                        <FileUploader
                            value={logoFileId}
                            onFileSelect={handleLogoUpload}
                            onRemove={handleLogoRemove}
                            rounded={false}
                            width={120}
                            height={120}
                            disabled={isUploadingLogo}
                        />

                        <div className="flex-1 space-y-2">
                            {isUploadingLogo && (
                                <div className="flex items-center gap-2 text-sm text-primary">
                                    <Loader2 className="w-4 h-4 animate-spin" />در حال آپلود لوگو...
                                </div>
                            )}
                            {logoFileId && !isUploadingLogo && (
                                <p className="text-sm text-green-600 flex items-center gap-1"><Upload className="w-4 h-4" />لوگو آپلود شد</p>
                            )}
                            {!logoFileId && !isUploadingLogo && (
                                <p className="text-sm text-on-surface-variant">برای آپلود لوگو کلیک کنید</p>
                            )}
                            <div className="text-xs text-on-surface-variant space-y-1">
                                <p>• فرمت‌های مجاز: PNG, JPG, SVG, WebP</p>
                                <p>• حداکثر حجم: ۲۰۰ کیلوبایت</p>
                                <p>• پس‌زمینه شفاف پیشنهاد می‌شود</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* رنگ تم */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-on-surface block">انتخاب تم بازار</label>
                <div className="flex flex-wrap gap-3">
                    {THEME_PRESETS.map((preset) => {
                        const isActive = (watch('colorPrimary') || '#8b0000') === preset.primary;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => setValue('colorPrimary', preset.primary, { shouldDirty: true })}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                                    isActive ? 'border-primary shadow-md scale-105' : 'border-outline-variant/30'
                                }`}
                            >
                                {/* نوار طیف رنگی */}
                                <div className="flex h-8 rounded-lg overflow-hidden shadow-sm" style={{ width: '120px' }}>
                                    {preset.spectrum.map((color, i) => (
                                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-on-surface">{preset.label}</span>
                                {isActive && (
                                    <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">انتخاب شده</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}