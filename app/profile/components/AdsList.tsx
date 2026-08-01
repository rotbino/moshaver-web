// app/profile/components/AdsList.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { PlusCircle, Package, Pencil, Clock, TrendingUp, X, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBulkUpdateAd } from '@/lib/api/apiHooks';
import { useQueryClient } from '@tanstack/react-query';
import { RootState } from '@/lib/store/store';
import { NumberInput } from "@/components/common";
import { toast } from 'sonner';

interface AdsListProps {
    ads: any[];
    totalAds: number;
    activeAds: number;
    expiredAds: number;
    businessId?: string;                // ⭐ برای invalidate کش
    onRefreshClick: (ad: any) => void;
    onEditClick: (ad: any) => void;
    onRepublishClick: (ad: any) => void;
}

function timeLeft(expiresAt: string) {
    const hours = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60));
    if (hours <= 0) return 'منقضی';
    if (hours < 24) return `${hours} ساعت`;
    const days = Math.floor(hours / 24);
    return `${days} روز`;
}

const CURRENCY_MAP: Record<string, string> = {
    IRR: 'تومان', IRR1: 'ریال', USD: 'دلار', EUR: 'یورو',
};

export default function AdsList({
                                    ads, totalAds, activeAds, expiredAds,
                                    businessId,
                                    onRefreshClick, onEditClick, onRepublishClick,
                                }: AdsListProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const bulkUpdateMutation = useBulkUpdateAd();

    const armConfig = useSelector((state: RootState) => state.arm.currentArm?.config) as any || {};
    const currency = armConfig?.economy?.currency || 'IRR';
    const currencyUnit = CURRENCY_MAP[currency] || currency || 'تومان';

    const [groupEditOpen, setGroupEditOpen] = useState(false);
    const [priceChanges, setPriceChanges] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const openGroupEdit = () => {
        const initial: Record<string, string> = {};
        ads.forEach(ad => { initial[ad.id] = ad.unitPrice?.toString() || ''; });
        setPriceChanges(initial);
        setGroupEditOpen(true);
    };

    const handleGroupSave = async () => {
        setSaving(true);
        try {
            const updates = ads
                .filter(ad => {
                    const newPrice = priceChanges[ad.id]?.trim();
                    return newPrice && parseFloat(newPrice) !== ad.unitPrice;
                })
                .map(ad => ({
                    id: ad.id,
                    unitPrice: parseFloat(priceChanges[ad.id]),
                }));

            if (updates.length === 0) {
                toast.info('قیمتی تغییر نکرده است.');
                setGroupEditOpen(false);
                return;
            }

            await bulkUpdateMutation.mutateAsync({ updates });

            // invalidate کش business جاری
            if (businessId) {
                queryClient.invalidateQueries({ queryKey: ['business', businessId] });
            }

            setGroupEditOpen(false);
        } catch (error: any) {
            toast.error(error?.message || 'خطا در به‌روزرسانی قیمت‌ها');
        } finally {
            setSaving(false);
        }
    };

    if (totalAds === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-outline-variant/50 dark:border-gray-700 p-8 text-center">
                <Package className="w-12 h-12 text-on-surface-variant/30 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-on-surface-variant dark:text-gray-400">هنوز آگهی ثبت نکرده‌اید</p>
                <button onClick={() => router.push('/ad/create')} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-lg text-sm">ثبت اولین آگهی</button>
            </div>
        );
    }

    return (
        <>
            <div>
                {/* هدر ابزار */}
                <div className="flex items-center justify-between mb-4 bg-surface-container-lowest dark:bg-gray-800/50 border border-outline-variant/20 dark:border-gray-700 rounded-lg px-3 py-2">
                    <h3 className="text-[12px] font-semibold text-on-surface dark:text-gray-200 flex items-center gap-2">
                        آگهی‌های من
                    </h3>
                    <div className="flex items-center gap-1.5">

                        <button onClick={openGroupEdit} className="h-8 px-3 bg-primary text-on-primary text-xs rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5 font-medium shadow-sm">
                            <ClipboardList className="w-3.5 h-3.5" />
                            آپدیت گروهی
                        </button>
                        <button onClick={() => router.push('/ad/create')} className="h-8 px-3 bg-primary text-on-primary text-xs rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5 font-medium shadow-sm">
                            <PlusCircle className="w-3.5 h-3.5" />
                            جدید
                        </button>
                    </div>
                </div>

                {/* لیست آگهی‌ها */}
                <div className="space-y-2">
                    {ads.map((ad: any) => {
                        const adImage = ad.files?.find((f: any) => f.fieldKey?.startsWith('ad-image'));
                        const imageUrl = adImage
                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${adImage.id}/thumbnail`
                            : '/images/no_product_image.jpg';
                        const unit = ad.unit?.shortCode || 'تن';
                        const category = ad.category?.title;
                        const productType = ad.productType || ad.title;
                        const remaining = timeLeft(ad.expiresAt);
                        const isExpired = ad.status !== 'active';

                        return (
                            <div
                                key={ad.id}
                                className={cn(
                                    "bg-white dark:bg-gray-900 border border-outline-variant/30 dark:border-gray-800 rounded-lg p-4 hover:shadow-sm transition-all",
                                    isExpired ? "opacity-60" : ""
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-surface-container-high dark:bg-gray-800 flex-shrink-0">
                                        <Image
                                            src={imageUrl}
                                            alt={productType}
                                            fill
                                            className="object-contain p-1"
                                            sizes="56px"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-sm sm:text-base text-on-surface dark:text-gray-100 truncate">
                                                {productType}
                                            </h4>
                                            {category && (
                                                <span className="text-[10px] bg-surface-container-high dark:bg-gray-800 text-on-surface-variant dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                                                    {category}
                                                </span>
                                            )}
                                            {ad.isBumped && (
                                                <TrendingUp className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0" title="نردبان" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-on-surface-variant dark:text-gray-400 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Package className="w-3.5 h-3.5 text-primary/70" />
                                                حداقل {ad.minQuantity} {unit}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {remaining}
                                            </span>
                                            <span className="font-bold text-primary text-sm ml-auto">
                                                {ad.unitPrice.toLocaleString()}
                                                <span className="text-[10px] font-normal text-on-surface-variant mr-1">ت/{unit}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-outline-variant/10 dark:border-gray-800">
                                    {ad.status === 'active' ? (
                                        <>
                                            <button onClick={() => onRefreshClick(ad)} className="px-3 py-1.5 bg-[#1e293b] dark:bg-[#e2e8f0] text-white dark:text-[#0f172a] text-[11px] rounded-md font-medium">تمدید</button>
                                            <button onClick={() => onEditClick(ad)} className="p-1.5 border border-outline dark:border-gray-600 text-on-surface dark:text-gray-300 rounded-md">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => onRepublishClick(ad)} className="px-4 py-1.5 border border-primary text-primary text-[11px] rounded-md font-medium">
                                            انتشار مجدد
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* مودال تغییر قیمت گروهی */}
            {groupEditOpen && (
                <div className="fixed inset-0 z-[70] flex flex-col justify-end sm:items-center sm:justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-2xl sm:rounded-md border border-outline-variant/20 dark:border-gray-800 shadow-lg max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 dark:border-gray-800">
                            <h3 className="text-base font-bold text-on-surface dark:text-gray-100">تغییر قیمت گروهی ({currencyUnit})</h3>
                            <button onClick={() => setGroupEditOpen(false)} className="p-1 hover:bg-surface-container-high rounded-md">
                                <X className="w-5 h-5 text-on-surface-variant" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-3">
                            {ads.map(ad => {
                                const unit = ad.unit?.shortCode || 'تن';
                                return (
                                    <div key={ad.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                        <span className="flex-1 min-w-[120px] truncate text-on-surface dark:text-gray-200 text-xs sm:text-sm">
                                            {ad.productType || ad.title}
                                            <span className="text-primary dark:text-gray-500 mr-1 text-[11px]">({unit})</span>
                                        </span>
                                        <div className="w-36 sm:w-32">
                                            <NumberInput
                                                value={priceChanges[ad.id] ? parseFloat(priceChanges[ad.id]) : undefined}
                                                onChange={(val) => setPriceChanges(prev => ({ ...prev, [ad.id]: val ? val.toString() : '' }))}
                                                unit={currencyUnit}
                                                unitClassName="text-[9px]"
                                                className="h-9 bg-surface-container-lowest dark:bg-gray-800 border border-outline-variant dark:border-gray-700 rounded-md px-2 text-xs text-center"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-outline-variant/20 dark:border-gray-800 p-4 flex gap-3">
                            <button onClick={() => setGroupEditOpen(false)} className="flex-1 h-10 border border-outline-variant dark:border-gray-700 rounded-md text-sm">انصراف</button>
                            <button onClick={handleGroupSave} disabled={saving} className="flex-1 h-10 bg-primary text-on-primary rounded-md text-sm font-medium disabled:opacity-50">
                                {saving ? 'در حال ذخیره...' : 'اعمال تغییرات'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}