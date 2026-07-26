// app/admin/ads/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';
import { cn } from '@/lib/utils';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { LocationFilter } from './components/LocationFilter';
import { CategorySidebar } from './components/CategorySidebar';
import { AdsTable } from './components/AdsTable';
import { AdDetailModal } from './components/AdDetailModal';
import { SortField, CategoryNode, ArmOption, AdFilters } from './components/types';

const defaultFilters: AdFilters = {
    search: '', statusFilter: 'all', armFilter: 'all', armName: 'همه بازارها',
    categoryFilter: 'all', minPrice: '', maxPrice: '', cityFilter: '',
    isBumpedFilter: 'all', startDate: null, endDate: null,
};

export default function AdminAdsPage() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [stats, setStats] = useState<any>({});

    const [filters, setFilters] = useState<AdFilters>(defaultFilters);
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);

    const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
    const [arms, setArms] = useState<ArmOption[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());

    const [selectedAd, setSelectedAd] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchAds = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 20, sortBy: sortField, sortOrder };
            if (filters.search) params.search = filters.search;
            if (filters.statusFilter !== 'all') params.status = filters.statusFilter;
            if (filters.armFilter !== 'all') params.armSlug = filters.armFilter;
            if (filters.categoryFilter !== 'all') params.categoryId = filters.categoryFilter;
            if (filters.minPrice) params.minPrice = Number(filters.minPrice);
            if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
            if (filters.cityFilter) params.city = filters.cityFilter;
            if (filters.isBumpedFilter !== 'all') params.isBumped = filters.isBumpedFilter;
            if (filters.startDate) params.startDate = new Date(filters.startDate.valueOf()).toISOString().split('T')[0];
            if (filters.endDate) params.endDate = new Date(filters.endDate.valueOf()).toISOString().split('T')[0];

            const [adsData, statsData] = await Promise.all([
                apiService.admin.ads.getList(params),
                apiService.admin.ads.getStats({
                    armSlug: filters.armFilter !== 'all' ? filters.armFilter : undefined,
                    categoryId: filters.categoryFilter !== 'all' ? filters.categoryFilter : undefined,
                    startDate: filters.startDate ? new Date(filters.startDate.valueOf()).toISOString().split('T')[0] : undefined,
                    endDate: filters.endDate ? new Date(filters.endDate.valueOf()).toISOString().split('T')[0] : undefined,
                }),
            ]);
            setAds(adsData.items);
            setPagination(adsData.pagination);
            setStats(statsData);
        } catch (e: any) { toast.error(e?.message); }
        finally { setLoading(false); }
    }, [page, sortField, sortOrder, filters]);

    useEffect(() => { fetchAds(); }, [fetchAds]);

    const fetchCategories = useCallback(async () => {
        try { const data = await apiService.admin.ads.getCategories(filters.armFilter !== 'all' ? filters.armFilter : undefined); setCategoryTree(data || []); } catch {}
    }, [filters.armFilter]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    useEffect(() => { apiService.admin.ads.getArms().then(d => setArms(d || [])).catch(() => {}); }, []);

    const handleFilterChange = (key: keyof AdFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleClearFilters = () => { setFilters(defaultFilters); setPage(1); setSelectedCategory(null); };

    const handleRowClick = async (ad: any) => {
        try { const d = await apiService.admin.ads.getDetail(ad.id); setSelectedAd(d); setIsDetailOpen(true); } catch { toast.error('خطا'); }
    };

    const handleDeleteAd = async () => {
        if (!selectedAd) return;
        try { await apiService.admin.ads.delete(selectedAd.id); toast.success('حذف شد'); setIsDetailOpen(false); setSelectedAd(null); fetchAds(); } catch (e: any) { toast.error(e?.message); }
    };

    const handleStatusChange = async (status: string) => {
        if (!selectedAd) return;
        try { await apiService.admin.ads.updateStatus(selectedAd.id, status); toast.success('تغییر کرد'); setSelectedAd({ ...selectedAd, status }); fetchAds(); } catch (e: any) { toast.error(e?.message); }
    };

    const getStatusBadge = (status: string) => {
        const m: any = { active: { icon: CheckCircle, cls: 'text-green-600 bg-green-50', label: 'فعال' }, expired: { icon: Clock, cls: 'text-yellow-600 bg-yellow-50', label: 'منقضی' } };
        const s = m[status] || m.active;
        return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full", s.cls)}><s.icon className="w-3 h-3" />{s.label}</span>;
    };

    if (loading && ads.length === 0) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;

    // app/admin/ads/page.tsx
// ⬇ بخش return رو با این جایگزین کن

    return (
        <div className="p-4 md:p-6 max-w-full mx-auto">
            {/* هدر */}
            <div className="flex items-center gap-3 mb-4">
                <h1 className="text-xl font-bold text-on-surface flex-shrink-0">آگهی‌ها</h1>
                <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">{pagination.total.toLocaleString('fa-IR')}</span>
                <div className="relative flex-1 max-w-sm mr-auto">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                    <input type="text" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} placeholder="جستجو..."
                           className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl h-9 pr-9 pl-3 text-sm focus:ring-1 focus:ring-primary/30 outline-none" />
                </div>
            </div>

            {/* نوار فیلتر */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                <FilterBar filters={filters} arms={arms} onFilterChange={handleFilterChange} onClearAll={handleClearFilters} />
            </div>

            <div className="flex gap-4">
                <div className="hidden lg:block w-60 flex-shrink-0">
                    <CategorySidebar categoryTree={categoryTree} selectedCategory={selectedCategory}
                                     expandedIds={expandedCategoryIds} onToggle={id => setExpandedCategoryIds(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
                                     onSelect={id => { setSelectedCategory(id === 'all' ? null : id); handleFilterChange('categoryFilter', id === 'all' ? 'all' : id); }} />
                </div>
                <div className="flex-1 min-w-0">
                    <StatsBar stats={[
                        { label: 'کل', value: stats.total, color: 'text-blue-600' },
                        { label: 'فعال', value: stats.active, color: 'text-green-600' },
                        { label: 'بازدید', value: stats.totalViews, color: 'text-purple-600' },
                        { label: 'تماس', value: stats.totalCalls, color: 'text-orange-600' },
                        { label: 'میانگین', value: stats.avgPrice ? stats.avgPrice.toLocaleString() + ' ت' : '-', color: 'text-primary' },
                    ]} />

                    {/* ⬇ لوکیشن فیلتر - بالای جدول سمت چپ */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex-1" />
                        <LocationFilter
                            armSlug={filters.armFilter !== 'all' ? filters.armFilter : undefined}
                            onLocationChange={(countryCode, provinceCode, city) => {
                                setFilters(prev => ({ ...prev, cityFilter: city || '' }));
                                setPage(1);
                            }}
                            onClear={() => setFilters(prev => ({ ...prev, cityFilter: '' }))}
                            hasFilter={!!filters.cityFilter}
                        />
                    </div>

                    <AdsTable ads={ads} pagination={pagination} page={page}
                              sortField={sortField} sortOrder={sortOrder}
                              onSort={f => { if (sortField === f) setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortOrder('desc'); } }}
                              onPageChange={setPage} onRowClick={handleRowClick} getStatusBadge={getStatusBadge} />
                </div>
            </div>

            <AdDetailModal ad={selectedAd} isOpen={isDetailOpen} onClose={() => { setIsDetailOpen(false); setSelectedAd(null); }}
                           onStatusChange={handleStatusChange} onDelete={handleDeleteAd} />
        </div>
    );
}