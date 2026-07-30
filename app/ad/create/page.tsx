// app/ad/create/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { FormHeader } from '@/app/components';
import { useCreateAd, useActiveBusiness, useCreditBalance, useArmCategoryTree } from '@/lib/api/apiHooks';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import { Package, Send, Edit2, X, MapPin, Clock, Shield, ArrowDown, Info, Search, AlertCircle, CreditCard, TrendingUp } from 'lucide-react';
import { ArmLocationSelector } from '@/app/components/ArmLocationSelector';
import { NumberInput } from "@/components/common";
import { cn } from '@/lib/utils';
import {CategoryGridSelector} from "@/app/ad/CategoryGridSelector";

export default function CreateAdPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { currentSlug, currentArm } = useSelector((state: RootState) => state.arm);
    const { data: business, isLoading: businessLoading } = useActiveBusiness();
    const { data: categoryTree, isLoading: categoriesLoading } = useArmCategoryTree(currentSlug || 'barton');
    const { data: creditBalance, refetch: refetchBalance } = useCreditBalance();

    // ⭐ ۱. همه useStateها
    const [redirecting, setRedirecting] = useState(false);
    const [activeAdsCount, setActiveAdsCount] = useState(0);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const createAdMutation = useCreateAd();

    // ⭐ ۲. همه useMemoها - قبل از useStateهای وابسته
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
    const adValidityDefaultDays = useMemo(() => priceTable.adValidityDefaultDays ?? 1, [priceTable.adValidityDefaultDays]);
    const maxActiveAdsPerUser = useMemo(() => priceTable.maxActiveAdsPerUser ?? 10, [priceTable.maxActiveAdsPerUser]);

    // ⭐ formData بعد از useMemoها
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
        validityDays: String(adValidityDefaultDays || 1),
        isAnonymous: false,
        isBumped: false,
    });

    const categoriesWithUnits = useMemo(() => {
        if (!categoryTree) return [];
        const flattenCategories = (nodes: any[]): any[] => {
            let result: any[] = [];
            for (const parent of nodes) {
                if (parent.isSelected === true) {
                    result.push({
                        id: parent.id, name: parent.title,
                        defaultUnitId: parent.defaultUnitId || '',
                        unitTitle: parent.unitTitle || 'تن',
                        unitShortCode: parent.unitShortCode || 'تن',
                        defaultMinQuantity: parent.defaultMinQuantity || 0,
                        example: parent.example || '',
                    });
                }
                if (parent.children?.length > 0) result = result.concat(flattenCategories(parent.children));
            }
            return result;
        };
        return flattenCategories(categoryTree);
    }, [categoryTree]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categoriesWithUnits;
        return categoriesWithUnits.filter(cat => cat.name.includes(searchQuery.trim()));
    }, [categoriesWithUnits, searchQuery]);

    const selectedCategoryData = useMemo(() => {
        if (formData.categoryId && categoriesWithUnits.length > 0) {
            return categoriesWithUnits.find(c => c.id === formData.categoryId) || null;
        }
        return null;
    }, [formData.categoryId, categoriesWithUnits]);

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

    const isLoading = businessLoading || categoriesLoading;
    const remainingFreeAds = Math.max(0, maxFreeAdsPerMonth - activeAdsCount);
    const isAdFree = remainingFreeAds > 0;
    const hasReachedMaxAds = activeAdsCount >= maxActiveAdsPerUser;

    // ⭐ ۳. همه useEffectها
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
            } catch (error) {
                console.error('Error fetching active ads count:', error);
            }
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

    // ⭐ ۴. return شرطی
    if (isLoading || redirecting || !business) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <FormHeader title="ثبت قیمت" backUrl="/" />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                        <p className="mt-4 text-on-surface-variant">
                            {redirecting ? 'در حال انتقال...' : 'در حال بارگذاری...'}
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    // ⭐ ۵. توابع
    const validityOptions = [
        { value: '1', label: '۲۴ ساعت' },
        { value: '2', label: '۴۸ ساعت' },
        { value: '3', label: '۷۲ ساعت' },
        { value: String(adValidityDefaultDays), label: `${adValidityDefaultDays} روز (پیش‌فرض)` },
    ];

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.categoryId) newErrors.categoryId = 'انتخاب دسته کالا الزامی است';
        if (!formData.productType.trim()) newErrors.productType = 'نوع کالا را وارد کنید';
        if (formData.unitPrice <= 0) newErrors.unitPrice = 'قیمت واحد معتبر وارد کنید';
        if (formData.minQuantity <= 0) newErrors.minQuantity = 'حداقل خرید را وارد کنید';
        if (formData.availableQuantity <= 0) newErrors.availableQuantity = 'موجودی انبار را وارد کنید';
        if (!formData.cityCode) newErrors.city = 'محل کالا را انتخاب کنید';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (hasReachedMaxAds && isAdFree) {
            toast.error(`شما به سقف ${maxActiveAdsPerUser} آگهی فعال رسیده‌اید`);
            return;
        }
        setIsSubmitting(true);
        try {
            const title = formData.productType
                ? `${selectedCategoryData?.name || ''} ${formData.productType}`
                : selectedCategoryData?.name || '';

            await createAdMutation.mutateAsync({
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
                validityDays: parseInt(formData.validityDays),
                isAnonymous: formData.isAnonymous,
                isBumped: formData.isBumped,
            });

            await refetchBalance();
            toast.success('آگهی با موفقیت ثبت شد');
            router.push('/');
        } catch (error: any) {
            console.error('Create ad error:', error);
            if (error?.data?.errorCode === 'INSUFFICIENT_CREDIT') {
                toast.error(error?.data?.message || 'اعتبار شما کافی نیست. لطفاً اعتبار خریداری کنید.');
                await refetchBalance();
            } else {
                toast.error(error?.message || 'خطا در ثبت آگهی');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ⭐ ۶. رندر اصلی
    return (
        <div className="min-h-screen flex flex-col bg-surface pb-24">
            <FormHeader title="ثبت قیمت جدید" backUrl="/" />

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-20">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ستون چپ: اطلاعات اصلی کالا */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* باکس دسته بندی */}
                        <CategoryGridSelector
                            categoryTree={categoryTree || []}
                            selectedCategoryId={formData.categoryId}
                            onSelect={(categoryId) => {
                                setFormData(prev => ({ ...prev, categoryId, minQuantity: 0, unitPrice: 0, productType: '' }));
                                setErrors(prev => ({ ...prev, categoryId: '' }));
                            }}
                            error={errors.categoryId}
                        />

                        {/* باکس نوع کالا */}
                        {selectedCategoryData && (
                            <div className="bg-white p-4 rounded-2xl border border-outline-variant/50 shadow-sm space-y-2">
                                <label className="text-sm font-semibold text-on-surface block">
                                    <Package className="w-4 h-4 inline-block ml-1 text-primary" />
                                    نوع {selectedCategoryData.name} <span className="text-error">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.productType}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, productType: e.target.value }));
                                        if (errors.productType) setErrors(prev => ({ ...prev, productType: '' }));
                                    }}
                                    placeholder={categoryExample ? `مثال: ${selectedCategoryData.name} ${categoryExample}` : `مثال: ${selectedCategoryData.name} درجه یک`}
                                    className="w-full h-12 bg-surface-container-lowest border border-outline px-4 text-sm text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none rounded-lg"
                                />
                                {categoryExample && (
                                    <p className="text-[10px] text-on-surface-variant">راهنما: {categoryExample}</p>
                                )}
                                {errors.productType && <p className="text-error text-xs">{errors.productType}</p>}
                            </div>
                        )}

                        {/* باکس ارتباط قیمت و حجم */}
                        {selectedCategoryData && (
                            <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Package className="w-5 h-5" />
                                    <h3 className="font-bold text-sm">تعیین قیمت بر اساس حجم خرید</h3>
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed">
                                    در فروش عمده، قیمت معمولاً به میزان خرید بستگی دارد. لطفاً حداقل حجمی که برای این قیمت در نظر دارید را وارد کنید.
                                </p>

                                <div className="bg-white rounded-xl p-4 border border-outline-variant space-y-2 shadow-sm">
                                    <label className="text-xs font-medium text-on-surface-variant">
                                        ۱. حداقل حجم فروش شما ({unitName}) <span className="text-error">*</span>
                                    </label>
                                    <NumberInput
                                        value={formData.minQuantity || undefined}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, minQuantity: val || 0 }));
                                            if (errors.minQuantity) setErrors(prev => ({ ...prev, minQuantity: '' }));
                                        }}
                                        unit={unitName}
                                        className="w-full h-14 bg-surface-container-lowest border border-outline px-4 text-xl font-bold text-right focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none rounded-lg"
                                    />
                                    {errors.minQuantity && <p className="text-error text-xs">{errors.minQuantity}</p>}
                                </div>

                                <div className="flex justify-center text-on-surface-variant">
                                    <ArrowDown className="w-5 h-5" />
                                </div>

                                <div className="relative">
                                    <label className="text-xs font-medium text-on-surface-variant block mb-2">
                                        ۲. قیمت هر {unitName} برای خرید حداقل {formData.minQuantity || '...'} {unitName} <span className="text-error">*</span>
                                    </label>
                                    <NumberInput
                                        value={formData.unitPrice || undefined}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, unitPrice: val || 0 }));
                                            if (errors.unitPrice) setErrors(prev => ({ ...prev, unitPrice: '' }));
                                        }}
                                        unit={currencyUnit}
                                        className="w-full h-14 bg-surface-container-lowest border border-outline px-4 text-xl font-bold text-right focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none rounded-lg"
                                    />
                                    {errors.unitPrice && <p className="text-error text-xs mt-1">{errors.unitPrice}</p>}
                                </div>
                            </div>
                        )}

                        {/* موجودی انبار */}
                        {selectedCategoryData && (
                            <div className="bg-white p-4 rounded-2xl border border-outline-variant/50 shadow-sm space-y-2">
                                <label className="text-sm font-semibold text-on-surface">
                                    موجودی فعلی انبار ({unitName}) <span className="text-error">*</span>
                                </label>
                                <NumberInput
                                    value={formData.availableQuantity || undefined}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, availableQuantity: val || 0 }));
                                        if (errors.availableQuantity) setErrors(prev => ({ ...prev, availableQuantity: '' }));
                                    }}
                                    unit={unitName}
                                    className="w-full h-12 bg-surface-container-lowest border border-outline px-4 text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none rounded-lg"
                                    placeholder="موجودی را وارد کنید"
                                />
                                {errors.availableQuantity && <p className="text-error text-xs">{errors.availableQuantity}</p>}
                            </div>
                        )}
                    </div>

                    {/* ستون راست: تنظیمات و انتشار */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24 lg:self-start">

                        {/* محل کالا */}
                        <div className="bg-white p-4 rounded-2xl border border-outline-variant/50 shadow-sm space-y-2">
                            <label className="text-sm font-semibold text-on-surface block">
                                <MapPin className="w-4 h-4 inline-block ml-1 text-primary" />
                                محل کالا <span className="text-error">*</span>
                            </label>
                            {hasSingleCity ? (
                                <div className="flex items-center gap-2 p-3 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>{singleCityData?.city.title}</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsLocationModalOpen(true)}
                                    className="w-full flex items-center justify-between p-3 border border-outline bg-surface-container-lowest rounded-lg text-sm hover:border-primary/50 transition-colors"
                                >
                                    <span className={formData.cityLabel ? "text-on-surface" : "text-on-surface-variant"}>
                                        {formData.cityLabel || 'انتخاب شهر...'}
                                    </span>
                                    <Edit2 className="w-4 h-4 text-primary" />
                                </button>
                            )}
                            {errors.city && <p className="text-error text-xs">{errors.city}</p>}
                        </div>

                        {/* مدت اعتبار */}
                        <div className="bg-white p-4 rounded-2xl border border-outline-variant/50 shadow-sm space-y-2">
                            <label className="text-sm font-semibold text-on-surface block">
                                <Clock className="w-4 h-4 inline-block ml-1 text-primary" />
                                مدت اعتبار قیمت
                            </label>
                            <select
                                value={formData.validityDays}
                                onChange={(e) => setFormData(prev => ({ ...prev, validityDays: e.target.value }))}
                                className="w-full h-12 bg-surface-container-lowest border border-outline px-3 text-sm appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none rounded-lg"
                            >
                                {[...new Map(validityOptions.map(opt => [opt.value, opt])).values()].map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* نردبان + انتشار ناشناس */}
                        <div className="bg-white p-4 rounded-2xl border border-outline-variant/50 shadow-sm space-y-3">
                            {/* نردبان */}
                            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                                <div>
                                    <span className="text-sm font-medium text-on-surface block">نردبان (بالاترین نمایش)</span>
                                    <span className="text-[10px] text-on-surface-variant">۱ روز • مصرف {bumpCost} اعتبار</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={formData.isBumped} onChange={(e) => {
                                        setFormData(prev => ({ ...prev, isBumped: e.target.checked }));
                                        if (e.target.checked) toast.info(`با فعال شدن نردبان، ${bumpCost} اعتبار کسر خواهد شد`, { duration: 4000 });
                                    }} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {formData.isBumped && (
                                <div className="bg-warning/5 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
                                    <TrendingUp className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-on-surface-variant">
                                        <span className="font-medium text-warning">توجه:</span> <span className="font-bold">{bumpCost}</span> اعتبار کسر می‌شود.
                                        {creditBalance && creditBalance.balance < bumpCost && (
                                            <span className="block text-error mt-1">⚠️ اعتبار ناکافی!</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ⭐ انتشار ناشناس - فقط وقتی config اجازه میده */}
                            {allowAnonymousPublishing && (
                                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                                    <span className="text-sm font-medium text-on-surface">انتشار ناشناس</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={formData.isAnonymous} onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* ⭐ پیام تأیید مدیر */}
                        {!autoApproveAds && (
                            <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-xs flex items-start gap-2 border border-amber-200">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>آگهی شما پس از تأیید مالک بازار منتشر خواهد شد.</p>
                            </div>
                        )}

                        {/* ⭐ پیام سقف آگهی */}
                        {hasReachedMaxAds && (
                            <div className="bg-error/5 text-error p-3 rounded-lg text-xs flex items-start gap-2 border border-error/20">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>شما به حداکثر تعداد آگهی فعال ({maxActiveAdsPerUser}) رسیده‌اید.</p>
                            </div>
                        )}

                        {/* اعتبار و انتشار */}
                        <div className="bg-white p-4 rounded-2xl border border-outline-variant/50 shadow-sm space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-on-surface-variant flex items-center gap-1"><Shield className="w-4 h-4" /> اعتبار شما:</span>
                                <span className="font-bold text-on-surface">{creditBalance?.balance || 0}</span>
                            </div>

                            {isAdFree ? (
                                <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-start gap-2 text-xs border border-green-200">
                                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>ثبت این آگهی رایگان است ({remainingFreeAds} از {maxFreeAdsPerMonth} باقی‌مانده).</p>
                                </div>
                            ) : (
                                <div className="bg-warning/5 border-2 border-warning/30 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-3 text-warning">
                                        <AlertCircle className="w-6 h-6" />
                                        <h3 className="font-bold text-sm">سهمیه آگهی رایگان به پایان رسیده است</h3>
                                    </div>
                                    <p className="text-xs text-on-surface-variant leading-relaxed">
                                        سهمیه آگهی رایگان شما ({maxFreeAdsPerMonth} عدد در ماه) به پایان رسیده است.
                                        برای ثبت آگهی جدید، {bumpCost} اعتبار از موجودی شما کسر می‌شود.
                                    </p>
                                    <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-outline-variant">
                                        <div>
                                            <span className="text-sm font-medium text-on-surface">اعتبار شما</span>
                                            <span className="text-xs text-on-surface-variant block">موجودی فعلی</span>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-2xl font-bold text-primary">{creditBalance?.balance || 0}</span>
                                            <span className="text-xs text-on-surface-variant mr-1">اعتبار</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => router.push('/credit/purchase')}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            خرید اعتبار
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={isSubmitting || (hasReachedMaxAds && isAdFree)}
                                    className="w-full h-14 bg-primary text-on-primary text-base font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform rounded-xl disabled:opacity-50 shadow-lg shadow-primary/20">
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                                ) : (
                                    <>ثبت قیمت و انتشار<Send className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </main>

            {/* مودال انتخاب شهر */}
            {!hasSingleCity && isLocationModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface w-full max-w-md rounded-2xl border border-outline-variant shadow-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold">انتخاب محل کالا</h3>
                            <button onClick={() => setIsLocationModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <ArmLocationSelector
                            provinceCode={formData.provinceCode}
                            cityCode={formData.cityCode}
                            onProvinceChange={(code, label) => setFormData(prev => ({ ...prev, provinceCode: code, provinceLabel: label, cityCode: '', cityLabel: '' }))}
                            onCityChange={(code, label) => { setFormData(prev => ({ ...prev, cityCode: code, cityLabel: label })); setErrors(prev => ({ ...prev, city: '' })); }}
                            error={errors.city}
                        />
                        <div className="flex gap-3 mt-6 pt-4 border-t border-outline-variant">
                            <button type="button" onClick={() => setIsLocationModalOpen(false)} className="flex-1 h-12 border border-outline text-sm text-on-surface rounded-xl hover:bg-surface-container-low transition-colors">انصراف</button>
                            <button type="button" onClick={() => { if (!formData.cityCode) { setErrors(prev => ({ ...prev, city: 'لطفاً شهر را انتخاب کنید' })); return; } setIsLocationModalOpen(false); }} className="flex-1 h-12 bg-primary text-sm text-on-primary rounded-xl hover:bg-primary/90 transition-colors font-medium">تأیید</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}