// app/profile/components/AdsList.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import {
    PlusCircle, Package, Pencil, Clock, TrendingUp, X, ClipboardList,
    Power, PowerOff, AlertCircle, Archive, RefreshCw, Trash2,
    ChevronDown, ChevronUp
} from 'lucide-react';
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
    businessId?: string;
    onRefreshClick: (ad: any) => void;
    onEditClick: (ad: any) => void;
    onRepublishClick: (ad: any) => void;
    onToggleActive?: (ad: any) => void;
    onDeleteClick?: (ad: any) => void;
    maxActiveAds?: number;
    creditBalance?: number;
    bumpCost?: number;
}

function timeLeft(expiresAt: string) {
    const hours = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60));
    if (hours <= 0) return 'منقضی';
    if (hours < 24) return `${hours} ساعت`;
    const days = Math.floor(hours / 24);
    return `${days} روز`;
}

function isAdExpired(ad: any): boolean {
    if (ad.status === 'expired') return true;
    return new Date(ad.expiresAt).getTime() < Date.now();
}

const CURRENCY_MAP: Record<string, string> = {
    IRR: 'تومان', IRR1: 'ریال', USD: 'دلار', EUR: 'یورو',
};

type TabType = 'active' | 'inactive' | 'expired';

export default function AdsList({
                                    ads, totalAds, activeAds, expiredAds,
                                    businessId,
                                    onRefreshClick, onEditClick, onRepublishClick,
                                    onToggleActive,
                                    onDeleteClick,
                                    maxActiveAds = 5,
                                    creditBalance = 0,
                                    bumpCost = 10,
                                }: AdsListProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const bulkUpdateMutation = useBulkUpdateAd();

    const armConfig = useSelector((state: RootState) => state.arm.currentArm?.config) as any || {};
    const currency = armConfig?.economy?.currency || 'IRR';
    const currencyUnit = CURRENCY_MAP[currency] || currency || 'تومان';

    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [groupEditOpen, setGroupEditOpen] = useState(false);
    const [priceChanges, setPriceChanges] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ ad: any; open: boolean }>({ ad: null, open: false });
    const [deactivateConfirm, setDeactivateConfirm] = useState<{ ad: any; open: boolean }>({ ad: null, open: false });

    // تفکیک آگهی‌ها به سه دسته
    const activeAdsList = useMemo(() =>
            ads.filter(ad => !isAdExpired(ad) && ad.status === 'active'),
        [ads]
    );

    const inactiveAdsList = useMemo(() =>
            ads.filter(ad => !isAdExpired(ad) && ad.status === 'inactive'),
        [ads]
    );

    const expiredAdsList = useMemo(() =>
            ads.filter(ad => isAdExpired(ad)),
        [ads]
    );

    const reallyActiveCount = activeAdsList.length;
    const currentList = activeTab === 'active' ? activeAdsList : activeTab === 'inactive' ? inactiveAdsList : expiredAdsList;

    const openGroupEdit = () => {
        if (activeTab === 'expired') {
            toast.info('ویرایش گروهی فقط برای آگهی‌های فعال امکان‌پذیر است.');
            return;
        }
        const initial: Record<string, string> = {};
        // فقط آگهی‌های فعال واقعی (نه منقضی)
        const targetAds = activeAdsList;
        targetAds.forEach(ad => { initial[ad.id] = ad.unitPrice?.toString() || ''; });
        setPriceChanges(initial);
        setGroupEditOpen(true);
    };

    const handleGroupSave = async () => {
        setSaving(true);
        try {
            const updates = currentList
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

    const handleDeleteConfirm = (ad: any) => {
        setDeleteConfirm({ ad, open: true });
    };

    const handleDelete = async () => {
        if (!deleteConfirm.ad) return;
        try {
            onDeleteClick?.(deleteConfirm.ad);
            setDeleteConfirm({ ad: null, open: false });
        } catch (error: any) {
            toast.error(error?.message || 'خطا در حذف آگهی');
        }
    };

    const handleDeactivateConfirm = (ad: any) => {
        setDeactivateConfirm({ ad, open: true });
    };

    const handleDeactivate = () => {
        if (!deactivateConfirm.ad) return;
        onToggleActive?.(deactivateConfirm.ad);
        setDeactivateConfirm({ ad: null, open: false });
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

    // محاسبه تعداد آگهی‌های فعال واقعی (نه منقضی و نه غیرفعال)
    const availableSlots = maxActiveAds - reallyActiveCount;

    return (
        <>
            <div>
                {/* هدر ابزار */}
                {/* هدر ابزار - واکنش‌گرا برای موبایل */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 bg-surface-container-lowest dark:bg-gray-800/50 border border-outline-variant/20 dark:border-gray-700 rounded-lg px-3 py-2">
                    {/* ردیف اول: اطلاعات و وضعیت سهمیه */}
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[12px] font-semibold text-on-surface dark:text-gray-200 flex items-center gap-1.5">
                            آگهی‌های من
                            <span className="text-[10px] font-normal text-on-surface-variant/60">
                ({reallyActiveCount}/{maxActiveAds} فعال)
            </span>
                        </h3>
                        {reallyActiveCount >= maxActiveAds && (
                            <span className="flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                <AlertCircle className="w-3 h-3" />
                سهمیه پر است
            </span>
                        )}
                        {availableSlots > 0 && (
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                {availableSlots} جایگاه خالی
            </span>
                        )}
                    </div>

                    {/* ردیف دوم: دکمه‌ها */}
                    <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                        {activeTab !== 'expired' && currentList.length > 0 && (
                            <button onClick={openGroupEdit} className="h-7 sm:h-8 px-2 sm:px-3 bg-primary text-on-primary text-[10px] sm:text-xs rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 font-medium shadow-sm whitespace-nowrap">
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span className="">آپدیت گروهی</span>

                            </button>
                        )}
                        <button onClick={() => router.push('/ad/create')} className="h-7 sm:h-8 px-2 sm:px-3 bg-primary text-on-primary text-[10px] sm:text-xs rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1 font-medium shadow-sm whitespace-nowrap">
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span className="">جدید</span>
                                                   </button>
                    </div>
                </div>

                {/* تب‌ها */}
                <div className="flex border-b border-outline-variant/30 dark:border-gray-700 mb-4">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                            activeTab === 'active'
                                ? "border-primary text-primary"
                                : "border-transparent text-on-surface-variant hover:text-on-surface dark:hover:text-gray-300"
                        )}
                    >
                        فعال
                        <span className="mr-1.5 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">{activeAdsList.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('inactive')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                            activeTab === 'inactive'
                                ? "border-primary text-primary"
                                : "border-transparent text-on-surface-variant hover:text-on-surface dark:hover:text-gray-300"
                        )}
                    >
                        غیرفعال
                        <span className="mr-1.5 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-[10px]">{inactiveAdsList.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('expired')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                            activeTab === 'expired'
                                ? "border-primary text-primary"
                                : "border-transparent text-on-surface-variant hover:text-on-surface dark:hover:text-gray-300"
                        )}
                    >
                        منقضی
                        <span className="mr-1.5 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-[10px]">{expiredAdsList.length}</span>
                    </button>
                </div>

                {/* لیست آگهی‌ها */}
                <div className="space-y-2">
                    {currentList.length === 0 && (
                        <div className="text-center py-8 text-on-surface-variant/60 dark:text-gray-500 text-sm">
                            {activeTab === 'active' && 'هیچ آگهی فعالی وجود ندارد.'}
                            {activeTab === 'inactive' && 'هیچ آگهی غیرفعالی وجود ندارد.'}
                            {activeTab === 'expired' && 'هیچ آگهی منقضی شده‌ای وجود ندارد.'}
                        </div>
                    )}
                    {currentList.map((ad: any) => {
                        const adImage = ad.files?.find((f: any) => f.fieldKey?.startsWith('ad-image'));
                        const imageUrl = adImage
                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${adImage.id}/thumbnail`
                            : '/images/no_product_image.jpg';
                        const unit = ad.unit?.shortCode || 'تن';
                        const category = ad.category?.title;
                        const productType = ad.productType || ad.title;
                        const remaining = timeLeft(ad.expiresAt);
                        const expired = isAdExpired(ad);
                        const isActive = ad.status === 'active' && !expired;
                        const isInactive = ad.status === 'inactive' && !expired;

                        return (
                            <div
                                key={ad.id}
                                className={cn(
                                    "border rounded-lg p-4 transition-all",
                                    isActive
                                        ? "bg-white dark:bg-gray-900 border-outline-variant/30 dark:border-gray-800 hover:shadow-sm"
                                        : isInactive
                                            ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/60 dark:border-amber-800/30"
                                            : "bg-gray-50/80 dark:bg-gray-800/40 border-gray-200/60 dark:border-gray-700/60 opacity-70"
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
                                        {/* برچسب وضعیت */}
                                        {expired && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <span className="text-[8px] font-bold text-white bg-red-600/80 px-1.5 py-0.5 rounded">منقضی</span>
                                            </div>
                                        )}
                                        {isInactive && (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <span className="text-[8px] font-bold text-white bg-gray-600/80 px-1.5 py-0.5 rounded">غیرفعال</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className={cn(
                                                "font-semibold text-sm sm:text-base truncate",
                                                expired ? "text-gray-500 dark:text-gray-400" : "text-on-surface dark:text-gray-100"
                                            )}>
                                                {productType}
                                            </h4>
                                            {category && (
                                                <span className="text-[10px] bg-surface-container-high dark:bg-gray-800 text-on-surface-variant dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                                                    {category}
                                                </span>
                                            )}
                                            {ad.isBumped && !expired && (
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
                                                {expired ? 'منقضی شده' : remaining}
                                            </span>
                                            <span className={cn(
                                                "font-bold text-sm ml-auto",
                                                expired ? "text-gray-400 dark:text-gray-500" : "text-primary"
                                            )}>
                                                {ad.unitPrice.toLocaleString()}
                                                <span className="text-[10px] font-normal text-on-surface-variant mr-1">ت/{unit}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* اکشن‌ها */}
                                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-outline-variant/10 dark:border-gray-800">
                                    {/* دکمه آپدیت (تمدید/ورود به تابلو) برای همه */}
                                    <button
                                        onClick={() => {
                                            if (expired || isInactive) {
                                                onRepublishClick(ad);
                                            } else {
                                                onRefreshClick(ad);
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-[#1e293b] dark:bg-[#e2e8f0] text-white dark:text-[#0f172a] text-[11px] rounded-md font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        تمدید
                                    </button>

                                    {/* دکمه ویرایش برای همه */}
                                    <button onClick={() => onEditClick(ad)} className="p-1.5 border border-outline dark:border-gray-600 text-on-surface dark:text-gray-300 rounded-md hover:bg-surface-container-low transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>

                                    {/* دکمه‌های فعال/غیرفعال (جایگزین سویچر) */}
                                    {!expired && onToggleActive && (
                                        <>
                                            {isActive ? (
                                                // آگهی فعال → دکمه غیرفعال با تأیید
                                                <button
                                                    onClick={() => handleDeactivateConfirm(ad)}
                                                    className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-md text-[11px] font-medium hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors flex items-center gap-1"
                                                >
                                                    <PowerOff className="w-3.5 h-3.5" />

                                                </button>
                                            ) : (
                                                // آگهی غیرفعال → دکمه فعال (بدون تأیید)
                                                <button
                                                    onClick={() => onToggleActive(ad)}
                                                    className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 rounded-md text-[11px] font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors flex items-center gap-1"
                                                >
                                                    <Power className="w-3.5 h-3.5" />
                                                    فعال
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {/* دکمه حذف برای همه */}
                                    <button
                                        onClick={() => handleDeleteConfirm(ad)}
                                        className="p-1.5 border border-outline dark:border-gray-600 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                        title="حذف آگهی"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* هشدارها (در صورت نیاز) */}
                                {(isInactive || expired) && reallyActiveCount >= maxActiveAds && (
                                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-md text-[10px] text-blue-700 dark:text-blue-300 flex items-center gap-2 flex-wrap">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>
                                            سهمیه آگهی فعال شما پر است. در صورت فعال کردن این آگهی، <span className="font-bold">{bumpCost}</span> اعتبار از حساب شما کسر خواهد شد.
                                        </span>
                                        {isInactive && (
                                            <button
                                                onClick={() => onToggleActive?.(ad)}
                                                className="text-primary underline font-medium hover:no-underline text-[10px]"
                                            >
                                                فعال‌سازی با اعتبار
                                            </button>
                                        )}
                                    </div>
                                )}
                                {(isInactive || expired) && reallyActiveCount < maxActiveAds && creditBalance < bumpCost && (
                                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-md text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>
                                            اعتبار کافی برای فعال‌سازی آگهی ندارید. لطفاً{' '}
                                            <button
                                                onClick={() => router.push('/credit/purchase')}
                                                className="text-primary underline font-medium hover:no-underline"
                                            >
                                                اعتبار خریداری کنید
                                            </button>
                                            .
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* مودال تأیید حذف */}
            {deleteConfirm.open && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-md border border-outline-variant/20 dark:border-gray-800 shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="text-base font-bold text-on-surface dark:text-gray-100">حذف آگهی</h3>
                        </div>
                        <p className="text-sm text-on-surface-variant dark:text-gray-400 mb-6">
                            آیا از حذف آگهی «{deleteConfirm.ad?.productType || deleteConfirm.ad?.title}» اطمینان دارید؟
                            این عملیات قابل بازگشت نیست.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ ad: null, open: false })}
                                className="flex-1 h-10 border border-outline-variant dark:border-gray-700 text-on-surface dark:text-gray-200 rounded-md text-sm font-medium hover:bg-surface-container-low dark:hover:bg-gray-800 transition-colors"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 h-10 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* مودال تأیید غیرفعال‌سازی */}
            {deactivateConfirm.open && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-md border border-outline-variant/20 dark:border-gray-800 shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="text-base font-bold text-on-surface dark:text-gray-100">غیرفعال کردن آگهی</h3>
                        </div>
                        <p className="text-sm text-on-surface-variant dark:text-gray-400 mb-2">
                            آیا از غیرفعال کردن آگهی «{deactivateConfirm.ad?.productType || deactivateConfirm.ad?.title}» اطمینان دارید؟
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-6">
                            در صورت غیرفعال کردن، این آگهی از تابلو خارج می‌شود و اعتبار مصرف‌شده برای فعال‌سازی آن بازگردانده نمی‌شود.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeactivateConfirm({ ad: null, open: false })}
                                className="flex-1 h-10 border border-outline-variant dark:border-gray-700 text-on-surface dark:text-gray-200 rounded-md text-sm font-medium hover:bg-surface-container-low dark:hover:bg-gray-800 transition-colors"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={handleDeactivate}
                                className="flex-1 h-10 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600 transition-colors"
                            >
                                غیرفعال کن
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* مودال تغییر قیمت گروهی */}
            {groupEditOpen && (
                <div className="fixed inset-0 z-[70] flex flex-col justify-end sm:items-center sm:justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-2xl sm:rounded-md border border-outline-variant/20 dark:border-gray-800 shadow-lg max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 dark:border-gray-800">
                            <h3 className="text-base font-bold text-on-surface dark:text-gray-100">تغییر قیمت گروهی  سریع</h3>
                            <button onClick={() => setGroupEditOpen(false)} className="p-1 hover:bg-surface-container-high rounded-md">
                                <X className="w-5 h-5 text-on-surface-variant" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-3">
                            {currentList.map(ad => {
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