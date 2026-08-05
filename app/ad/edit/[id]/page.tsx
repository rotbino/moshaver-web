// app/ad/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { FormHeader } from '@/app/components';
import { useAd, useUpdateAd, useBumpAd } from '@/lib/api/apiHooks';
import { toast } from 'sonner';
import {
    Package, MapPin, Clock, TrendingUp, ChevronDown, ChevronUp,
    Edit2, Shield, FileText, ArrowLeft, Save, X, Eye,
    Loader2, Building2, User, Verified,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NumberInput } from "@/components/common";
import { ArmLocationSelector } from '@/app/components/ArmLocationSelector';
import Image from 'next/image';
import Link from 'next/link';

const validityOptions = [
    { value: '1', label: '۱ روز' },
    { value: '2', label: '۲ روز' },
    { value: '3', label: '۳ روز' },
];

export default function EditAdPage() {
    const router = useRouter();
    const params = useParams();
    const adId = params.id as string;
    const { currentArm } = useSelector((state: RootState) => state.arm);

    const { data: ad, isLoading: adLoading, refetch } = useAd(adId);
    const updateAdMutation = useUpdateAd();
    const bumpAdMutation = useBumpAd();

    const [formData, setFormData] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const unitShortCode = ad?.unit?.shortCode || 'تن';
    const alreadyBumped = ad?.isBumped || false;
    const bumpExpiresAt = ad?.bumpExpiresAt ? new Date(ad.bumpExpiresAt) : null;
    // ✅ نمایش تاریخ و ساعت پایان نردبان
    const bumpExpiresAtLabel = bumpExpiresAt ? bumpExpiresAt.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }) : '';

    // Initialize form when ad loads
    useEffect(() => {
        if (ad) {
            setFormData({
                unitPrice: ad.unitPrice || 0,
                availableQuantity: ad.availableQuantity || 0,
                minQuantity: ad.minQuantity || 0,
                validityHours: ad.validityHours?.toString() || '1',
                isAnonymous: ad.isAnonymous || false,
                isBumped: ad.isBumped || false,
                city: ad.city || '',
                cityCode: ad.cityCode || '',
                provinceCode: ad.provinceCode || '',
                description: ad.description || '',
                productType: ad.productType || '',
                title: ad.title || '',
            });
        }
    }, [ad]);

    // Loading state
    if (adLoading || !formData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.unitPrice || formData.unitPrice <= 0) {
            newErrors.unitPrice = 'قیمت معتبر وارد کنید';
        }
        if (formData.availableQuantity <= 0) {
            newErrors.availableQuantity = 'موجودی معتبر وارد کنید';
        }
        if (formData.minQuantity <= 0) {
            newErrors.minQuantity = 'حداقل حجم فروش معتبر وارد کنید';
        }
        if (formData.minQuantity > formData.availableQuantity) {
            newErrors.minQuantity = 'حداقل حجم فروش نمی‌تواند از موجودی بیشتر باشد';
        }
        if (!formData.cityCode) {
            newErrors.city = 'شهر بارگیری را انتخاب کنید';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSaving(true);

        try {
            await updateAdMutation.mutateAsync({
                id: adId,
                data: {
                    unitPrice: formData.unitPrice,
                    availableQuantity: formData.availableQuantity,
                    minQuantity: formData.minQuantity,
                    validityHours: parseInt(formData.validityHours),
                    isAnonymous: formData.isAnonymous,
                    city: formData.city,
                    cityCode: formData.cityCode,
                    provinceCode: formData.provinceCode,
                    description: formData.description,
                    productType: formData.productType,
                    title: formData.title,
                },
            });

            if (!alreadyBumped && formData.isBumped) {
                try {
                    await bumpAdMutation.mutateAsync(adId);
                } catch (bumpError: any) {
                    toast.warning('آگهی ویرایش شد اما نردبان فعال نشد');
                }
            }

            toast.success('آگهی با موفقیت ویرایش شد');
            router.push('/profile');
        } catch (error: any) {
            toast.error(error?.message || 'خطا در ویرایش آگهی');
        } finally {
            setIsSaving(false);
        }
    };

    const currentCityLabel = formData.city || ad?.city || 'انتخاب شهر...';
    const unitName = ad?.unit?.shortCode || 'تن';
    const currencySymbol = 'تومان';

    // ─── Preview Card ───
    const PreviewCard = () => (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm sticky top-20">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                پیش‌نمایش آگهی
            </h3>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
                <div className="relative h-32 bg-gray-100 dark:bg-gray-800">
                    {ad?.files?.[0] ? (
                        <Image
                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${ad.files[0].id}/thumbnail`}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <Package className="w-10 h-10" />
                        </div>
                    )}
                </div>
                <div className="p-3 space-y-2">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                        {formData.productType || formData.title || 'عنوان آگهی'}
                    </h4>
                    <div className="flex items-baseline gap-1">
                        <span className="font-bold text-lg text-primary">
                            {formData.unitPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">تومان/{unitName}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>حداقل: {formData.minQuantity} {unitName}</span>
                        <span>موجودی: {formData.availableQuantity} {unitName}</span>
                    </div>
                    {formData.isAnonymous && (
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">ناشناس</span>
                    )}
                    {formData.isBumped && (
                        <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full text-amber-700">نردبان</span>
                    )}
                </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">تغییرات را مشاهده کنید</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-surface dark:bg-gray-950 pb-20">
            <FormHeader title="ویرایش آگهی" backUrl="/profile" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ستون فرم */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* شناسنامه کالا */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                {ad?.files?.[0] && (
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${ad.files[0].id}/thumbnail`}
                                            alt=""
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Package className="w-5 h-5 text-primary" />
                                        <span className="font-bold text-sm text-on-surface dark:text-gray-100">
                                            {ad?.productType || ad?.title}
                                        </span>
                                        {ad?.category?.title && (
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                {ad.category.title}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <span>دسته‌بندی: {ad?.category?.title || '—'}</span>
                                        <Shield className="w-3.5 h-3.5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* قیمت و موجودی */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                        قیمت (تومان) <span className="text-error">*</span>
                                    </label>
                                    <NumberInput
                                        value={formData.unitPrice || undefined}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, unitPrice: val || 0 }));
                                            if (errors.unitPrice) setErrors(prev => ({ ...prev, unitPrice: '' }));
                                        }}
                                        unit="تومان"
                                        className="h-11 bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant dark:border-gray-700 rounded-lg px-3 text-sm font-mono text-right"
                                    />
                                    {errors.unitPrice && <p className="text-error text-xs mt-1">{errors.unitPrice}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                        موجودی ({unitName}) <span className="text-error">*</span>
                                    </label>
                                    <NumberInput
                                        value={formData.availableQuantity || undefined}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, availableQuantity: val || 0 }));
                                            if (errors.availableQuantity) setErrors(prev => ({ ...prev, availableQuantity: '' }));
                                        }}
                                        unit={unitName}
                                        className="h-11 bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant dark:border-gray-700 rounded-lg px-3 text-sm font-mono text-right"
                                    />
                                    {errors.availableQuantity && <p className="text-error text-xs mt-1">{errors.availableQuantity}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                        حداقل حجم فروش ({unitName}) <span className="text-error">*</span>
                                    </label>
                                    <NumberInput
                                        value={formData.minQuantity || undefined}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, minQuantity: val || 0 }));
                                            if (errors.minQuantity) setErrors(prev => ({ ...prev, minQuantity: '' }));
                                        }}
                                        unit={unitName}
                                        className="h-11 bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant dark:border-gray-700 rounded-lg px-3 text-sm font-mono text-right"
                                    />
                                    {errors.minQuantity && <p className="text-error text-xs mt-1">{errors.minQuantity}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ✅ تنظیمات انتشار (جایگزین تنظیمات پیشرفته) */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                    <Clock className="w-3.5 h-3.5 inline-block ml-1" />
                                    مدت اعتبار قیمت
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {validityOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, validityHours: opt.value }))}
                                            className={cn(
                                                "py-2 rounded-lg text-sm font-medium border-2 transition-all",
                                                formData.validityHours === opt.value
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary/30"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={cn(
                                "flex items-center justify-between p-3 bg-surface-container-lowest dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg",
                                alreadyBumped && "opacity-70"
                            )}>
                                <div>
                                    <span className="text-sm font-medium text-on-surface dark:text-gray-200">نردبان (بالاترین نمایش)</span>
                                    <p className="text-[11px] text-gray-500">
                                        {alreadyBumped ? (
                                            <>تا تاریخ <span className="font-bold text-primary">{bumpExpiresAtLabel}</span> فعال است</>
                                        ) : (
                                            'مصرف ۱۰ اعتبار'
                                        )}
                                    </p>
                                </div>
                                {alreadyBumped ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        فعال
                                    </span>
                                ) : (
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isBumped}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isBumped: e.target.checked }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-primary transition-colors" />
                                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                                    </label>
                                )}
                            </div>

                            <label className="flex items-center justify-between cursor-pointer select-none">
                                <span className="text-sm font-medium text-on-surface dark:text-gray-200">انتشار ناشناس</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAnonymous}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-primary transition-colors" />
                                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                                </div>
                            </label>
                        </div>

                        {/* موقعیت و توضیحات */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                    <MapPin className="w-3.5 h-3.5 inline-block ml-1" />
                                    شهر بارگیری <span className="text-error">*</span>
                                </label>
                                <div className="flex items-center gap-2 p-2.5 border border-outline-variant dark:border-gray-700 rounded-lg bg-surface-container-lowest dark:bg-gray-800">
                                    <span className="flex-1 text-sm text-on-surface dark:text-gray-200">{currentCityLabel}</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsLocationModalOpen(true)}
                                        className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {errors.city && <p className="text-error text-xs mt-1">{errors.city}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                    <FileText className="w-3.5 h-3.5 inline-block ml-1" />
                                    توضیحات <span className="text-gray-400">(اختیاری)</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    placeholder="توضیحات تکمیلی درباره کالا، شرایط فروش، کیفیت و ..."
                                    className="w-full bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-right resize-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                />
                                <p className="text-[10px] text-gray-400 text-right mt-1">
                                    {formData.description.length > 0 ? `${formData.description.length} کاراکتر` : 'اختیاری'}
                                </p>
                            </div>
                        </div>

                        {/* دکمه‌های عملیاتی */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => router.back()}
                                className="flex-1 h-11 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                انصراف
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="flex-[2] h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        ذخیره تغییرات
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ستون پیش‌نمایش (دسکتاپ) */}
                    <div className="hidden lg:block">
                        <PreviewCard />
                    </div>

                    {/* پیش‌نمایش موبایل (در پایین صفحه) */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 p-3 z-40 flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm"
                        >
                            انصراف
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
                        </button>
                    </div>
                </div>
            </main>

            {/* Location Modal */}
            {isLocationModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                            <h3 className="text-sm font-semibold text-on-surface dark:text-gray-100">انتخاب شهر بارگیری</h3>
                            <button onClick={() => setIsLocationModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-4">
                            <ArmLocationSelector
                                provinceCode={formData.provinceCode}
                                cityCode={formData.cityCode}
                                onProvinceChange={(code, label) => {
                                    setFormData(prev => ({ ...prev, provinceCode: code, city: '', cityCode: '' }));
                                }}
                                onCityChange={(code, label) => {
                                    setFormData(prev => ({ ...prev, cityCode: code, city: label }));
                                }}
                                error={errors.city}
                            />
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                            <div className="flex gap-3">
                                <button onClick={() => setIsLocationModalOpen(false)} className="flex-1 h-10 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    انصراف
                                </button>
                                <button
                                    onClick={() => {
                                        if (!formData.cityCode) {
                                            setErrors({ ...errors, city: 'لطفاً شهر را انتخاب کنید' });
                                            return;
                                        }
                                        setIsLocationModalOpen(false);
                                    }}
                                    className="flex-1 h-10 bg-primary text-sm text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    تأیید
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}