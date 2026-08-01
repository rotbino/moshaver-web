'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { FormHeader } from '@/app/components';
import { useCreateAd, useActiveBusiness, useCreditBalance, useArmCategoryTree, useUploadFile } from '@/lib/api/apiHooks';
import { toast } from 'sonner';
import {
    Package, Send, Edit2, MapPin, Clock,
    ArrowDown, ArrowLeft, ArrowRight, TrendingUp, Plus, Check,
    Settings, Layers, ClipboardCheck, CreditCard, AlertTriangle,
} from 'lucide-react';
import { ArmLocationSelector } from '@/app/components/ArmLocationSelector';
import { NumberInput } from "@/components/common";
import { FileUploader } from '@/components/common/FileUploader';
import { cn } from '@/lib/utils';
import { CategoryGridSelector } from "@/app/ad/CategoryGridSelector";
import { apiService } from '@/lib/api/apiService';

const TOTAL_STEPS = 5;

const stepMeta = [
    { title: 'گروه', icon: Layers },
    { title: 'قیمت', icon: Package },
    { title: 'موقعیت', icon: MapPin },
    { title: 'انتشار', icon: Settings },
    { title: 'بررسی', icon: ClipboardCheck },
];

export default function CreateAdPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { currentSlug, currentArm } = useSelector((state: RootState) => state.arm);
    const { data: business, isLoading: businessLoading } = useActiveBusiness();
    const { data: categoryTree, isLoading: categoriesLoading } = useArmCategoryTree(currentSlug || 'barton');
    const { data: creditBalance, refetch: refetchBalance, isLoading: creditLoading } = useCreditBalance();
    const uploadMutation = useUploadFile();

    const [redirecting, setRedirecting] = useState(false);
    const [activeAdsCount, setActiveAdsCount] = useState(0);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const createAdMutation = useCreateAd();

    const armConfig = currentArm?.config as any || {};
    const priceTable = armConfig.modules?.priceTable || {};

    const currencyUnit = useMemo(() => {
        const code = armConfig.economy?.currency || 'IRR';
        const currencyMap: Record<string, string> = {
            'IRR': 'تومان', 'IRR1': 'ریال', 'USD': 'دلار', 'EUR': 'یورو',
        };
        return currencyMap[code] || code || 'تومان';
    }, [armConfig.economy?.currency]);

    const maxFreeAdsPerMonth = useMemo(() => priceTable.maxFreeAdsPerMonth ?? 5, [priceTable.maxFreeAdsPerMonth]);
    const bumpCost = useMemo(() => priceTable.bumpCost ?? 10, [priceTable.bumpCost]);
    const allowAnonymousPublishing = useMemo(() => priceTable.allowAnonymousPublishing ?? true, [priceTable.allowAnonymousPublishing]);
    const autoApproveAds = useMemo(() => priceTable.autoApproveAds ?? true, [priceTable.autoApproveAds]);
    const adValidityDefaultHours = useMemo(() => priceTable.adValidityDefaultHours ?? 24, [priceTable.adValidityDefaultHours]);
    const maxActiveAdsPerUser = useMemo(() => priceTable.maxActiveAdsPerUser ?? 10, [priceTable.maxActiveAdsPerUser]);
    const maxImagesPerAd = useMemo(() => priceTable.maxImagesPerAd ?? 1, [priceTable.maxImagesPerAd]);

    const [formData, setFormData] = useState({
        categoryId: '',
        productType: '',
        unitPrice: 0,
        minQuantity: 0,
        availableQuantity: 0,
        cityCode: '',
        cityLabel: '',
        provinceCode: '',
        provinceLabel: '',
        validityHours: String(adValidityDefaultHours || 24),
        isAnonymous: false,
        isBumped: false,
    });

    const [adImageFiles, setAdImageFiles] = useState<(File | null)[]>([null]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);

    // ── helpers ──
    const findNodeById = (nodes: any[], id: string): any => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const selectedCategoryData = useMemo(() => {
        if (formData.categoryId && categoryTree) {
            return findNodeById(categoryTree, formData.categoryId);
        }
        return null;
    }, [formData.categoryId, categoryTree]);

    const unitName = selectedCategoryData?.unitTitle || 'تن';
    const categoryExample = selectedCategoryData?.example || '';

    const locationTree = currentArm?.locationTree || [];
    const totalCities = useMemo(() => {
        let count = 0;
        for (const province of locationTree) {
            if (province.children) count += province.children.filter((c: any) => c.type === 'city').length;
        }
        return count;
    }, [locationTree]);

    const hasSingleCity = totalCities === 1;
    const singleCityData = useMemo(() => {
        if (hasSingleCity) {
            for (const province of locationTree) {
                const city = province.children?.find((c: any) => c.type === 'city');
                if (city) return { city, province };
            }
        }
        return null;
    }, [locationTree, hasSingleCity]);

    const isLoading = businessLoading || categoriesLoading || creditLoading;
    const remainingFreeAds = Math.max(0, maxFreeAdsPerMonth - activeAdsCount);
    const isAdFree = remainingFreeAds > 0;
    const hasReachedMaxAds = activeAdsCount >= maxActiveAdsPerUser;

    // ⭐ اعتبارسنجی اولیه: احراز هویت و کسب‌وکار
    useEffect(() => {
        if (!isAuthenticated) {
            setRedirecting(true);
            toast.info('برای ثبت آگهی ابتدا وارد شوید');
            router.replace('/login?redirect=/ad/create');
            return;
        }
        if (!businessLoading && !business) {
            setRedirecting(true);
            toast.info('برای ثبت آگهی، ابتدا در یک دقیقه کسب‌وکار خود را ثبت کنید');
            router.replace('/business/register');
        }
    }, [isAuthenticated, business, businessLoading, router]);

    useEffect(() => {
        const fetchActiveAdsCount = async () => {
            if (!business || !currentSlug) return;
            try {
                const activeAds = business.ads?.filter((ad: any) => ad.status === 'active' && ad.armId === currentArm?.id) || [];
                setActiveAdsCount(activeAds.length);
            } catch (error) { console.error(error); }
        };
        fetchActiveAdsCount();
    }, [business, currentSlug, currentArm]);

    useEffect(() => {
        if (business?.cityCode && !hasSingleCity) {
            setFormData(prev => ({ ...prev, cityCode: business.cityCode || '', cityLabel: business.city || '', provinceCode: business.provinceCode || '', provinceLabel: business.province || '' }));
        } else if (hasSingleCity && singleCityData) {
            setFormData(prev => ({ ...prev, cityCode: singleCityData.city.cityCode || singleCityData.city.id, cityLabel: singleCityData.city.title, provinceCode: singleCityData.province.provinceCode || singleCityData.province.id, provinceLabel: singleCityData.province.title }));
        }
    }, [business, hasSingleCity, singleCityData]);

    // ═════════════ صفحات بارگذاری و ریدایرکت ═════════════
    if (isLoading || redirecting || !business) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <FormHeader title="ثبت قیمت" backUrl="/" />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                        <p className="mt-4 text-on-surface-variant">{redirecting ? 'در حال انتقال...' : 'در حال بارگذاری...'}</p>
                    </div>
                </main>
            </div>
        );
    }

    // ⭐⭐⭐ بررسی زودهنگام اعتبار: سهمیه رایگان تمام شده و اعتبار کافی نیست ⭐⭐⭐
    const needsCreditPurchase = !isAdFree && (creditBalance?.balance ?? 0) < bumpCost;

    if (needsCreditPurchase) {
        return (
            <div className="min-h-screen flex flex-col bg-surface">
                <FormHeader title="ثبت قیمت" backUrl="/" />
                <main className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center space-y-6 max-w-sm w-full">
                        <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                            <CreditCard className="w-10 h-10 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-lg font-extrabold text-on-surface">
                                اعتبار آگهی رایگان شما تمام شده
                            </h2>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                سهمیه <span className="font-bold text-on-surface">{maxFreeAdsPerMonth}</span> آگهی رایگان شما استفاده شده است.
                                برای ثبت آگهی جدید به <span className="font-bold text-primary">{bumpCost}</span> اعتبار نیاز دارید.
                                موجودی فعلی شما <span className="font-bold">{creditBalance?.balance ?? 0}</span> اعتبار است.
                            </p>
                        </div>

                        {hasReachedMaxAds && (
                            <div className="flex items-center gap-2 justify-center text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>شما همچنین به سقف {maxActiveAdsPerUser} آگهی فعال رسیده‌اید</span>
                            </div>
                        )}

                        <Link href="/credit/purchase" className="block">
                            <button
                                type="button"
                                className="w-full h-14 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2.5"
                            >
                                <CreditCard className="w-5 h-5" />
                                خرید اعتبار
                            </button>
                        </Link>

                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                            بازگشت به صفحه اصلی
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const validityOptions = [
        { value: '24', label: '۲۴ ساعت' },
        { value: '48', label: '۴۸ ساعت' },
        { value: '72', label: '۷۲ ساعت' },
    ];

    // ═══════════════ Wizard logic ═══════════════
    const validateStep = (step: number): boolean => {
        const errors: string[] = [];
        if (step === 1) {
            if (!formData.categoryId) errors.push('دسته‌بندی کالا را انتخاب کنید.');
            if (selectedCategoryData && !formData.productType.trim()) errors.push('عنوان کالا را وارد کنید.');
        } else if (step === 2) {
            if (formData.minQuantity <= 0) errors.push('حداقل حجم فروش را وارد کنید.');
            if (formData.unitPrice <= 0) errors.push('قیمت واحد را وارد کنید.');
            if (formData.availableQuantity <= 0) errors.push('موجودی انبار را وارد کنید.');
        } else if (step === 3) {
            if (!formData.cityCode && !hasSingleCity) errors.push('محل کالا را انتخاب کنید.');
        }
        if (errors.length > 0) {
            errors.forEach(msg => toast.error(msg));
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (currentStep < TOTAL_STEPS && validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(1, prev - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToStep = (step: number) => {
        if (step < currentStep) {
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleAddImageSlot = () => {
        if (adImageFiles.length < maxImagesPerAd) {
            setAdImageFiles(prev => [...prev, null]);
        }
    };
    const handleRemoveImageSlot = (index: number) => {
        setAdImageFiles(prev => {
            const newFiles = [...prev];
            newFiles.splice(index, 1);
            return newFiles.length === 0 ? [null] : newFiles;
        });
    };
    const handleSetImageFile = (index: number, file: File | null) => {
        setAdImageFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = file;
            return newFiles;
        });
    };

    // ⭐⭐⭐ تابع سابمیت — بدون فرم، فقط با کلیک دکمه فراخوانی می‌شود ⭐⭐⭐
    const handleSubmit = async () => {
        if (currentStep !== TOTAL_STEPS) return;
        if (isSubmitting) return;

        // بررسی اعتبار نردبان
        if (formData.isBumped && creditBalance && creditBalance.balance < bumpCost) {
            toast.error(`اعتبار کافی نیست. برای نردبان به ${bumpCost} اعتبار نیاز دارید.`);
            setCurrentStep(4);
            return;
        }

        // اعتبارسنجی نهایی (فقط مراحل ۱ تا ۳)
        for (let s = 1; s <= 3; s++) {
            if (!validateStep(s)) {
                setCurrentStep(s);
                return;
            }
        }
        if (hasReachedMaxAds && isAdFree) {
            toast.error(`شما به سقف ${maxActiveAdsPerUser} آگهی فعال رسیده‌اید`);
            return;
        }

        setIsSubmitting(true);
        try {
            let uploadedIds: string[] = [];
            const filesToUpload = adImageFiles.filter((f): f is File => f !== null);
            if (filesToUpload.length > 0) {
                setIsUploadingImages(true);
                try {
                    const uploadPromises = filesToUpload.map(async (file, index) => {
                        const result = await uploadMutation.mutateAsync({
                            file, model: 'Ad', modelId: 'temp', fieldKey: `ad-image-${index}`,
                        });
                        return result.id;
                    });
                    uploadedIds = await Promise.all(uploadPromises);
                } catch (error: any) {
                    toast.error('خطا در آپلود تصاویر');
                    setIsUploadingImages(false);
                    setIsSubmitting(false);
                    return;
                } finally {
                    setIsUploadingImages(false);
                }
            }

            const title = formData.productType
                ? `${selectedCategoryData?.name || ''} ${formData.productType}`
                : selectedCategoryData?.name || '';

            const ad = await createAdMutation.mutateAsync({
                armSlug: currentSlug || 'barton',
                categoryId: formData.categoryId,
                unitId: selectedCategoryData?.defaultUnitId || '',
                title,
                productType: formData.productType,
                unitPrice: formData.unitPrice,
                minQuantity: formData.minQuantity,
                availableQuantity: formData.availableQuantity,
                city: formData.cityLabel,
                cityCode: formData.cityCode,
                provinceCode: formData.provinceCode,
                locationDetail: '',
                validityHours: parseInt(formData.validityHours),
                isAnonymous: formData.isAnonymous,
                isBumped: formData.isBumped,
            });

            if (uploadedIds.length > 0 && ad?.id) {
                await Promise.all(uploadedIds.map(fileId => apiService.file.updateRelatedId(fileId, ad.id)));
            }

            await refetchBalance();
            toast.success('آگهی با موفقیت ثبت شد');
            router.push('/profile');
        } catch (error: any) {
            if (error?.data?.errorCode === 'INSUFFICIENT_CREDIT') {
                toast.error(error?.data?.message || 'اعتبار کافی نیست');
                setTimeout(() => {
                    router.push('/credit/purchase');
                }, 1500);
            } else {
                toast.error(error?.message || 'خطا در ثبت آگهی');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ⭐ جلوگیری از سابمیت با زدن Enter — روی کل صفحه
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (currentStep < TOTAL_STEPS) {
                nextStep();
            }
        }
    };

    const uploadedCount = adImageFiles.filter(f => f !== null).length;

    return (
        <div className="min-h-screen flex flex-col bg-surface pb-28" onKeyDown={handleKeyDown}>
            <FormHeader title="ثبت قیمت جدید" backUrl="/" />

            <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-20">

                {/* ═══════ نوار پیشرفت RTL ═══════ */}
                <div className="flex flex-row-reverse items-start mb-10">
                    {stepMeta.map((meta, idx) => {
                        const stepNum = idx + 1;
                        const isActive = stepNum === currentStep;
                        const isDone = stepNum < currentStep;
                        const isLast = idx === stepMeta.length - 1;
                        const Icon = meta.icon;

                        return (
                            <React.Fragment key={stepNum}>
                                <button
                                    type="button"
                                    onClick={() => goToStep(stepNum)}
                                    disabled={stepNum > currentStep}
                                    className="flex flex-col items-center flex-shrink-0 cursor-default"
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
                                        isActive && "bg-primary text-white border-primary ring-4 ring-primary/20 scale-110 shadow-lg shadow-primary/20",
                                        isDone && "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20",
                                        !isActive && !isDone && "bg-surface-container-high text-on-surface-variant border-outline-variant/50",
                                        stepNum > currentStep && "opacity-40"
                                    )}>
                                        {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] sm:text-[11px] mt-2.5 text-center leading-tight font-medium",
                                        isActive && "text-primary",
                                        isDone && "text-emerald-600",
                                        !isActive && !isDone && "text-on-surface-variant/70"
                                    )}>
                                        {meta.title}
                                    </span>
                                </button>

                                {!isLast && (
                                    <div className="flex-1 flex items-center pt-[18px] px-1 min-w-[12px]">
                                        <div className={cn(
                                            "w-full h-[3px] rounded-full transition-all duration-500",
                                            isDone
                                                ? "bg-emerald-500"
                                                : "bg-outline-variant/20"
                                        )} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* ⭐⭐⭐ فرم حذف شد → دیو ساده ⭐⭐⭐ */}
                <div className="space-y-5">

                    {/* ═══════ مرحله ۱: دسته‌بندی و تصویر ═══════ */}
                    {currentStep === 1 && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            <CategoryGridSelector
                                categoryTree={categoryTree || []}
                                selectedCategoryId={formData.categoryId}
                                onSelect={(categoryId) => {
                                    setFormData(prev => ({ ...prev, categoryId, minQuantity: 0, unitPrice: 0, productType: '' }));
                                }}
                            />
                            {selectedCategoryData && (
                                <div className="bg-white p-4 rounded-2xl border border-outline-variant/40 shadow-sm space-y-2.5">
                                    <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Package className="w-3.5 h-3.5 text-primary" />
                                        </span>
                                        عنوان {selectedCategoryData.name || selectedCategoryData.title}
                                        <span className="text-error text-xs">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.productType}
                                        onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                                        placeholder={categoryExample ? `مثال: ${categoryExample}` : `مثال: ${selectedCategoryData.name || selectedCategoryData.title} درجه یک`}
                                        className="w-full h-12 bg-surface-container-lowest border border-outline/60 px-4 text-sm text-right placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none rounded-xl transition-all"
                                    />
                                </div>
                            )}

                            {maxImagesPerAd > 0 && (
                                <div className="bg-white p-4 rounded-2xl border border-outline-variant/40 shadow-sm space-y-3">
                                    <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                                        </span>
                                        تصویر محصول
                                        <span className="text-[10px] font-normal text-on-surface-variant/60 mr-auto">
                                            {uploadedCount}/{maxImagesPerAd}
                                        </span>
                                    </label>
                                    <div className="flex flex-wrap gap-3 items-start">
                                        {adImageFiles.map((file, idx) => (
                                            <div key={idx} className="relative flex flex-col items-center">
                                                <FileUploader
                                                    model="Ad" modelId="temp" fieldKey={`ad-image-${idx}`} value={null}
                                                    onFileSelect={(f) => handleSetImageFile(idx, f)}
                                                    showDeleteBtn={!!file} onRemove={() => handleRemoveImageSlot(idx)}
                                                    rounded={false} width={80} height={80} disabled={isSubmitting} label="آپلود"
                                                />
                                            </div>
                                        ))}
                                        {adImageFiles.length < maxImagesPerAd && (
                                            <button type="button" onClick={handleAddImageSlot}
                                                    className="w-20 h-20 border-2 border-dashed border-outline-variant/40 rounded-xl flex flex-col items-center justify-center text-on-surface-variant/40 hover:border-primary/50 hover:text-primary/60 hover:bg-primary/5 transition-all gap-1"
                                                    disabled={isSubmitting}>
                                                <Plus className="w-5 h-5" />
                                                <span className="text-[9px]">افزودن</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════ مرحله ۲: قیمت و حجم ═══════ */}
                    {currentStep === 2 && selectedCategoryData && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 space-y-1">
                                <div className="flex items-center gap-2 text-primary">
                                    <Package className="w-5 h-5" />
                                    <h3 className="font-bold text-sm">تعیین قیمت بر اساس حجم خرید</h3>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-4 border border-outline-variant/40 shadow-sm space-y-2.5">
                                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black">۱</span>
                                    حداقل حجم فروش ({unitName})
                                    <span className="text-error text-xs">*</span>
                                </label>
                                <NumberInput
                                    value={formData.minQuantity || undefined}
                                    onChange={(val) => setFormData(prev => ({ ...prev, minQuantity: val || 0 }))}
                                    unit={unitName}
                                    className="w-full h-14 bg-surface-container-lowest border border-outline/60 px-4 text-xl font-extrabold text-right placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none rounded-xl transition-all"
                                />
                            </div>

                            <div className="flex justify-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ArrowDown className="w-4 h-4 text-primary" />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-4 border border-primary/30 shadow-sm shadow-primary/5 space-y-2.5 ring-1 ring-primary/10">
                                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-md bg-primary text-white flex items-center justify-center text-[10px] font-black">۲</span>
                                    قیمت هر {unitName} برای خرید حداقل {formData.minQuantity || '...'} {unitName}
                                    <span className="text-error text-xs">*</span>
                                </label>
                                <NumberInput
                                    value={formData.unitPrice || undefined}
                                    onChange={(val) => setFormData(prev => ({ ...prev, unitPrice: val || 0 }))}
                                    unit={currencyUnit}
                                    className="w-full h-14 bg-surface-container-lowest border border-primary/40 px-4 text-xl font-extrabold text-right placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none rounded-xl transition-all"
                                />
                            </div>

                            <div className="bg-white rounded-2xl p-4 border border-outline-variant/40 shadow-sm space-y-2.5 mt-4">
                                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">۳</span>
                                    موجودی تضمینی فعلی انبار ({unitName})
                                    <span className="text-error text-xs">*</span>
                                </label>
                                <NumberInput
                                    value={formData.availableQuantity || undefined}
                                    onChange={(val) => setFormData(prev => ({ ...prev, availableQuantity: val || 0 }))}
                                    unit={unitName}
                                    className="w-full h-12 bg-surface-container-lowest border border-outline/60 px-4 text-right placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none rounded-xl transition-all"
                                    placeholder="موجودی را وارد کنید"
                                />
                            </div>
                        </div>
                    )}

                    {/* ═══════ مرحله ۳: موقعیت و زمان ═══════ */}
                    {currentStep === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-white p-4 rounded-2xl border border-outline-variant/40 shadow-sm space-y-2.5">
                                <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                                    </span>
                                    محل کالا
                                    <span className="text-error text-xs">*</span>
                                </label>
                                {hasSingleCity ? (
                                    <div className="flex items-center gap-2.5 p-3.5 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm text-on-surface">
                                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span>{singleCityData?.city.title}</span>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => setIsLocationModalOpen(true)}
                                            className="w-full flex items-center justify-between p-3.5 border border-outline/60 bg-surface-container-lowest rounded-xl text-sm hover:border-primary/50 hover:ring-2 hover:ring-primary/10 transition-all">
                                        <span className={formData.cityLabel ? "text-on-surface font-medium" : "text-on-surface-variant/50"}>
                                            {formData.cityLabel || 'انتخاب شهر...'}
                                        </span>
                                        <Edit2 className="w-4 h-4 text-primary/60" />
                                    </button>
                                )}
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-outline-variant/40 shadow-sm space-y-2.5">
                                <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                                    </span>
                                    مدت اعتبار قیمت
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {validityOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, validityHours: opt.value }))}
                                            className={cn(
                                                "h-12 rounded-xl text-sm font-medium border-2 transition-all",
                                                formData.validityHours === opt.value
                                                    ? "border-primary bg-primary/10 text-primary font-bold"
                                                    : "border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant hover:border-primary/30"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════ مرحله ۴: تنظیمات انتشار ═══════ */}
                    {currentStep === 4 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shadow-amber-500/20">
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </span>
                                        <div>
                                            <span className="text-sm font-bold text-on-surface block">نردبان (بالاترین نمایش)</span>
                                            <span className="text-[11px] text-on-surface-variant/70">۱ روز • مصرف {bumpCost} اعتبار</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                        <input type="checkbox" checked={formData.isBumped}
                                               onChange={(e) => {
                                                   setFormData(prev => ({ ...prev, isBumped: e.target.checked }));
                                                   if (e.target.checked) toast.info(`با فعال شدن نردبان، ${bumpCost} اعتبار کسر خواهد شد`, { duration: 4000 });
                                               }} className="sr-only peer" />
                                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer
                                            after:content-[''] after:absolute after:top-[3px] after:right-[3px]
                                            after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all after:shadow-sm
                                            peer-checked:bg-primary peer-checked:after:-translate-x-full" />
                                    </label>
                                </div>

                                {formData.isBumped && (
                                    <div className="mx-4 mb-4 bg-amber-50 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2.5">
                                        <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-amber-800/80 space-y-1">
                                            <p><span className="font-bold">{bumpCost}</span> اعتبار از حساب شما کسر خواهد شد.</p>
                                            {creditBalance && creditBalance.balance < bumpCost && (
                                                <p className="text-red-600 font-bold flex items-center gap-1">
                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    اعتبار ناکافی! موجودی: {creditBalance.balance}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {allowAnonymousPublishing && (
                                <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-sm shadow-slate-500/20">
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                            </span>
                                            <div>
                                                <span className="text-sm font-bold text-on-surface block">انتشار ناشناس</span>
                                                <span className="text-[11px] text-on-surface-variant/70">نام و اطلاعات شما نمایش داده نمی‌شود</span>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                            <input type="checkbox" checked={formData.isAnonymous}
                                                   onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))} className="sr-only peer" />
                                            <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer
                                                after:content-[''] after:absolute after:top-[3px] after:right-[3px]
                                                after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all after:shadow-sm
                                                peer-checked:bg-primary peer-checked:after:-translate-x-full" />
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3">
                                <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                                </span>
                                <div className="text-sm">
                                    <span className="text-on-surface-variant">اعتبار فعلی:</span>{' '}
                                    <span className="font-bold text-on-surface">{creditBalance?.balance ?? '—'}</span>
                                    {isAdFree && (
                                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mr-2 font-medium">
                                            {remainingFreeAds} آگهی رایگان باقیمانده
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════ مرحله ۵: بررسی نهایی ═══════ */}
                    {currentStep === 5 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-gradient-to-l from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                                    <ClipboardCheck className="w-5 h-5 text-white" />
                                </span>
                                <div>
                                    <h3 className="font-bold text-sm text-emerald-800">اطلاعات را بررسی کنید</h3>
                                    <p className="text-[11px] text-emerald-700/70">پس از تأیید، آگهی منتشر خواهد شد.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
                                <button type="button" onClick={() => goToStep(1)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-surface-container-lowest/50 transition-colors">
                                    <span className="text-sm font-bold text-on-surface flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-primary" />
                                        دسته‌بندی و کالا
                                    </span>
                                    <Edit2 className="w-3.5 h-3.5 text-primary/50" />
                                </button>
                                <div className="px-4 pb-4 space-y-1.5 border-t border-outline-variant/20 pt-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-on-surface-variant">دسته‌بندی</span>
                                        <span className="font-medium text-on-surface">{selectedCategoryData?.name || '---'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-on-surface-variant">عنوان کالا</span>
                                        <span className="font-medium text-on-surface">{formData.productType || '---'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-on-surface-variant">تصاویر</span>
                                        <span className="font-medium text-on-surface">{uploadedCount > 0 ? `${uploadedCount} عدد` : 'بدون تصویر'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
                                <button type="button" onClick={() => goToStep(2)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-surface-container-lowest/50 transition-colors">
                                    <span className="text-sm font-bold text-on-surface flex items-center gap-2">
                                        <Package className="w-4 h-4 text-primary" />
                                        قیمت و حجم
                                    </span>
                                    <Edit2 className="w-3.5 h-3.5 text-primary/50" />
                                </button>
                                <div className="px-4 pb-4 space-y-1.5 border-t border-outline-variant/20 pt-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-on-surface-variant">حداقل حجم</span>
                                        <span className="font-medium text-on-surface">{formData.minQuantity.toLocaleString()} {unitName}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-on-surface-variant">قیمت هر {unitName}</span>
                                        <span className="font-bold text-primary">{formData.unitPrice.toLocaleString()} {currencyUnit}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-on-surface-variant">موجودی</span>
                                        <span className="font-medium text-on-surface">{formData.availableQuantity.toLocaleString()} {unitName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
                                <button type="button" onClick={() => goToStep(3)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-surface-container-lowest/50 transition-colors">
                                    <span className="text-sm font-bold text-on-surface flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        موقعیت و زمان
                                    </span>
                                    <Edit2 className="w-3.5 h-3.5 text-primary/50" />
                                </button>
                                <div className="px-4 pb-4 space-y-1.5 border-t border-outline-variant/20 pt-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-on-surface-variant">شهر</span>
                                        <span className="font-medium text-on-surface">{formData.cityLabel || singleCityData?.city.title || '---'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-on-surface-variant">اعتبار قیمت</span>
                                        <span className="font-medium text-on-surface">{formData.validityHours} ساعت</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
                                <button type="button" onClick={() => goToStep(4)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-surface-container-lowest/50 transition-colors">
                                    <span className="text-sm font-bold text-on-surface flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-primary" />
                                        تنظیمات انتشار
                                    </span>
                                    <Edit2 className="w-3.5 h-3.5 text-primary/50" />
                                </button>
                                <div className="px-4 pb-4 space-y-1.5 border-t border-outline-variant/20 pt-3">
                                    <div className="flex justify-between text-xs items-center">
                                        <span className="text-on-surface-variant">نردبان</span>
                                        {formData.isBumped ? (
                                            <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full text-[10px]">فعال (−{bumpCost} اعتبار)</span>
                                        ) : (
                                            <span className="text-on-surface-variant/50">غیرفعال</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-xs items-center">
                                        <span className="text-on-surface-variant">انتشار ناشناس</span>
                                        {formData.isAnonymous ? (
                                            <span className="font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">فعال</span>
                                        ) : (
                                            <span className="text-on-surface-variant/50">غیرفعال</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════ دکمه‌های ناوبری ═══════ */}
                    <div className="flex flex-row-reverse items-center justify-between pt-6 mt-2 border-t border-outline-variant/20">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="h-12 px-5 rounded-xl border-2 border-outline-variant/40 bg-white text-sm font-medium text-on-surface flex items-center gap-2 hover:bg-surface-container-lowest transition-all active:scale-95"
                            >
                                <ArrowRight className="w-4 h-4" />
                                قبلی
                            </button>
                        ) : (
                            <div />
                        )}

                        {currentStep < TOTAL_STEPS ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="h-12 px-6 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20"
                            >
                                بعدی
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploadingImages}
                                className="h-12 px-6 rounded-xl bg-emerald-600 text-white text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting || isUploadingImages ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        در حال ثبت...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        ثبت نهایی آگهی
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {isLocationModalOpen && (
                <ArmLocationSelector
                    locationTree={locationTree}
                    selectedCityCode={formData.cityCode}
                    onSelect={(cityCode, cityLabel, provinceCode, provinceLabel) => {
                        setFormData(prev => ({
                            ...prev,
                            cityCode: cityCode || '',
                            cityLabel: cityLabel || '',
                            provinceCode: provinceCode || '',
                            provinceLabel: provinceLabel || '',
                        }));
                        setIsLocationModalOpen(false);
                    }}
                    onClose={() => setIsLocationModalOpen(false)}
                />
            )}
        </div>
    );
}