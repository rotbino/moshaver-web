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
import { Package, Send, Edit2, X, MapPin, Clock, Shield, ArrowDown, Info, Search, AlertCircle, CreditCard, TrendingUp, Zap } from 'lucide-react';
import { ArmLocationSelector } from '@/app/components/ArmLocationSelector';
import { NumberInput } from "@/components/common";
import { cn } from '@/lib/utils';

export default function CreateAdPage() {
    const router = useRouter();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { currentSlug, currentArm } = useSelector((state: RootState) => state.arm);
    const { data: business, isLoading: businessLoading } = useActiveBusiness();
    const { data: categoryTree, isLoading: categoriesLoading } = useArmCategoryTree(currentSlug || 'barton');
    const { data: creditBalance, refetch: refetchBalance } = useCreditBalance();

    const [formData, setFormData] = useState({
        categoryId: '', productType: '', unitPrice: 0, minQuantity: 0,
        availableQuantity: 0, cityCode: '', cityLabel: '', provinceCode: '', provinceLabel: '',
        validityDays: '1', isAnonymous: false, isBumped: false,
    });
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const createAdMutation = useCreateAd();

    // ═══════════════ تنظیمات ═══════════════
    const armConfig = currentArm?.config as any || {};
    const priceTable = armConfig.modules?.priceTable || {};

    const currencyUnit = useMemo(() => {
        const map: Record<string, string> = { IRR: 'تومان', IRR1: 'ریال', USD: 'دلار', EUR: 'یورو' };
        return map[armConfig.economy?.currency || 'IRR'] || 'تومان';
    }, [armConfig.economy?.currency]);

    const maxFreeAdsPerMonth = priceTable.maxFreeAdsPerMonth ?? 5;
    const bumpCost = priceTable.bumpCost ?? 10;
    const adValidityDefaultDays = priceTable.adValidityDefaultDays ?? 7;
    const allowAnonymous = priceTable.allowAnonymousPublishing ?? true;

    const [activeAdsCount, setActiveAdsCount] = useState(0);
    useEffect(() => {
        if (!business || !currentSlug) return;
        const active = business.ads?.filter((a: any) => a.status === 'active' && a.armId === currentArm?.id).length || 0;
        setActiveAdsCount(active);
    }, [business, currentSlug, currentArm]);

    const remainingFreeAds = Math.max(0, maxFreeAdsPerMonth - activeAdsCount);
    const isAdFree = remainingFreeAds > 0;

    // ═══════════════ دسته‌بندی‌ها ═══════════════
    const categoriesWithUnits = useMemo(() => {
        if (!categoryTree) return [];
        const flatten = (nodes: any[]): any[] => {
            let res: any[] = [];
            for (const p of nodes) {
                if (p.isSelected) {
                    res.push({ id: p.id, name: p.title, defaultUnitId: p.defaultUnitId || '', unitTitle: p.unitTitle || 'تن', unitShortCode: p.unitShortCode || 'تن', defaultMinQuantity: p.defaultMinQuantity || 0, example: p.example || '' });
                }
                if (p.children?.length) res = res.concat(flatten(p.children));
            }
            return res;
        };
        return flatten(categoryTree);
    }, [categoryTree]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categoriesWithUnits;
        return categoriesWithUnits.filter(c => c.name.includes(searchQuery.trim()));
    }, [categoriesWithUnits, searchQuery]);

    const selectedCategoryData = useMemo(() => categoriesWithUnits.find(c => c.id === formData.categoryId) || null, [formData.categoryId, categoriesWithUnits]);
    const unitName = selectedCategoryData?.unitTitle || 'تن';
    const categoryExample = selectedCategoryData?.example || '';

    // ═══════════════ موقعیت ═══════════════
    const locationTree = currentArm?.locationTree || [];
    const totalCities = useMemo(() => {
        let c = 0;
        for (const p of locationTree) if (p.children) c += p.children.filter((x: any) => x.type === 'city').length;
        return c;
    }, [locationTree]);
    const hasSingleCity = totalCities === 1;
    const singleCityData = useMemo(() => {
        if (!hasSingleCity) return null;
        for (const p of locationTree) {
            const city = p.children?.find((c: any) => c.type === 'city');
            if (city) return { city, province: p };
        }
        return null;
    }, [locationTree, hasSingleCity]);

    useEffect(() => {
        if (business?.cityCode && !hasSingleCity) {
            setFormData(p => ({ ...p, cityCode: business.cityCode || '', cityLabel: business.city || '', provinceCode: business.provinceCode || '', provinceLabel: business.province || '' }));
        } else if (hasSingleCity && singleCityData) {
            setFormData(p => ({ ...p, cityCode: singleCityData.city.cityCode || singleCityData.city.id, cityLabel: singleCityData.city.title, provinceCode: singleCityData.province.provinceCode || singleCityData.province.id, provinceLabel: singleCityData.province.title }));
        }
    }, [business, hasSingleCity, singleCityData]);

    const validityOptions = [
        { value: String(adValidityDefaultDays), label: `${adValidityDefaultDays} روز (پیش‌فرض)` },
        { value: '1', label: '۱ روز' },
        { value: '7', label: '۷ روز' },
    ];

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login?redirect=/ad/create'); return; }
        if (!businessLoading && !business) { router.push('/business/register'); toast.info('ابتدا کسب‌وکار خود را ثبت کنید'); }
    }, [isAuthenticated, business, businessLoading, router]);

    // ═══════════════ validate ═══════════════
    const validate = () => {
        const e: Record<string, string> = {};
        if (!formData.categoryId) e.categoryId = 'دسته کالا الزامی است';
        if (!formData.productType.trim()) e.productType = 'نوع کالا را وارد کنید';
        if (formData.unitPrice <= 0) e.unitPrice = 'قیمت معتبر وارد کنید';
        if (formData.minQuantity <= 0) e.minQuantity = 'حداقل خرید را وارد کنید';
        if (formData.availableQuantity <= 0) e.availableQuantity = 'موجودی را وارد کنید';
        if (!formData.cityCode) e.city = 'محل کالا را انتخاب کنید';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const title = formData.productType ? `${selectedCategoryData?.name || ''} ${formData.productType}` : selectedCategoryData?.name || '';
            await createAdMutation.mutateAsync({
                armSlug: currentSlug || 'barton', categoryId: formData.categoryId,
                unitId: selectedCategoryData?.defaultUnitId || '', title, productType: formData.productType,
                unitPrice: formData.unitPrice, minQuantity: formData.minQuantity,
                availableQuantity: formData.availableQuantity,
                city: formData.cityLabel, cityCode: formData.cityCode, provinceCode: formData.provinceCode,
                locationDetail: '', validityDays: parseInt(formData.validityDays),
                isAnonymous: formData.isAnonymous, isBumped: formData.isBumped,
            });
            await refetchBalance();
            toast.success('آگهی ثبت شد');
            router.push('/');
        } catch (error: any) {
            if (error?.data?.errorCode === 'INSUFFICIENT_CREDIT') {
                toast.error('اعتبار کافی نیست'); await refetchBalance();
            } else toast.error(error?.message || 'خطا');
        } finally { setIsSubmitting(false); }
    };

    const isLoading = businessLoading || categoriesLoading;
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" /><p className="mt-4 text-on-surface-variant">در حال بارگذاری...</p></div>
        </div>
    );

    // ═══════════════ RENDER ═══════════════
    return (
        <div className="min-h-screen flex flex-col bg-surface">
            <FormHeader title="ثبت قیمت جدید" backUrl="/" />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-20 pb-24 lg:pb-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ═══════════ ستون اصلی (۳/۵) ═══════════ */}
                    <div className="lg:col-span-3 space-y-5">
                        {/* دسته‌بندی */}
                        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5">
                            <label className="text-sm font-semibold block mb-3">دسته‌بندی کالا <span className="text-error">*</span></label>
                            <div className="relative mb-3">
                                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="جستجو..."
                                       className="w-full bg-surface border border-outline rounded-xl h-10 px-4 pr-10 text-sm focus:ring-1 focus:ring-primary/30 outline-none" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                                {filteredCategories.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {filteredCategories.map(cat => (
                                            <button key={cat.id} type="button"
                                                    onClick={() => setFormData(p => ({ ...p, categoryId: cat.id, minQuantity: cat.defaultMinQuantity || 0, unitPrice: 0, productType: '' }))}
                                                    className={cn("p-3 rounded-xl border-2 text-center transition-all text-sm font-medium",
                                                        formData.categoryId === cat.id ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/30 hover:border-primary/30")}>
                                                {cat.name}
                                                <span className="block text-[10px] text-on-surface-variant mt-0.5">واحد: {cat.unitTitle}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : <div className="text-center py-8 text-sm text-on-surface-variant">موردی یافت نشد</div>}
                            </div>
                            {errors.categoryId && <p className="text-error text-xs mt-2">{errors.categoryId}</p>}
                        </div>

                        {/* نوع کالا + قیمت + موجودی */}
                        {selectedCategoryData && (
                            <div className="space-y-5">
                                {/* نوع کالا */}
                                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 space-y-2">
                                    <label className="text-sm font-semibold block"><Package className="w-4 h-4 inline ml-1 text-primary" />نوع {selectedCategoryData.name} <span className="text-error">*</span></label>
                                    <input type="text" value={formData.productType}
                                           onChange={e => { setFormData(p => ({ ...p, productType: e.target.value })); if (errors.productType) setErrors(p => ({ ...p, productType: '' })); }}
                                           placeholder={categoryExample ? `مثال: ${categoryExample}` : `مثال: درجه یک`}
                                           className="w-full bg-surface border border-outline rounded-xl h-12 px-4 text-sm focus:ring-1 focus:ring-primary/30 outline-none" />
                                    {errors.productType && <p className="text-error text-xs">{errors.productType}</p>}
                                </div>

                                {/* قیمت و حجم */}
                                <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-2 text-primary"><Package className="w-5 h-5" /><h3 className="font-bold text-sm">قیمت‌گذاری</h3></div>
                                    <div className="bg-surface rounded-xl p-4 space-y-2">
                                        <label className="text-xs font-medium">حداقل حجم فروش ({unitName}) <span className="text-error">*</span></label>
                                        <NumberInput value={formData.minQuantity || undefined}
                                                     onChange={v => { setFormData(p => ({ ...p, minQuantity: v || 0 })); if (errors.minQuantity) setErrors(p => ({ ...p, minQuantity: '' })); }}
                                                     unit={unitName} className="w-full h-12 bg-surface-container-lowest border border-outline rounded-xl px-4 text-lg font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                                        {errors.minQuantity && <p className="text-error text-xs">{errors.minQuantity}</p>}
                                    </div>
                                    <div className="flex justify-center"><ArrowDown className="w-5 h-5 text-on-surface-variant/50" /></div>
                                    <div className="bg-surface rounded-xl p-4 space-y-2">
                                        <label className="text-xs font-medium">قیمت هر {unitName} <span className="text-error">*</span></label>
                                        <NumberInput value={formData.unitPrice || undefined}
                                                     onChange={v => { setFormData(p => ({ ...p, unitPrice: v || 0 })); if (errors.unitPrice) setErrors(p => ({ ...p, unitPrice: '' })); }}
                                                     unit={currencyUnit} className="w-full h-12 bg-surface-container-lowest border border-outline rounded-xl px-4 text-lg font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                                        {errors.unitPrice && <p className="text-error text-xs">{errors.unitPrice}</p>}
                                    </div>
                                </div>

                                {/* موجودی */}
                                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 space-y-2">
                                    <label className="text-sm font-semibold block">موجودی انبار ({unitName}) <span className="text-error">*</span></label>
                                    <NumberInput value={formData.availableQuantity || undefined}
                                                 onChange={v => { setFormData(p => ({ ...p, availableQuantity: v || 0 })); if (errors.availableQuantity) setErrors(p => ({ ...p, availableQuantity: '' })); }}
                                                 unit={unitName} className="w-full h-12 bg-surface-container-lowest border border-outline rounded-xl px-4 focus:ring-1 focus:ring-primary/30 outline-none" />
                                    {errors.availableQuantity && <p className="text-error text-xs">{errors.availableQuantity}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ═══════════ ستون کناری (۲/۵) ═══════════ */}
                    <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-24 lg:self-start">
                        {/* موقعیت */}
                        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 space-y-2">
                            <label className="text-sm font-semibold block"><MapPin className="w-4 h-4 inline ml-1 text-primary" />محل کالا <span className="text-error">*</span></label>
                            {hasSingleCity ? (
                                <div className="flex items-center gap-2 p-3 bg-surface border rounded-xl text-sm"><MapPin className="w-4 h-4 text-primary" />{singleCityData?.city.title}</div>
                            ) : (
                                <button type="button" onClick={() => setIsLocationModalOpen(true)}
                                        className="w-full flex items-center justify-between p-3 bg-surface border border-outline rounded-xl text-sm hover:border-primary/50 transition-colors">
                                    <span className={formData.cityLabel ? "text-on-surface" : "text-on-surface-variant"}>{formData.cityLabel || 'انتخاب شهر...'}</span>
                                    <Edit2 className="w-4 h-4 text-primary" />
                                </button>
                            )}
                            {errors.city && <p className="text-error text-xs">{errors.city}</p>}
                        </div>

                        {/* اعتبار */}
                        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 space-y-2">
                            <label className="text-sm font-semibold block"><Clock className="w-4 h-4 inline ml-1 text-primary" />مدت اعتبار</label>
                            <select value={formData.validityDays} onChange={e => setFormData(p => ({ ...p, validityDays: e.target.value }))}
                                    className="w-full bg-surface border border-outline rounded-xl h-12 px-3 text-sm appearance-none focus:ring-1 focus:ring-primary/30 outline-none">
                                {validityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        {/* نردبان + ناشناس */}
                        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium">نردبان <Zap className="w-4 h-4 inline text-primary" /></span>
                                    <p className="text-[10px] text-on-surface-variant">مصرف {bumpCost} اعتبار</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={formData.isBumped} onChange={e => { setFormData(p => ({ ...p, isBumped: e.target.checked })); if (e.target.checked) toast.info(`${bumpCost} اعتبار کسر می‌شود`); }} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                                </label>
                            </div>
                            {allowAnonymous && (
                                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
                                    <span className="text-sm font-medium">انتشار ناشناس</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={formData.isAnonymous} onChange={e => setFormData(p => ({ ...p, isAnonymous: e.target.checked }))} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* اعتبار + انتشار */}
                        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1"><Shield className="w-4 h-4" />اعتبار:</span>
                                <span className="font-bold">{creditBalance?.balance || 0}</span>
                            </div>
                            {isAdFree ? (
                                <div className="bg-green-50 text-green-700 p-3 rounded-xl text-xs">{remainingFreeAds} آگهی رایگان باقی‌مانده</div>
                            ) : (
                                <div className="bg-warning/5 border border-warning/20 p-3 rounded-xl text-xs text-warning">
                                    سهمیه رایگان تمام شده. هزینه هر آگهی: {bumpCost} اعتبار
                                </div>
                            )}
                            <button type="submit" disabled={isSubmitting}
                                    className="w-full h-12 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 shadow-lg shadow-primary/20">
                                {isSubmitting ? <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> : <><Send className="w-4 h-4" />ثبت قیمت</>}
                            </button>
                        </div>
                    </div>
                </form>
            </main>

            {/* مودال موقعیت */}
            {!hasSingleCity && isLocationModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface w-full max-w-md rounded-2xl border border-outline-variant shadow-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold">انتخاب محل کالا</h3>
                            <button onClick={() => setIsLocationModalOpen(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <ArmLocationSelector provinceCode={formData.provinceCode} cityCode={formData.cityCode}
                                             onProvinceChange={(code, label) => setFormData(p => ({ ...p, provinceCode: code, provinceLabel: label, cityCode: '', cityLabel: '' }))}
                                             onCityChange={(code, label) => { setFormData(p => ({ ...p, cityCode: code, cityLabel: label })); setErrors(p => ({ ...p, city: '' })); }}
                                             error={errors.city} />
                        <div className="flex gap-3 mt-6 pt-4 border-t">
                            <button type="button" onClick={() => setIsLocationModalOpen(false)} className="flex-1 h-12 border rounded-xl text-sm">انصراف</button>
                            <button type="button" onClick={() => { if (!formData.cityCode) { setErrors(p => ({ ...p, city: 'شهر را انتخاب کنید' })); return; } setIsLocationModalOpen(false); }} className="flex-1 h-12 bg-primary text-on-primary rounded-xl text-sm font-medium">تأیید</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}