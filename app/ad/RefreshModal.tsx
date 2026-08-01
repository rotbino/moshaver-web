// components/ad/RefreshModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Construction, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useExtendAd, useBumpAd } from '@/lib/api/apiHooks';

interface RefreshModalProps {
    isOpen: boolean;
    onClose: () => void;
    ad: {
        id: string;
        title: string;
        unitPrice: number;
        unit?: { title: string; shortCode: string };
        minQuantity: number;
        expiresAt: string;
    };
    onSuccess?: () => void;
}

export function RefreshModal({ isOpen, onClose, ad, onSuccess }: RefreshModalProps) {
    const [validityHours, setValidityHours] = useState('1');
    const [isBumped, setIsBumped] = useState(false);

    const extendAdMutation = useExtendAd();
    const bumpAdMutation = useBumpAd();

    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            // تمدید آگهی با همان قیمت
            await extendAdMutation.mutateAsync({
                id: ad.id,
                validityHours: parseInt(validityHours),
            });

            // اگر نردبان هم فعال بود
            if (isBumped) {
                try {
                    await bumpAdMutation.mutateAsync(ad.id);
                } catch (bumpError: any) {
                    if (bumpError?.data?.errorCode !== 'INSUFFICIENT_CREDIT') {
                        toast.warning('آگهی تمدید شد اما نردبان انجام نشد');
                    } else {
                        toast.warning('اعتبار کافی برای نردبان نیست');
                    }
                }
            }

            toast.success('آگهی با موفقیت تمدید شد');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error?.message || 'خطا در تمدید آگهی');
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface w-full max-w-md border border-outline-variant shadow-lg flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-outline-variant">
                    <h3 className="font-headline-sm text-primary">تمدید سریع</h3>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:bg-surface-container-high p-1 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-4">
                    {/* Product Identity */}
                    <div className="flex items-center gap-3 bg-surface-container-low p-3 border border-outline-variant">
                        <Construction className="w-5 h-5 text-primary" />
                        <span className="font-headline-sm text-on-surface">{ad.title}</span>
                    </div>

                    <p className="font-number-data text-primary font-bold text-center py-2">
                        قیمت: {ad.unitPrice.toLocaleString()} تومان
                    </p>

                    <div className="flex flex-col gap-3">
                        {/* Validity Dropdown */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-md text-on-surface-variant">مدت اعتبار</label>
                            <select
                                value={validityHours}
                                onChange={(e) => setValidityHours(e.target.value)}
                                className="w-full h-11 border border-outline bg-transparent font-body-md px-2 focus:ring-primary"
                            >
                                <option value="1">۱ روز</option>
                                <option value="2">۲ روز</option>
                                <option value="3">۳ روز</option>
                            </select>
                        </div>

                        {/* Bump Checkbox */}
                        <label className="flex items-center gap-3 p-3 bg-primary-container/5 border border-primary/20 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isBumped}
                                onChange={(e) => setIsBumped(e.target.checked)}
                                className="w-5 h-5 text-primary border-outline focus:ring-primary"
                            />
                            <span className="font-label-md text-primary">نردبان در تابلو (مصرف ۱۰ اعتبار)</span>
                        </label>

                        {/* Locked Info */}
                        <div className="border border-outline-variant">
                            <div className="flex items-center justify-between p-3 bg-surface-container-low">
                                <span className="font-label-md text-on-surface-variant">سایر مشخصات ثابت</span>
                                <Lock className="w-4 h-4 text-on-surface-variant" />
                            </div>
                            <div className="p-3 text-sm text-on-surface-variant space-y-1">
                                <p>حداقل خرید: {ad.minQuantity} {ad.unit?.shortCode || 'تن'}</p>
                                <p>واحد: {ad.unit?.title || 'تن'}</p>
                                <p>اعتبار فعلی: {Math.ceil((new Date(ad.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} روز</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-outline-variant flex flex-col gap-2">
                    <button
                        onClick={handleConfirm}
                        disabled={extendAdMutation.isPending}
                        className="w-full py-3 bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {extendAdMutation.isPending ? 'در حال تمدید...' : 'تمدید و انتشار'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 border border-outline text-on-surface font-medium hover:bg-surface-container-high transition-colors"
                    >
                        انصراف
                    </button>
                </div>
            </div>
        </div>
    );
}