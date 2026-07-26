// components/ad/EditModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Construction, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateAd, useBumpAd } from '@/lib/api/apiHooks';
import { ArmLocationSelector } from '@/app/components/ArmLocationSelector';
import { IranProvinces } from "@/lib/local-data/Iran-provice";


interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    ad: {
        id: string;
        title: string;
        categoryId: string;
        unitPrice: number;
        minQuantity: number;
        unit?: { id: string; title: string; shortCode: string };
        city: string;
        cityCode?: string;
        provinceCode?: string;
        validityDays: number;
        isAnonymous: boolean;
        expiresAt: string;
        availableQuantityBucket?: string;
    };
    onSuccess?: () => void;
}

export function EditModal({ isOpen, onClose, ad, onSuccess }: EditModalProps) {
    const [formData, setFormData] = useState({
        unitPrice: ad.unitPrice.toString(),
        minQuantity: ad.minQuantity.toString(),
        city: ad.city || '',
        cityCode: ad.cityCode || '',
        provinceCode: ad.provinceCode || '',
        validityDays: ad.validityDays.toString(),
        isAnonymous: ad.isAnonymous || false,
        isBumped: false,
        availableQuantity: ad.availableQuantityBucket || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const updateAdMutation = useUpdateAd();
    const bumpAdMutation = useBumpAd();

    if (!isOpen) return null;

    const quantityOptions = [
        { value: 'under_50', label: 'کمتر از ۵۰ تن' },
        { value: '50_to_200', label: '۵۰ تا ۲۰۰ تن' },
        { value: 'over_200', label: 'بیشتر از ۲۰۰ تن' },
    ];

    const validityOptions = [
        { value: '1', label: '۱ روز' },
        { value: '2', label: '۲ روز' },
        { value: '3', label: '۳ روز' },
    ];

    // پیدا کردن شهر فعلی
    const findCityByCode = (cityCode: string) => {
        for (const province of IranProvinces) {
            const city = province.children?.find((c: any) => c.id === cityCode);
            if (city) {
                return {
                    city: city,
                    province: province
                };
            }
        }
        return null;
    };

    const currentCity = formData.city || ad.city || 'نامشخص';
    const currentCityInfo = formData.cityCode ? findCityByCode(formData.cityCode) : null;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
            newErrors.unitPrice = 'قیمت معتبر وارد کنید';
        }
        if (!formData.minQuantity || parseFloat(formData.minQuantity) <= 0) {
            newErrors.minQuantity = 'حداقل خرید را وارد کنید';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            // آپدیت آگهی
            await updateAdMutation.mutateAsync({
                id: ad.id,
                data: {
                    unitPrice: parseFloat(formData.unitPrice),
                    minQuantity: parseFloat(formData.minQuantity),
                    city: formData.city,
                    cityCode: formData.cityCode,
                    provinceCode: formData.provinceCode,
                    validityDays: parseInt(formData.validityDays),
                    isAnonymous: formData.isAnonymous,
                    availableQuantityBucket: formData.availableQuantity as any,
                },
            });

            // اگر نردبان فعال بود
            if (formData.isBumped) {
                try {
                    await bumpAdMutation.mutateAsync(ad.id);
                } catch (bumpError: any) {
                    if (bumpError?.data?.errorCode !== 'INSUFFICIENT_CREDIT') {
                        toast.warning('آگهی ویرایش شد اما نردبان انجام نشد');
                    } else {
                        toast.warning('اعتبار کافی برای نردبان نیست');
                    }
                }
            }

            toast.success('آگهی با موفقیت ویرایش شد');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error?.message || 'خطا در ویرایش آگهی');
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-0 md:p-4">
            <div className="bg-surface w-full h-full md:h-auto md:max-h-[95vh] md:max-w-md md:rounded-lg border-0 md:border border-outline-variant shadow-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex flex-row-reverse items-center justify-between p-4 border-b border-outline-variant bg-white flex-shrink-0">
                    <h3 className="font-headline-sm text-primary">ویرایش آگهی</h3>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:bg-surface-container-high p-1 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Product Identity - Readonly */}
                    <div className="flex items-center gap-3 bg-surface-container-low p-3 border border-outline-variant">
                        <Construction className="w-5 h-5 text-primary" />
                        <span className="font-headline-sm text-on-surface">{ad.title}</span>
                        <span className="text-xs text-on-surface-variant mr-auto">(غیرقابل تغییر)</span>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col gap-1">
                        <label className="font-label-md text-on-surface-variant">قیمت جدید (تومان)</label>
                        <input
                            type="text"
                            dir="ltr"
                            value={formData.unitPrice}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setFormData({ ...formData, unitPrice: value });
                                if (errors.unitPrice) setErrors({ ...errors, unitPrice: undefined });
                            }}
                            className={`w-full h-11 bg-surface-container-lowest border px-3 text-sm font-mono text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all ${
                                errors.unitPrice ? 'border-error' : 'border-outline'
                            }`}
                        />
                        {errors.unitPrice && <p className="text-error text-xs mt-1">{errors.unitPrice}</p>}
                    </div>

                    {/* Min Quantity */}
                    <div className="flex flex-col gap-1">
                        <label className="font-label-md text-on-surface-variant">حداقل خرید ({ad.unit?.shortCode || 'تن'})</label>
                        <input
                            type="text"
                            dir="ltr"
                            value={formData.minQuantity}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setFormData({ ...formData, minQuantity: value });
                                if (errors.minQuantity) setErrors({ ...errors, minQuantity: undefined });
                            }}
                            className={`w-full h-11 bg-surface-container-lowest border px-3 text-sm font-mono text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all ${
                                errors.minQuantity ? 'border-error' : 'border-outline'
                            }`}
                        />
                        {errors.minQuantity && <p className="text-error text-xs mt-1">{errors.minQuantity}</p>}
                    </div>

                    {/* Available Quantity */}
                    <div className="flex flex-col gap-1">
                        <label className="font-label-md text-on-surface-variant">موجودی انبار</label>
                        <select
                            value={formData.availableQuantity}
                            onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
                            className="w-full h-11 bg-surface-container-lowest border px-3 text-sm appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        >
                            <option value="">انتخاب کنید</option>
                            {quantityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1">
                        <label className="font-label-md text-on-surface-variant">شهر بارگیری</label>
                        <div className="flex items-center gap-2 p-2 border border-outline bg-surface-container-lowest">
                            <span className="flex-1 text-sm">{currentCity}</span>
                            <button
                                type="button"
                                onClick={() => setIsLocationModalOpen(true)}
                                className="text-primary hover:bg-primary/10 p-1 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Validity */}
                    <div className="flex flex-col gap-1">
                        <label className="font-label-md text-on-surface-variant">مدت اعتبار</label>
                        <select
                            value={formData.validityDays}
                            onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                            className="w-full h-11 bg-surface-container-lowest border px-3 text-sm appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        >
                            {validityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Anonymous */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="edit-anonymous"
                            checked={formData.isAnonymous}
                            onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                            className="w-5 h-5 border-outline text-primary focus:ring-0"
                        />
                        <label htmlFor="edit-anonymous" className="text-sm text-on-surface">
                            انتشار ناشناس
                        </label>
                    </div>

                    {/* Bump */}
                    <label className="flex items-center gap-3 p-3 bg-primary-container/5 border border-primary/20 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isBumped}
                            onChange={(e) => setFormData({ ...formData, isBumped: e.target.checked })}
                            className="w-5 h-5 text-primary border-outline focus:ring-primary"
                        />
                        <span className="font-label-md text-primary">نردبان در تابلو (مصرف ۱۰ اعتبار)</span>
                    </label>

                    {/* Footer */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant">
                        <button
                            type="submit"
                            disabled={updateAdMutation.isPending}
                            className="w-full py-3 bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {updateAdMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 border border-outline text-on-surface font-medium hover:bg-surface-container-high transition-colors"
                        >
                            انصراف
                        </button>
                    </div>
                </form>
            </div>

            {/* Location Modal */}
            {isLocationModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface w-full max-w-md border border-outline-variant shadow-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold">انتخاب شهر بارگیری</h3>
                            <button
                                onClick={() => setIsLocationModalOpen(false)}
                                className="text-on-surface-variant hover:text-primary"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <ArmLocationSelector
                            provinceCode={formData.provinceCode}
                            cityCode={formData.cityCode}
                            onProvinceChange={(code, label) => {
                                setFormData(prev => ({
                                    ...prev,
                                    provinceCode: code,
                                    city: '',
                                    cityCode: '',
                                }));
                            }}
                            onCityChange={(code, label) => {
                                setFormData(prev => ({
                                    ...prev,
                                    cityCode: code,
                                    city: label,
                                }));
                            }}
                            error={errors.city}
                        />

                        <div className="flex gap-3 mt-4 pt-3 border-t border-outline-variant">
                            <button
                                type="button"
                                onClick={() => setIsLocationModalOpen(false)}
                                className="flex-1 h-10 border border-outline text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!formData.cityCode) {
                                        setErrors({ ...errors, city: 'لطفاً شهر را انتخاب کنید' });
                                        return;
                                    }
                                    setIsLocationModalOpen(false);
                                }}
                                className="flex-1 h-10 bg-primary text-sm text-on-primary hover:bg-primary/90 transition-colors"
                            >
                                تأیید
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}