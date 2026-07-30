// app/home/HomeContent.tsx
'use client';
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { AppHeader, AppFooter } from '@/app/components';
import { useVitrine } from '@/lib/api/apiHooks';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';
import { Package, RefreshCw, Headphones } from 'lucide-react';
import { useFilters } from '@/lib/hooks/useFilters';
import { cn } from '@/lib/utils';
import CategoryFilter from './CategoryFilter';
import AdCard from './AdCard';
import AdModal from './AdModal';
import {LocationFilter} from "@/app/components/LocationFilter";

export default function HomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentSlug, currentArm, isLoading: armLoading } = useSelector((state: RootState) => state.arm);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { getFilterParams, addFilter, removeFilter, clearFilters, otherFilters } = useFilters();

    const [isCheckingArm, setIsCheckingArm] = useState(true);
    const [selectedAd, setSelectedAd] = useState<any>(null);
    const [isCalling, setIsCalling] = useState(false);
    const [sortByPrice, setSortByPrice] = useState(false);
    const [requireStock, setRequireStock] = useState(false);

    const vitrineSlug = currentSlug || 'barton';
    const baseFilterParams = useMemo(() => getFilterParams(), [getFilterParams]);

    const categoryTree = useMemo(() => currentArm?.categoryTree || [], [currentArm]);

    const selectedCategory = otherFilters.find(f => f.type === 'category');
    const selectedCategoryId = selectedCategory?.value || null;

    const findNodeById = useCallback((nodes: any[], id: string): any => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const selectedNode = useMemo(() => selectedCategoryId ? findNodeById(categoryTree, selectedCategoryId) : null, [selectedCategoryId, categoryTree, findNodeById]);
    const selectedUnit = useMemo(() => selectedNode?.unitShortCode || 'تن', [selectedNode]);
    const isLeaf = selectedNode ? (!selectedNode.children || selectedNode.children.length === 0) : false;

    const volumeFilter = otherFilters.find(f => f.type === 'volume');
    const minQuantity = baseFilterParams.minQuantity || 0;

    const filterParams = useMemo(() => ({
        ...baseFilterParams,
        sort: sortByPrice ? 'unitPrice:asc' : undefined,
        requireSufficientStock: requireStock || undefined,
    }), [baseFilterParams, sortByPrice, requireStock]);

    const handleCategorySelect = useCallback((categoryId: string) => {
        const existing = otherFilters.find(f => f.type === 'category');
        if (existing) removeFilter(existing.id);
        if (categoryId) {
            const node = findNodeById(categoryTree, categoryId);
            addFilter({ id: `category-${categoryId}`, label: node?.title || '', value: categoryId, type: 'category' });
        }
        const params = new URLSearchParams(window.location.search);
        if (categoryId) params.set('category', categoryId); else params.delete('category');
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [otherFilters, removeFilter, addFilter, categoryTree, findNodeById, router]);

    const initialSyncDone = useRef(false);
    useEffect(() => {
        if (initialSyncDone.current || categoryTree.length === 0) return;
        const catId = searchParams.get('category');
        if (catId) {
            const node = findNodeById(categoryTree, catId);
            if (node) {
                addFilter({ id: `category-${catId}`, label: node.title, value: catId, type: 'category' });
                initialSyncDone.current = true;
            }
        }
    }, [categoryTree, searchParams, findNodeById, addFilter]);

    const handleVolumeChange = useCallback((value: number) => {
        if (value <= 0) {
            const existing = otherFilters.find(f => f.type === 'volume');
            if (existing) removeFilter(existing.id);
            return;
        }
        if (volumeFilter) removeFilter(volumeFilter.id);
        addFilter({ id: `volume-${value}`, label: `${value.toLocaleString()} ${selectedUnit}`, value: value.toString(), type: 'volume' });
    }, [otherFilters, removeFilter, addFilter, volumeFilter, selectedUnit]);

    const handleClearAll = useCallback(() => { clearFilters(); setSortByPrice(false); setRequireStock(false); }, [clearFilters]);

    const handleContactClick = useCallback(async (adId: string) => {
        if (!isAuthenticated) { router.push(`/login?arm=${currentSlug}&redirect=/${currentSlug}`); return; }
        if (isCalling) return;
        setIsCalling(true);
        try {
            let isMemberOfArm = false;
            try { const arms = await apiService.arm.getUserArms(); isMemberOfArm = arms.some((a: any) => a.slug === currentSlug); } catch (e) {}
            if (!isMemberOfArm) {
                try { await apiService.arm.join(currentSlug || 'barton'); } catch (joinError: any) {
                    if (joinError?.data?.errorCode !== 'ALREADY_MEMBER') { toast.error('برای مشاهده شماره تماس، ابتدا عضو بازار شوید'); setIsCalling(false); return; }
                }
            }
            const contactInfo = await apiService.ad.getContact(adId);
            if (window.innerWidth < 768) { window.location.href = `tel:${contactInfo.phone}`; }
            else { toast.info(`${contactInfo.businessName}\nشماره: ${contactInfo.phone}`, { duration: 8000 }); navigator.clipboard.writeText(contactInfo.phone).catch(()=>{}); }
        } catch (error: any) {
            if (error?.data?.errorCode === 'DAILY_CALL_LIMIT_EXCEEDED') toast.error(error?.data?.message || 'محدودیت تماس روزانه');
            else if (error?.data?.errorCode === 'NOT_MEMBER') toast.error('برای مشاهده شماره تماس، ابتدا عضو بازار شوید');
            else toast.error(error?.message || 'خطا');
        } finally { setIsCalling(false); }
    }, [isAuthenticated, isCalling, currentSlug, router]);

    const { data: vitrineData, isLoading: vitrineLoading } = useVitrine(vitrineSlug, filterParams);

    useEffect(() => {
        if (armLoading) return;
        if (!currentSlug || !currentArm) { const lastSlug = localStorage.getItem('lastArmSlug'); if (lastSlug) router.replace(`/${lastSlug}`); else router.replace('/no-arm'); return; }
        setIsCheckingArm(false);
    }, [currentSlug, currentArm, armLoading, router]);

    if (armLoading || isCheckingArm) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" /></div>;

    const hasAds = vitrineData?.ads && vitrineData.ads.length > 0;

    const renderSortAndStockRow = () => {
        if (!isLeaf || minQuantity <= 0) return null;
        const descText = `بهترین پیشنهادها برای خرید ${minQuantity.toLocaleString()} ${selectedUnit} ${selectedNode?.title || ''}`;

        return (
            <>
                {/* === تبلت و دسکتاپ (≥۶۴۰px) === */}
                <div className="hidden sm:flex items-center justify-between gap-3 py-2 px-5  mb-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{descText}</div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
                            <div className="relative flex items-center">
                                <input type="checkbox" checked={sortByPrice} onChange={(e) => setSortByPrice(e.target.checked)} className="peer sr-only" />
                                <div className="w-4 h-4 rounded border-2 border-outline-variant bg-surface-container-lowest peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                                    {sortByPrice && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                            </div>
                            <span>بهترین قیمت</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
                            <div className="relative flex items-center">
                                <input type="checkbox" checked={requireStock} onChange={(e) => setRequireStock(e.target.checked)} className="peer sr-only" />
                                <div className="w-4 h-4 rounded border-2 border-outline-variant bg-surface-container-lowest peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                                    {requireStock && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                            </div>
                            <span>موجودی کافی</span>
                        </label>
                        <LocationFilter />
                    </div>
                </div>

                {/* === موبایل (<۶۴۰px) === */}
                <div className="flex sm:hidden flex-col gap-3 py-3 px-3">
                    <div className="flex items-center  gap-3">
                        <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
                            <div className="relative flex items-center">
                                <input type="checkbox" checked={sortByPrice} onChange={(e) => setSortByPrice(e.target.checked)} className="peer sr-only" />
                                <div className="w-4 h-4 rounded border-2 border-outline-variant bg-surface-container-lowest peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                                    {sortByPrice && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                            </div>
                            <span className={"text-[11px]"}>بهترین قیمت</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
                            <div className="relative flex items-center">
                                <input type="checkbox" checked={requireStock} onChange={(e) => setRequireStock(e.target.checked)} className="peer sr-only" />
                                <div className="w-4 h-4 rounded border-2 border-outline-variant bg-surface-container-lowest peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                                    {requireStock && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                            </div>
                            <span className={"text-[11px]"}>موجودی کافی</span>
                        </label>
                        <LocationFilter />
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">{descText}</div>
                </div>
            </>
        );
    };

    const renderEmptyState = () => (
        <div className="text-center py-16 px-4">
            <Package className="w-20 h-20 text-on-surface-variant/20 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-on-surface mb-3">{filterParams.categoryId || filterParams.minQuantity ? 'هیچ قیمتی با این فیلترها پیدا نشد' : 'هنوز قیمتی ثبت نشده است'}</h2>
            <p className="text-sm text-on-surface-variant mb-8 max-w-md mx-auto leading-relaxed">{filterParams.categoryId || filterParams.minQuantity ? 'فیلترهای انتخاب‌شده را تغییر دهید یا از دسته‌بندی‌های دیگر دیدن کنید.' : 'اگر فروشنده عمده هستید، همین حالا اولین قیمت خود را ثبت کنید.'}</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
                {(filterParams.categoryId || filterParams.minQuantity) && (
                    <button onClick={handleClearAll} className="h-10 px-5 bg-surface-container border border-outline-variant text-on-surface rounded-md text-sm font-medium hover:bg-surface-container-high transition-colors flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> پاک کردن فیلترها
                    </button>
                )}
                {isAuthenticated && (
                    <button onClick={() => router.push(`/ad/create?arm=${currentSlug}`)} className="h-10 px-5 bg-primary text-on-primary rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                        ثبت قیمت جدید
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-surface lg:pb-0 pb-24 ">
            <div className="flex-1 w-full">
                <AppHeader showLocation />
                <div className="w-full mx-auto pt-16 lg:pt-0">
                    <CategoryFilter
                        categoryTree={categoryTree}
                        selectedCategoryId={selectedCategoryId}
                        onSelect={handleCategorySelect}
                        isLeaf={isLeaf}
                        selectedUnit={selectedUnit}
                        minQuantity={minQuantity}
                        onVolumeChange={handleVolumeChange}
                    />
                    {renderSortAndStockRow()}
                    <div className="px-3">
                        {vitrineLoading ? (
                            <div className="text-center py-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
                                <p className="text-sm text-on-surface-variant">در حال بارگذاری قیمت‌ها...</p>
                            </div>
                        ) : hasAds ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {vitrineData.ads.map((ad: any) => (
                                    <AdCard key={ad.id} ad={ad} onContact={handleContactClick} onDetail={setSelectedAd} />
                                ))}
                            </div>
                        ) : (
                            renderEmptyState()
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:hidden"><AppFooter activeTab="dashboard" /></div>
            <a href="tel:09196421264" className="lg:hidden fixed bottom-28 left-4 z-40 bg-green-600 text-white p-3.5 rounded-full shadow-lg shadow-green-600/30 hover:bg-green-700 active:scale-95 transition-all">
                <Headphones className="w-5 h-5" />
            </a>
            {selectedAd && <AdModal ad={selectedAd} onClose={() => setSelectedAd(null)} onContact={handleContactClick} />}
        </div>
    );
}