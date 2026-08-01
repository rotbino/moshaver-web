// components/ad/EditModal.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    X, Package, MapPin, Clock, TrendingUp, ChevronDown, ChevronUp,
    Edit2, Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateAd, useBumpAd } from '@/lib/api/apiHooks';
import { ArmLocationSelector } from '@/app/components/ArmLocationSelector';
import { NumberInput } from "@/components/common";
import { cn } from '@/lib/utils';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    ad: any;
    onSuccess?: () => void;
}

const validityOptions = [
    { value: '1', label: '۱ روز' },
    { value: '2', label: '۲ روز' },
    { value: '3', label: '۳ روز' },
];

export function EditModal({ isOpen, onClose, ad, onSuccess }: EditModalProps) {
    const [formData, setFormData] = useState({
        unitPrice: ad.unitPrice || 0,
        availableQuantity: ad.availableQuantity || 0,
        validityHours: ad.validityHours?.toString() || '1',
        isAnonymous: ad.isAnonymous || false,
        isBumped: ad.isBumped || false,
        city: ad.city || '',
        cityCode: ad.cityCode || '',
        provinceCode: ad.provinceCode || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [showMoreSettings, setShowMoreSettings] = useState(false);

    const updateAdMutation = useUpdateAd();
    const bumpAdMutation = useBumpAd();

    const unitShortCode = ad.unit?.shortCode || 'تن';
    const adImages = ad.files?.filter((f: any) => f.fieldKey?.startsWith('ad-image')) || [];
    const firstImage = adImages[0];
    const alreadyBumped = ad.isBumped;

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.unitPrice || formData.unitPrice <= 0) {
            newErrors.unitPrice = 'قیمت معتبر وارد کنید';
        }
        if (formData.availableQuantity <= 0) {
            newErrors.availableQuantity = 'موجودی معتبر وارد کنید';
        }
        if (!formData.cityCode) {
            newErrors.city = 'شهر بارگیری را انتخاب کنید';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await updateAdMutation.mutateAsync({
                id: ad.id,
                data: {
                    unitPrice: formData.unitPrice,
                    availableQuantity: formData.availableQuantity,
                    validityHours: parseInt(formData.validityHours),
                    isAnonymous: formData.isAnonymous,
                    city: formData.city,
                    cityCode: formData.cityCode,
                    provinceCode: formData.provinceCode,
                },
            });

            if (!alreadyBumped && formData.isBumped) {
                try {
                    await bumpAdMutation.mutateAsync(ad.id);
                } catch (bumpError: any) {
                    toast.warning('آگهی ویرایش شد اما نردبان فعال نشد');
                }
            }

            toast.success('آگهی با موفقیت ویرایش شد');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error?.message || 'خطا در ویرایش آگهی');
        }
    };

    const currentCityLabel = formData.city || ad.city || 'انتخاب شهر...';

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-0 md:p-4">
            <div className="bg-white dark:bg-gray-900 w-full h-full md:h-auto md:max-h-[95vh] md:max-w-xl md:rounded-md border-0 md:border border-outline-variant/20 dark:border-gray-800 shadow-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 dark:border-gray-800">
                    <h3 className="text-base font-bold text-on-surface dark:text-gray-100">ویرایش آگهی</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-surface-container-high dark:hover:bg-gray-800 rounded-md transition-colors">
                        <X className="w-5 h-5 text-on-surface-variant dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* شناسنامه کالا (غیرقابل تغییر) + تصویر کوچک */}
                    <div className="bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant/20 dark:border-gray-700 rounded-md p-3 space-y-3">
                        <div className="flex items-center gap-3">
                            {/* تصویر کوچک محصول */}
                            {firstImage && (
                                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-surface-container-high dark:bg-gray-700 border border-outline-variant/20 dark:border-gray-600 flex-shrink-0">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${firstImage.id}/thumbnail`}
                                        alt=""
                                        fill
                                        className="object-contain p-1"
                                        sizes="64px"
                                        unoptimized
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Package className="w-5 h-5 text-primary" />
                                    <span className="font-bold text-sm text-on-surface dark:text-gray-100">
                                        {ad.productType || ad.title}
                                    </span>
                                    {ad.category?.title && (
                                        <span className="text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 px-2 py-0.5 rounded-full">
                                            {ad.category.title}
                                        </span>
                                    )}
                                </div>
                                {/* حداقل خرید (فقط نمایش) */}
                                <div className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400 mt-2">
                                    <span className="font-medium">حداقل خرید:</span>
                                    <span>{ad.minQuantity} {unitShortCode}</span>
                                    <Shield className="w-3.5 h-3.5 text-on-surface-variant/50" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* بخش اصلی ویرایش: قیمت و موجودی */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* قیمت */}
                        <div>
                            <label className="text-xs font-medium text-on-surface-variant dark:text-gray-400 block mb-1">
                                قیمت جدید (تومان) <span className="text-error">*</span>
                            </label>
                            <NumberInput
                                value={formData.unitPrice || undefined}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, unitPrice: val || 0 }));
                                    if (errors.unitPrice) setErrors(prev => ({ ...prev, unitPrice: '' }));
                                }}
                                unit="تومان"
                                className="h-11 bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant dark:border-gray-700 rounded-md px-3 text-sm font-mono text-right"
                            />
                            {errors.unitPrice && <p className="text-error text-xs mt-1">{errors.unitPrice}</p>}
                        </div>

                        {/* موجودی */}
                        <div>
                            <label className="text-xs font-medium text-on-surface-variant dark:text-gray-400 block mb-1">
                                موجودی ({unitShortCode}) <span className="text-error">*</span>
                            </label>
                            <NumberInput
                                value={formData.availableQuantity || undefined}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, availableQuantity: val || 0 }));
                                    if (errors.availableQuantity) setErrors(prev => ({ ...prev, availableQuantity: '' }));
                                }}
                                unit={unitShortCode}
                                className="h-11 bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant dark:border-gray-700 rounded-md px-3 text-sm font-mono text-right"
                            />
                            {errors.availableQuantity && <p className="text-error text-xs mt-1">{errors.availableQuantity}</p>}
                        </div>
                    </div>

                    {/* مدت اعتبار */}
                    <div>
                        <label className="text-xs font-medium text-on-surface-variant dark:text-gray-400 block mb-1">
                            <Clock className="w-3.5 h-3.5 inline-block ml-1" />
                            مدت اعتبار قیمت
                        </label>
                        <select
                            value={formData.validityHours}
                            onChange={(e) => setFormData(prev => ({ ...prev, validityHours: e.target.value }))}
                            className="w-full h-11 bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant dark:border-gray-700 rounded-md px-3 text-sm appearance-none"
                        >
                            {validityOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* نردبان */}
                    <div className={cn(
                        "flex items-center justify-between p-3 bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant/20 dark:border-gray-700 rounded-md",
                        alreadyBumped && "opacity-70"
                    )}>
                        <div>
                            <span className="text-sm font-medium text-on-surface dark:text-gray-200">نردبان (بالاترین نمایش)</span>
                            <p className="text-[11px] text-on-surface-variant dark:text-gray-400">مصرف ۱۰ اعتبار</p>
                        </div>
                        {alreadyBumped ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-primary dark:text-primary-400 bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-full">
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

                    {/* ویرایش سایر مشخصات */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowMoreSettings(!showMoreSettings)}
                            className="w-full flex items-center justify-between p-3 bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant/20 dark:border-gray-700 rounded-md text-sm font-medium text-on-surface dark:text-gray-200"
                        >
                            <span>ویرایش سایر مشخصات</span>
                            {showMoreSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showMoreSettings && (
                            <div className="mt-3 space-y-3 border border-outline-variant/20 dark:border-gray-700 rounded-md p-3">
                                {/* شهر بارگیری */}
                                <div>
                                    <label className="text-xs font-medium text-on-surface-variant dark:text-gray-400 block mb-1">
                                        <MapPin className="w-3.5 h-3.5 inline-block ml-1" />
                                        شهر بارگیری <span className="text-error">*</span>
                                    </label>
                                    <div className="flex items-center gap-2 p-2 border border-outline-variant dark:border-gray-700 rounded-md bg-surface-container-lowest dark:bg-gray-800">
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

                                {/* انتشار ناشناس */}
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
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-3 border-t border-outline-variant/20 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-11 border border-outline-variant dark:border-gray-700 text-on-surface dark:text-gray-200 rounded-md font-medium text-sm hover:bg-surface-container-low dark:hover:bg-gray-800 transition-colors"
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            disabled={updateAdMutation.isPending}
                            className="flex-1 h-11 bg-primary text-on-primary rounded-md font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {updateAdMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Location Modal */}
            {isLocationModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-md border border-outline-variant/20 dark:border-gray-800 shadow-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-on-surface dark:text-gray-100">انتخاب شهر بارگیری</h3>
                            <button onClick={() => setIsLocationModalOpen(false)} className="text-on-surface-variant dark:text-gray-400 hover:text-primary">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

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

                        <div className="flex gap-3 mt-4 pt-3 border-t border-outline-variant/20 dark:border-gray-800">
                            <button onClick={() => setIsLocationModalOpen(false)} className="flex-1 h-10 border border-outline-variant dark:border-gray-700 text-sm text-on-surface dark:text-gray-200 rounded-md hover:bg-surface-container-low dark:hover:bg-gray-800 transition-colors">
                                انصراف
                            </button>
                            <button onClick={() => {
                                if (!formData.cityCode) { setErrors({ ...errors, city: 'لطفاً شهر را انتخاب کنید' }); return; }
                                setIsLocationModalOpen(false);
                            }} className="flex-1 h-10 bg-primary text-sm text-on-primary rounded-md hover:bg-primary/90 transition-colors">
                                تأیید
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}