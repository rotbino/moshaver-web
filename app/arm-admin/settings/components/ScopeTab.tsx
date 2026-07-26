// app/arm-admin/settings/components/ScopeTab.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { MapPin, Package, Building2, Lock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScopeTab() {
    const { currentArm } = useSelector((state: RootState) => state.arm);

    const locationTree: any[] = currentArm?.locationTree || [];
    const categoryTree: any[] = currentArm?.categoryTree || [];
    const supplierIndustries: any[] = (currentArm as any)?.config?.supplierIndustries || [];
    const buyerIndustries: any[] = (currentArm as any)?.config?.buyerIndustries || [];

    // استان پیش‌فرض: اولین استانی که شهر انتخاب‌شده داره
    const [activeProvinceId, setActiveProvinceId] = useState<string | null>(() => {
        const firstWithCities = locationTree.find((p: any) =>
            p.children?.some((c: any) => c.isSelected)
        );
        return firstWithCities?.id || locationTree[0]?.id || null;
    });

    // استان فعال
    const activeProvince = useMemo(() => {
        return locationTree.find((p: any) => p.id === activeProvinceId) || null;
    }, [locationTree, activeProvinceId]);

    // شهرهای انتخاب‌شده استان فعال
    const activeCities = useMemo(() => {
        if (!activeProvince) return [];
        return activeProvince.children?.filter((c: any) => c.isSelected) || [];
    }, [activeProvince]);

    // گروه‌بندی categoryTree
    const categoryGroups = useMemo(() => {
        const groups: Record<string, { parent: string; items: any[] }> = {};
        categoryTree.forEach((cat: any) => {
            const parentName = cat.path?.split('.').slice(-2, -1)[0] || 'متفرقه';
            if (!groups[parentName]) groups[parentName] = { parent: parentName, items: [] };
            groups[parentName].items.push(cat);
        });
        return Object.values(groups);
    }, [categoryTree]);

    // آمار
    const totalSelectedCities = locationTree.reduce((sum: number, p: any) =>
        sum + (p.children?.filter((c: any) => c.isSelected).length || 0), 0
    );
    const provincesWithCities = locationTree.filter((p: any) =>
        p.children?.some((c: any) => c.isSelected)
    ).length;

    return (
        <div className="space-y-8 max-w-4xl">

            {/* ============================================================ */}
            {/* هشدار کلی */}
            {/* ============================================================ */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                    دامنه جغرافیایی، دسته‌بندی کالاها و صنوف فقط توسط <span className="font-bold">مدیر سیستم</span> قابل تغییر است.
                </p>
            </div>

            {/* ============================================================ */}
            {/* ۱. دامنه جغرافیایی - دو نوار افقی */}
            {/* ============================================================ */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                       دامنه فعالیت جغرافیایی بازار
                    </h3>
                    <span className="text-xs text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full">
                        {provincesWithCities} استان / {totalSelectedCities} شهر
                    </span>
                </div>

                {locationTree.length === 0 ? (
                    <div className="text-sm text-on-surface-variant bg-surface-container-low rounded-xl p-8 text-center border border-dashed border-outline-variant/50">
                        هیچ محدوده جغرافیایی تعریف نشده است.
                    </div>
                ) : (
                    <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
                        {/* ⬆ نوار استان‌ها */}
                        <div className="border-b border-outline-variant/20 bg-surface-container-lowest px-3 py-2">
                            <p className="text-[10px] text-on-surface-variant mb-2 font-medium">استان‌ها</p>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {locationTree.map((province: any) => {
                                    const hasCities = province.children?.some((c: any) => c.isSelected);
                                    const isActive = province.id === activeProvinceId;
                                    const cityCount = province.children?.filter((c: any) => c.isSelected).length || 0;

                                    return (
                                        <button
                                            key={province.id}
                                            onClick={() => setActiveProvinceId(province.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 border",
                                                isActive
                                                    ? "bg-primary text-on-primary border-primary shadow-sm"
                                                    : hasCities
                                                        ? "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                                                        : "bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline-variant/50"
                                            )}
                                        >
                                            <span className={cn("w-1.5 h-1.5 rounded-full", hasCities ? "bg-primary" : "bg-outline-variant")} />
                                            {province.title}
                                            {cityCount > 0 && (
                                                <span className={cn(
                                                    "text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full",
                                                    isActive ? "bg-on-primary/20 text-on-primary" : "bg-primary/10 text-primary"
                                                )}>
                                                    {cityCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ⬇ نوار شهرهای استان انتخاب‌شده */}
                        <div className="px-3 py-3">
                            <p className="text-[10px] text-on-surface-variant mb-2 font-medium">
                                {activeProvince ? `شهرهای ${activeProvince.title}` : 'شهرها'}
                            </p>

                            {activeCities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {activeCities.map((city: any) => (
                                        <span
                                            key={city.id}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary border border-primary/20 rounded-lg text-sm font-medium"
                                        >
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                            {city.customLabel || city.title}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-on-surface-variant/50 py-2">
                                    هیچ شهری از این استان انتخاب نشده است.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================================ */}
            {/* ۲. دسته‌بندی کالاها */}
            {/* ============================================================ */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                      دامنه گروههای کالای بازار
                    </h3>
                    <span className="text-xs text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full">
                        {categoryGroups.length} گروه / {categoryTree.length} دسته
                    </span>
                </div>

                {categoryGroups.length === 0 ? (
                    <div className="text-sm text-on-surface-variant bg-surface-container-low rounded-xl p-8 text-center border border-dashed border-outline-variant/50">
                        هیچ دسته‌بندی تعریف نشده است.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categoryGroups.map((group: any) => (
                            <div key={group.parent} className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
                                {/* هدر گروه */}
                                <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-container-lowest border-b border-outline-variant/10">
                                    <span className="text-sm">📦</span>
                                    <span className="font-semibold text-on-surface text-sm">{group.parent}</span>
                                    <span className="text-xs text-on-surface-variant mr-auto">{group.items.length} زیرمجموعه</span>
                                </div>
                                {/* زیرمجموعه‌ها */}
                                <div className="p-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {group.items.map((cat: any) => (
                                            <div key={cat.id}
                                                 className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-sm hover:bg-surface-container-low transition-colors">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                <span className="text-on-surface truncate text-sm">{cat.customLabel || cat.title}</span>
                                                {cat.unitShortCode && (
                                                    <span className="text-[10px] text-on-surface-variant/60 flex-shrink-0 whitespace-nowrap mr-auto">
                                                        {cat.unitShortCode}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ============================================================ */}
            {/* ۳. صنوف - دو باکس کنار هم */}
            {/* ============================================================ */}
            <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-primary" />
                    صنوف معامله گر در این بازار
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* تأمین‌کنندگان */}
                    <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <h4 className="font-semibold text-blue-800 text-sm">صنوف تامین کننده این بازار</h4>
                            <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full mr-auto">
                                {supplierIndustries.length} صنف
                            </span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {supplierIndustries.length > 0 ? (
                                <div className="p-3 space-y-1.5">
                                    {supplierIndustries.map((industry: any) => (
                                        <div key={industry.id}
                                             className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-lg text-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                            <span className="text-on-surface">{industry.title}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-sm text-on-surface-variant/50">
                                    تعیین نشده
                                </div>
                            )}
                        </div>
                    </div>

                    {/* خریداران */}
                    <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border-b border-green-100">
                            <Building2 className="w-4 h-4 text-green-600" />
                            <h4 className="font-semibold text-green-800 text-sm">صنوف خریدار در این بازار</h4>
                            <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full mr-auto">
                                {buyerIndustries.length} صنف
                            </span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {buyerIndustries.length > 0 ? (
                                <div className="p-3 space-y-1.5">
                                    {buyerIndustries.map((industry: any) => (
                                        <div key={industry.id}
                                             className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-lg text-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                            <span className="text-on-surface">{industry.title}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-sm text-on-surface-variant/50">
                                    تعیین نشده
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}