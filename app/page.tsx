// app/page.tsx
'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useSelector} from 'react-redux';
import {RootState} from '@/lib/store/store';
import {AppFooter, AppHeader} from '@/app/components';
import {useArms, useVitrine} from '@/lib/api/apiHooks';
import {apiService} from '@/lib/api/apiService';
import {toast} from 'sonner';
import {AlertCircle, Clock, Headphones, MapPin, Package, Phone, RefreshCw, TrendingUp, X} from 'lucide-react';
import {LocationFilter} from '@/app/components/LocationFilter';
import {FiltersProvider, useFilters} from '@/lib/hooks/useFilters';
import {cn} from '@/lib/utils';

export default function HomePage() {
    return (
        <FiltersProvider>
            <HomePageContent/>
        </FiltersProvider>
    );
}

function HomePageContent() {
    const router = useRouter();
    const {currentSlug, currentArm, isLoading: armLoading} = useSelector((state: RootState) => state.arm);
    const {isAuthenticated} = useSelector((state: RootState) => state.auth);
    const {getFilterParams, addFilter, removeFilter, clearFilters, otherFilters, location} = useFilters();

    const [isCheckingArm, setIsCheckingArm] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [selectedAd, setSelectedAd] = useState<any>(null);
    const [isCalling, setIsCalling] = useState(false);

    const vitrineSlug = currentSlug || 'barton';
    const filterParams = useMemo(() => getFilterParams(), [getFilterParams]);

    useEffect(() => {
        if (selectedAd) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('select-none');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('select-none');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('select-none');
        };
    }, [selectedAd]);

    const categories = useMemo(() => {
        if (!currentArm?.categoryTree) return [];
        const flattenCategories = (nodes: any[]): any[] => {
            let result: any[] = [];
            for (const node of nodes) {
                if (node.isSelected === true) {
                    result.push({
                        id: node.id,
                        name: node.title,
                        path: node.path,
                        level: node.level,
                        unitShortCode: node.unitShortCode || 'تن'
                    });
                }
                if (node.children && node.children.length > 0) result = result.concat(flattenCategories(node.children));
            }
            return result;
        };
        return flattenCategories(currentArm.categoryTree);
    }, [currentArm?.categoryTree]);

    const categoryUnitMap = useMemo(() => {
        const map = new Map();
        categories.forEach(cat => map.set(cat.id, cat.unitShortCode || 'تن'));
        return map;
    }, [categories]);

    const selectedCategory = otherFilters.find(f => f.type === 'category');
    const volumeFilter = otherFilters.find(f => f.type === 'volume');
    const selectedCategoryId = selectedCategory?.value || 'all';
    const selectedCategoryName = selectedCategory?.label || '';
    const minQuantity = filterParams.minQuantity || 0;
    const hasVolumeSelected = minQuantity > 0;

    let locationLabel = 'ایران';
    if (location.cityId) locationLabel = location.cityLabel;
    else if (location.provinceId) locationLabel = `استان ${location.provinceLabel}`;

    const selectedUnit = useMemo(() => {
        if (selectedCategory) {
            const cat = categories.find(c => c.id === selectedCategory.value);
            return cat?.unitShortCode || 'تن';
        }
        return 'تن';
    }, [selectedCategory, categories]);

    const handleCategorySelect = (categoryId: string) => {
        const existingCategory = otherFilters.find(f => f.type === 'category');
        if (existingCategory) removeFilter(existingCategory.id);
        if (categoryId !== 'all') {
            const category = categories.find(c => c.id === categoryId);
            addFilter({id: `category-${categoryId}`, label: category?.name || '', value: categoryId, type: 'category'});
        }
    };

    const handleVolumeChange = (value: number) => {
        if (value <= 0) {
            const existing = otherFilters.find(f => f.type === 'volume');
            if (existing) removeFilter(existing.id);
            return;
        }
        if (volumeFilter) removeFilter(volumeFilter.id);
        addFilter({
            id: `volume-${value}`,
            label: `${value.toLocaleString()} ${selectedUnit}`,
            value: value.toString(),
            type: 'volume'
        });
    };

    const handleClearAll = () => clearFilters();
    const showVolumeFilter = !!selectedCategory;

    const handleContactClick = async (adId: string) => {
        if (!isAuthenticated) {
            router.push(`/login?arm=${currentSlug}&redirect=/${currentSlug}`);
            return;
        }
        if (isCalling) return;
        setIsCalling(true);
        try {
            let isMemberOfArm = false;
            try {
                const arms = await apiService.arm.getUserArms();
                isMemberOfArm = arms.some((a: any) => a.slug === currentSlug);
            } catch (error) {
            }

            if (!isMemberOfArm) {
                try {
                    await apiService.arm.join(currentSlug || 'barton');
                    toast.success('با موفقیت در بازار عضو شدید');
                    setIsMember(true);
                } catch (joinError: any) {
                    if (joinError?.data?.errorCode !== 'ALREADY_MEMBER') {
                        toast.error('برای مشاهده شماره تماس، ابتدا عضو بازار شوید');
                        setIsCalling(false);
                        return;
                    }
                }
            }
            const contactInfo = await apiService.ad.getContact(adId);
            if (window.innerWidth < 768) {
                window.location.href = `tel:${contactInfo.phone}`;
                toast.success(`در حال اتصال به ${contactInfo.businessName}...`);
            } else {
                toast.info(`${contactInfo.businessName}\nشماره: ${contactInfo.phone}\n${contactInfo.remainingCalls} تماس باقی مانده`, {duration: 8000});
                try {
                    await navigator.clipboard.writeText(contactInfo.phone);
                    toast.success('شماره تماس کپی شد');
                } catch {
                }
            }
        } catch (error: any) {
            if (error?.data?.errorCode === 'DAILY_CALL_LIMIT_EXCEEDED') toast.error(error?.data?.message || 'محدودیت تماس روزانه تکمیل شده است');
            else if (error?.data?.errorCode === 'NOT_MEMBER') toast.error('برای مشاهده شماره تماس، ابتدا عضو بازار شوید');
            else toast.error(error?.message || 'خطا در دریافت اطلاعات تماس');
        } finally {
            setIsCalling(false);
        }
    };

    const {
        data: vitrineData,
        isLoading: vitrineLoading,
        error: vitrineError,
        refetch: refetchVitrine
    } = useVitrine(vitrineSlug, filterParams);
    const {data: armsData, isLoading: armsLoading, error: armsError, refetch: refetchArms} = useArms();

    useEffect(() => {
        const checkMembership = async () => {
            if (!isAuthenticated || !currentSlug) {
                setIsMember(false);
                return;
            }
            try {
                const arms = await apiService.arm.getUserArms();
                const member = arms.some((a: any) => a.slug === currentSlug);
                setIsMember(member);
            } catch (error: any) {
                if (error?.response?.status === 401 || error?.data?.errorCode === 'UNAUTHORIZED') {
                    setIsMember(false);
                    return;
                }
                console.error('Error checking membership:', error);
            }
        };
        checkMembership();
    }, [isAuthenticated, currentSlug]);

    useEffect(() => {
        if (armLoading) return;
        if (!currentSlug || !currentArm) {
            const lastSlug = localStorage.getItem('lastArmSlug');
            if (lastSlug) {
                router.replace(`/${lastSlug}`);
                return;
            }
            router.replace('/no-arm');
            return;
        }
        setIsCheckingArm(false);
    }, [currentSlug, currentArm, armLoading, router]);

    const handleJoinClick = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/`);
            return;
        }
        try {
            await apiService.arm.join(currentSlug || 'barton');
            toast.success('با موفقیت در بازار عضو شدید');
            setIsMember(true);
        } catch (error: any) {
            if (error?.data?.errorCode === 'ALREADY_MEMBER') {
                toast.info('شما قبلاً عضو این بازار هستید');
                setIsMember(true);
            } else {
                toast.error(error?.message || 'خطا در عضویت در بازار');
            }
        }
    };

    const hasError = vitrineError || armsError;
    const isInitialLoading = armLoading || armsLoading;

    if (hasError) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <AppHeader showJoinButton={false}/>
                <main className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center max-w-md"><AlertCircle className="w-16 h-16 text-error mx-auto mb-4"/>
                        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">خطا در دریافت
                            اطلاعات</h2><p
                            className="text-body-md text-on-surface-variant mb-6">{vitrineError?.message || armsError?.message || 'خطا در دریافت اطلاعات'}</p>
                        <button onClick={() => {
                            refetchVitrine();
                            refetchArms();
                        }}
                                className="bg-primary text-on-primary px-6 py-2 font-label-md hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto rounded-md">
                            <RefreshCw className="w-4 h-4"/> تلاش مجدد
                        </button>
                    </div>
                </main>
                <AppFooter activeTab="dashboard"/>
            </div>
        );
    }

    if (isInitialLoading || isCheckingArm || !currentSlug || !currentArm) {
        return (<div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"/>
                <p className="mt-4 text-on-surface-variant">در حال بارگذاری...</p></div>
        </div>);
    }

    const hasAds = vitrineData?.ads && vitrineData.ads.length > 0;

    const renderVolumeBar = () => {
        if (!showVolumeFilter) return null;
        return (
            <div className="flex  items-center gap-5 py-3 border-t border-outline-variant/30 lg:border-t-0 lg:pt-0">
                <span className="text-[11px] font-medium text-on-surface-variant whitespace-nowrap ml-3">قیمتهای بهینه با تعیین حجم:</span>
                <div
                    className="flex items-center bg-surface-container-high/50 p-0.5 rounded-sm border border-outline-variant/20 w-full max-w-xs lg:w-full">
                    {[10, 50, 100, 500, 1000].map((vol) => (
                        <button key={vol} onClick={() => handleVolumeChange(vol)}
                                className={cn("flex-1 text-center py-1.5 text-[11px] font-medium rounded-sm transition-all duration-200", minQuantity === vol ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface")}>
                            {vol.toLocaleString()}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderVolumeHeader = () => {
        if (!hasVolumeSelected) return null;
        let titleText = `بهترین قیمتها برای خرید ${minQuantity.toLocaleString()} ${selectedUnit}`;
        if (selectedCategoryName) titleText += ` ${selectedCategoryName}`;
        titleText += ` در ${locationLabel}`;
        return (
            <div
                className="flex items-center justify-between px-3 py-2 mb-3 bg-primary/5 border border-primary/20 border-r-4 border-r-primary rounded-sm">
                <span className="text-[10px] sm:text-[11px] text-on-surface-variant">{titleText}</span>
                <button onClick={handleClearAll}
                        className="text-on-surface-variant/50 hover:text-error hover:bg-error/10 p-1.5 rounded-sm transition-colors"
                        title="پاک کردن فیلترها"><X className="w-4 h-4"/></button>
            </div>
        );
    };

    const renderAdCard = (ad: any) => {
    const unitShortCode = categoryUnitMap.get(ad.categoryId) || ad.unit?.shortCode || 'تن';
    const paymentMethods = ad.customFields?.paymentMethods;
    const hasCheque = paymentMethods?.cheque?.enabled;
    const hasInstallment = paymentMethods?.installment?.enabled;

    return (
        <div key={ad.id}
            onClick={() => setSelectedAd(ad)}
            className="bg-surface-container-lowest border border-outline-variant p-3 pt-5 flex flex-col gap-2 rounded-sm group hover:shadow-md transition-shadow min-w-0 relative cursor-pointer">

            {/* نردبان */}
            {ad.isBumped && (
                <div className="absolute top-1 right-2 flex items-center h-3.5 gap-1 text-red-600 bg-red-50/90 px-2 py-0.5 rounded-full border border-red-200 shadow-sm z-10">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[8px] font-bold text-red-600">نردبان</span>
                </div>
            )}

            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 min-w-11 bg-surface-container-high flex items-center justify-center rounded-sm border border-outline-variant/50">
                        <span className="material-symbols-outlined text-primary text-xl">
                            {ad.category?.title === 'سیمان' ? 'construction' : ad.category?.title === 'میلگرد' ? 'architecture' : 'grid_view'}
                        </span>
                    </div>
                    <div className="flex flex-col min-w-0 gap-0.5">
                        {/* عنوان + گروه کالا */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-sm text-on-surface truncate">{ad.productType || ad.title}</h3>
                            {ad.category?.title && (
                                <span className="text-[9px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-full flex-shrink-0">
                                    {ad.category.title}
                                </span>
                            )}
                        </div>
                        {/* کسب‌وکار */}
                        <div className="flex items-center gap-1 text-[10px] text-on-surface-variant truncate">
                            <span>{ad.business?.name || 'نامشخص'}</span>
                            {ad.business?.verificationTier === 'verified' && (
                                <span className="material-symbols-outlined text-[14px] text-green-600">verified</span>
                            )}
                        </div>
                        {/* شرایط فروش */}
                        {(hasCheque || hasInstallment) && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {hasCheque && (
                                    <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">چکی</span>
                                )}
                                {hasInstallment && (
                                    <span className="text-[8px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">اقساط</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-left flex-shrink-0 flex flex-col items-end">
                    <span className="font-bold text-sm text-primary">
                        {ad.unitPrice.toLocaleString()}
                        <span className="text-[9px] font-normal text-on-surface-variant">ت/{unitShortCode}</span>
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleContactClick(ad.id); }} disabled={isCalling}
                        className="bg-primary text-on-primary text-[10px] px-2.5 py-1 rounded-sm active:scale-95 transition-transform font-medium mt-1 flex items-center gap-1 disabled:opacity-50">
                        <Phone className="w-3 h-3" /> تماس
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between text-[10px] border-t border-outline-variant/50 pt-2 mt-1">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-on-surface font-medium bg-surface-container-high px-1.5 py-0.5 rounded-sm">
                        <Package className="w-3 h-3 text-primary" />min: {ad.minQuantity} {unitShortCode}
                    </span>
                    <span className="flex items-center gap-1 text-on-surface-variant">
                        <MapPin className="w-3 h-3" />{ad.city || 'نامشخص'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-on-surface-variant">
                        <Clock className="w-3 h-3" />{Math.ceil((new Date(ad.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60))} س
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedAd(ad); }}
                        className="text-primary text-[10px] font-medium hover:underline">جزئیات</button>
                </div>
            </div>
        </div>
    );
};

    const renderEmptyState = () => (
        <div className="text-center py-12">
            <Package className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4"/>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">{filterParams.categoryId || filterParams.minQuantity ? 'هیچ قیمتی با این فیلترها پیدا نشد' : 'هیچ قیمتی ثبت نشده است'}</h2>
            <p className="text-body-md text-on-surface-variant mb-6">{filterParams.categoryId || filterParams.minQuantity ? 'فیلترهای خود را تغییر دهید' : 'اگر فروشنده عمده هستید قیمت خود را ثبت کنید'}</p>
            {(filterParams.categoryId || filterParams.minQuantity) && (<button onClick={clearFilters}
                                                                               className="bg-surface-container text-on-surface border border-outline-variant px-6 py-2 font-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 mx-auto rounded-sm">
                <RefreshCw className="w-4 h-4"/> پاک کردن فیلترها</button>)}
            {isAuthenticated && (
                <button
                    onClick={() => router.push(`/ad/create?arm=${currentSlug}`)}
                    className="bg-primary text-on-primary px-6 py-2 font-label-md hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto mt-3 rounded-sm"
                >
                    ثبت قیمت جدید
                </button>
            )}
        </div>
    );

    // app/page.tsx
// ⬇ کل بخش return رو با این جایگزین کن

    return (
        <div className="min-h-screen flex flex-col bg-surface lg:pb-0 pb-24">
            {/* ============================================================
            بخش موبایل
            ============================================================ */}
            <div className="lg:hidden flex-1 w-full">
                <AppHeader showJoinButton={true} onJoinClick={handleJoinClick} armSlug={currentSlug} fixed />

                <div className="w-full max-w-7xl mx-auto px-4 pt-16">
                    <div className="bg-surface border-b border-outline-variant/30 py-0">
                        <div className="flex gap-1.5 overflow-x-auto py-3 pill-scroll [&::-webkit-scrollbar]:hidden">
                            {[{id: 'all', name: 'همه'}, ...categories].map((cat) => (
                                <button key={cat.id} onClick={() => handleCategorySelect(cat.id)}
                                        className={cn("whitespace-nowrap px-3.5 py-1.5 text-xs font-medium transition-all duration-200 flex-shrink-0 border border-outline-variant/30", selectedCategoryId === cat.id ? "text-primary font-bold border-primary" : "text-on-surface-variant hover:text-on-surface border-outline-variant/30")}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="fixed top-3 left-2 z-50 bg-white">
                            <LocationFilter/>
                        </div>

                        {renderVolumeBar()}
                    </div>
                    <div className="mt-3">{renderVolumeHeader()}</div>
                    <div className="mt-1">
                        {vitrineLoading ? (<div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"/>
                            <p className="mt-4 text-on-surface-variant">در حال بارگذاری...</p></div>) : hasAds ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{vitrineData.ads.map(renderAdCard)}</div>) : renderEmptyState()}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* بخش دسکتاپ - سایدبار راست | (هدر + محتوا) چپ */}
            {/* ═══════════════════════════════════════════════════ */}
            <div className="hidden lg:flex flex-1 h-screen overflow-hidden">
                {/* سایدبار - فیلترها */}
                <aside className="w-64 flex-shrink-0 bg-surface-container-lowest border-l border-outline-variant/30 overflow-y-auto">
                    <div className="p-4">
                        <h3 className="font-bold text-sm text-on-surface border-b border-outline-variant/30 pb-2 mb-4">فیلترها</h3>
                        <div className="mb-5">
                            <LocationFilter />
                        </div>
                        <div className="border-t border-outline-variant/30 pt-4">
                            <h4 className="text-xs font-semibold text-on-surface-variant mb-2">دسته‌بندی</h4>
                            <div className="flex flex-col gap-1">
                                {[{ id: 'all', name: 'همه' }, ...categories].map((cat) => (
                                    <button key={cat.id} onClick={() => handleCategorySelect(cat.id)}
                                            className={cn("w-full text-right px-3 py-2 text-xs font-medium transition-all duration-200 border border-transparent rounded-lg",
                                                selectedCategoryId === cat.id ? "text-primary bg-primary/40 " : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low")}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {showVolumeFilter && (
                            <div className="border-t border-outline-variant/30 pt-4 mt-4">
                                <h4 className="text-xs font-semibold text-on-surface-variant mb-2">حجم سفارش</h4>
                                <div className="space-y-1">
                                    {[10, 50, 100, 500, 1000].map((vol) => (
                                        <button key={vol} onClick={() => handleVolumeChange(vol)}
                                                className={cn("w-full text-right px-3 py-1.5 text-xs rounded-lg transition-all border border-transparent",
                                                    minQuantity === vol ? "bg-primary text-on-primary border-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low")}>
                                            {vol.toLocaleString()} {selectedUnit}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* بخش اصلی - هدر + محتوا */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* هدر - فقط توی این بخش */}
                    <AppHeader showJoinButton={true} onJoinClick={handleJoinClick} armSlug={currentSlug} fixed={false} />

                    {/* محتوای اسکرول‌شونده */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-6 border-b border-outline-variant/20 bg-surface-container-lowest">
                            {renderVolumeBar()}
                            {renderVolumeHeader()}
                        </div>
                        <div className="p-6">
                            {vitrineLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                                    <p className="mt-4 text-on-surface-variant">در حال بارگذاری...</p>
                                </div>
                            ) : hasAds ? (
                                <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                                    {vitrineData.ads.map(renderAdCard)}
                                </div>
                            ) : (
                                renderEmptyState()
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* فوتر فقط موبایل */}
            <div className="lg:hidden"><AppFooter activeTab="dashboard"/></div>

            {/* دکمه شناور پشتیبانی موبایل */}
            <a href="tel:09196421264"
               className="lg:hidden fixed bottom-28 left-4 z-40 bg-green-600 text-white p-3.5 rounded-full shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center border-4 border-surface"
               title="پشتیبانی"><Headphones className="w-5 h-5"/></a>

            {/* مودال ترکیبی */}
            {selectedAd && (
                <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedAd(null)}/>
                    <div className="relative w-full max-w-2xl lg:max-w-3xl bg-surface z-10 max-h-[90vh] lg:max-h-[85vh] flex flex-col rounded-t-2xl lg:rounded-sm shadow-2xl overflow-hidden border border-outline-variant/50 lg:border-0">

                        {/* هدر */}
                        <div className="flex justify-center pt-3 pb-1 lg:hidden bg-surface-container-low">
                            <div className="w-10 h-1 rounded-full bg-outline-variant"/>
                        </div>
                        <div className="flex items-center justify-between p-4 pb-2 border-b border-outline-variant/30 bg-surface">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-sm">
                        <span className="material-symbols-outlined text-primary text-xl">
                            {selectedAd.category?.title === 'سیمان' ? 'construction' : selectedAd.category?.title === 'میلگرد' ? 'architecture' : 'grid_view'}
                        </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="font-bold text-base text-on-surface">{selectedAd.title}</h2>
                                        {selectedAd.productType && (
                                            <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">
                                    {selectedAd.productType}
                                </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                                        <span>{selectedAd.business?.name}</span>
                                        {selectedAd.business?.verificationTier === 'verified' &&
                                            <span className="material-symbols-outlined text-sm text-green-600">verified</span>}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAd(null)} className="p-1.5 hover:bg-surface-container-high rounded-sm transition-colors">
                                <X className="w-5 h-5 text-on-surface-variant"/>
                            </button>
                        </div>

                        {/* محتوا */}
                        <div className="overflow-y-auto p-4 flex-1 space-y-4">

                            {/* قیمت نقدی */}
                            <div className="bg-primary/5 border border-primary/20 rounded-sm p-3 flex items-center justify-between">
                                <span className="text-sm text-on-surface-variant">قیمت نقدی:</span>
                                <div className="text-left">
                                    <span className="text-xl font-bold text-primary">{selectedAd.unitPrice.toLocaleString()}</span>
                                    <span className="text-xs text-on-surface-variant mr-1">تومان / {categoryUnitMap.get(selectedAd.categoryId) || selectedAd.unit?.shortCode || 'تن'}</span>
                                </div>
                            </div>

                            {/* شرایط فروش - چکی و اقساطی */}
                            {selectedAd.customFields?.paymentMethods && (
                                <div className="space-y-2">
                                    {/* چکی */}
                                    {selectedAd.customFields.paymentMethods.cheque?.enabled && (
                                        <div className="bg-blue-50/50 border border-blue-200 rounded-sm p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">چکی</span>
                                                <span className="text-sm text-on-surface-variant">
                                        تا {selectedAd.customFields.paymentMethods.cheque.maxDays} روز
                                    </span>
                                            </div>
                                            <span className="font-bold text-sm text-on-surface">
                                    {selectedAd.customFields.paymentMethods.cheque.price?.toLocaleString()} تومان
                                </span>
                                        </div>
                                    )}

                                    {/* اقساطی */}
                                    {selectedAd.customFields.paymentMethods.installment?.enabled && (
                                        <div className="bg-green-50/50 border border-green-200 rounded-sm p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">اقساط</span>
                                                <span className="text-sm text-on-surface-variant">
                                        {selectedAd.customFields.paymentMethods.installment.months} ماه
                                                    {selectedAd.customFields.paymentMethods.installment.prepaymentPercent > 0 &&
                                                        ` (${selectedAd.customFields.paymentMethods.installment.prepaymentPercent}٪ پیش)`}
                                    </span>
                                            </div>
                                            <span className="font-bold text-sm text-on-surface">
                                    {selectedAd.customFields.paymentMethods.installment.price?.toLocaleString()} تومان
                                </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* مشخصات فنی */}
                            {selectedAd.customFields?.specs && Object.keys(selectedAd.customFields.specs).length > 0 && (
                                <div>
                                    <h4 className="font-medium text-sm mb-2 text-on-surface">مشخصات فنی</h4>
                                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-sm p-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(selectedAd.customFields.specs).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between text-xs">
                                                    <span className="text-on-surface-variant">{key}</span>
                                                    <span className="font-medium text-on-surface">{value as string}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* اطلاعات پایه */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-surface-container-low border border-outline-variant/50 rounded-sm p-3">
                                    <span className="text-[10px] text-on-surface-variant block mb-1">حداقل سفارش</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-on-surface">{selectedAd.minQuantity}</span>
                                        <span className="text-xs text-on-surface-variant">{categoryUnitMap.get(selectedAd.categoryId) || selectedAd.unit?.shortCode || 'تن'}</span>
                                    </div>
                                </div>
                                <div className="bg-surface-container-low border border-outline-variant/50 rounded-sm p-3">
                                    <span className="text-[10px] text-on-surface-variant block mb-1">موجودی فعلی</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-on-surface">{selectedAd.availableQuantity || 'نامشخص'}</span>
                                        {selectedAd.availableQuantity && <span className="text-xs text-on-surface-variant">{categoryUnitMap.get(selectedAd.categoryId) || selectedAd.unit?.shortCode || 'تن'}</span>}
                                    </div>
                                </div>
                                <div className="bg-surface-container-low border border-outline-variant/50 rounded-sm p-3">
                                    <span className="text-[10px] text-on-surface-variant block mb-1">مکان تحویل</span>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-on-surface-variant"/>
                                        <span className="text-sm font-medium text-on-surface">{selectedAd.city || 'نامشخص'}</span>
                                    </div>
                                </div>
                                <div className="bg-surface-container-low border border-outline-variant/50 rounded-sm p-3">
                                    <span className="text-[10px] text-on-surface-variant block mb-1">اعتبار آگهی</span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-on-surface-variant"/>
                                        <span className="text-sm font-medium text-on-surface">
                                {Math.ceil((new Date(selectedAd.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60))} ساعت
                            </span>
                                    </div>
                                </div>
                            </div>

                            {/* توضیحات */}
                            {selectedAd.description && (
                                <div>
                                    <h4 className="font-medium text-sm mb-2 text-on-surface">توضیحات فروشنده</h4>
                                    <p className="text-sm text-on-surface-variant bg-surface-container-low p-3 rounded-sm border border-outline-variant/30 leading-6">
                                        {selectedAd.description}
                                    </p>
                                </div>
                            )}

                            {/* تاریخچه قیمت */}
                            {selectedAd.priceHistory && selectedAd.priceHistory.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-sm mb-2 text-on-surface flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4"/> تاریخچه قیمت
                                    </h4>
                                    <div className="border border-outline-variant/50 rounded-sm overflow-hidden">
                                        {selectedAd.priceHistory.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-xs bg-surface-container-low border-b border-outline-variant/30 py-2 px-3 last:border-b-0">
                                                <span className="text-on-surface-variant">{new Date(item.updatedAt).toLocaleDateString('fa-IR')}</span>
                                                <span className="font-medium text-on-surface">{item.price.toLocaleString()} تومان</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* دکمه تماس */}
                        <div className="p-4 border-t border-outline-variant/30 bg-surface">
                            <button onClick={() => { setSelectedAd(null); handleContactClick(selectedAd.id); }} disabled={isCalling}
                                    className="w-full bg-primary text-on-primary py-3 rounded-sm font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                <Phone className="w-4 h-4"/> تماس با فروشنده و ثبت سفارش
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}