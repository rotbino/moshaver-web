// app/admin/arm/components/IndustrySelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Search, X, Loader2 } from 'lucide-react';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';

interface IndustrySelectorProps {
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
}

interface Industry {
    id: string;
    title: string;
    path?: string;
    level?: number;
    code?: string;
    parentId?: string;
}

export function IndustrySelector({ register, watch, setValue }: IndustrySelectorProps) {
    const [allIndustries, setAllIndustries] = useState<Industry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // جستجو برای تامین‌کنندگان و خریداران
    const [searchSupplier, setSearchSupplier] = useState('');
    const [searchBuyer, setSearchBuyer] = useState('');

    // خواندن مقادیر فعلی از فرم
    const supplierIndustries = watch('config.supplierIndustries') || [];
    const buyerIndustries = watch('config.buyerIndustries') || [];

    // واکشی لیست صنف‌های برگ (قابل انتخاب)
    useEffect(() => {
        const fetchIndustries = async () => {
            setIsLoading(true);
            try {
                const data = await apiService.admin.industries.getLeaves();
                setAllIndustries(data);
            } catch (error: any) {
                console.error('Error fetching industries:', error);
                toast.error(error?.message || 'خطا در دریافت صنف‌ها');
            } finally {
                setIsLoading(false);
            }
        };
        fetchIndustries();
    }, []);

    // فیلتر کردن صنف‌ها برای جستجو (حذف موارد انتخاب‌شده)
    const getFilteredIndustries = (searchTerm: string, selectedIds: string[]) => {
        if (!searchTerm.trim()) return [];
        return allIndustries.filter(
            (ind) =>
                ind.title.includes(searchTerm.trim()) &&
                !selectedIds.includes(ind.id)
        );
    };

    // اضافه کردن صنف به تامین‌کنندگان
    const addSupplier = (industry: Industry) => {
        const current = supplierIndustries;
        if (!current.some((i: any) => i.id === industry.id)) {
            setValue('config.supplierIndustries', [
                ...current,
                { id: industry.id, title: industry.title },
            ]);
            setSearchSupplier('');
        } else {
            toast.info('این صنف قبلاً اضافه شده است');
        }
    };

    // حذف صنف از تامین‌کنندگان
    const removeSupplier = (id: string) => {
        const current = supplierIndustries;
        setValue(
            'config.supplierIndustries',
            current.filter((i: any) => i.id !== id)
        );
    };

    // اضافه کردن صنف به خریداران
    const addBuyer = (industry: Industry) => {
        const current = buyerIndustries;
        if (!current.some((i: any) => i.id === industry.id)) {
            setValue('config.buyerIndustries', [
                ...current,
                { id: industry.id, title: industry.title },
            ]);
            setSearchBuyer('');
        } else {
            toast.info('این صنف قبلاً اضافه شده است');
        }
    };

    // حذف صنف از خریداران
    const removeBuyer = (id: string) => {
        const current = buyerIndustries;
        setValue(
            'config.buyerIndustries',
            current.filter((i: any) => i.id !== id)
        );
    };

    // لیست صنف‌های فیلتر شده برای جستجو
    const filteredSupplier = getFilteredIndustries(
        searchSupplier,
        supplierIndustries.map((i: any) => i.id)
    );
    const filteredBuyer = getFilteredIndustries(
        searchBuyer,
        buyerIndustries.map((i: any) => i.id)
    );

    return (
        <div className="space-y-6 bg-surface-container-low p-6 border border-outline-variant">
            <h3 className="text-lg font-semibold">اصناف تامین کننده و خریدار بازار</h3>

            {/* تنظیم allowManualRoleSelection */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    {...register('config.allowManualRoleSelection')}
                    id="allowManualRoleSelection"
                    className="w-4 h-4"
                />
                <label htmlFor="allowManualRoleSelection" className="text-sm">
                 به اصناف غیر مرتبط هم اجازه عضویت داده شود
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ============================================================
                    بخش تامین‌کنندگان (فروشندگان)
                    ============================================================ */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-primary">تامین‌کنندگان بازار</h4>

                    {/* جستجو */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchSupplier}
                            onChange={(e) => setSearchSupplier(e.target.value)}
                            placeholder="جستجوی صنف تامین‌کننده..."
                            className="w-full bg-surface-container-lowest border border-outline h-12 px-4 pr-10 font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            disabled={isLoading}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    </div>

                    {/* نتایج جستجو */}
                    {searchSupplier && filteredSupplier.length > 0 && (
                        <div className="border border-outline bg-surface max-h-100 overflow-y-auto">
                            {filteredSupplier.map((ind) => (
                                <button
                                    key={ind.id}
                                    type="button"
                                    onClick={() => addSupplier(ind)}
                                    className="w-full text-right px-4 py-2 hover:bg-surface-container-low transition-colors"
                                >
                                    {ind.title}
                                </button>
                            ))}
                        </div>
                    )}
                    {searchSupplier && filteredSupplier.length === 0 && (
                        <div className="text-sm text-on-surface-variant py-1">
                            نتیجه‌ای یافت نشد
                        </div>
                    )}

                    {/* لیست انتخاب‌شده‌ها */}
                    <div className="flex flex-wrap gap-2">
                        {supplierIndustries.map((item: any) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                            >
                                <span>{item.title}</span>
                                <button
                                    type="button"
                                    onClick={() => removeSupplier(item.id)}
                                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {supplierIndustries.length === 0 && (
                            <span className="text-xs text-on-surface-variant">
                                هیچ صنفی انتخاب نشده است
                            </span>
                        )}
                    </div>
                </div>

                {/* ============================================================
                    بخش خریداران
                    ============================================================ */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-primary">خریداران بازار</h4>

                    {/* جستجو */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchBuyer}
                            onChange={(e) => setSearchBuyer(e.target.value)}
                            placeholder="جستجوی صنف خریدار..."
                            className="w-full bg-surface-container-lowest border border-outline h-12 px-4 pr-10 font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            disabled={isLoading}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    </div>

                    {/* نتایج جستجو */}
                    {searchBuyer && filteredBuyer.length > 0 && (
                        <div className="border border-outline bg-surface max-h-80 overflow-y-auto">
                            {filteredBuyer.map((ind) => (
                                <button
                                    key={ind.id}
                                    type="button"
                                    onClick={() => addBuyer(ind)}
                                    className="w-full text-right px-4 py-2 hover:bg-surface-container-low transition-colors"
                                >
                                    {ind.title}
                                </button>
                            ))}
                        </div>
                    )}
                    {searchBuyer && filteredBuyer.length === 0 && (
                        <div className="text-sm text-on-surface-variant py-1">
                            نتیجه‌ای یافت نشد
                        </div>
                    )}

                    {/* لیست انتخاب‌شده‌ها */}
                    <div className="flex flex-wrap gap-2">
                        {buyerIndustries.map((item: any) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                            >
                                <span>{item.title}</span>
                                <button
                                    type="button"
                                    onClick={() => removeBuyer(item.id)}
                                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {buyerIndustries.length === 0 && (
                            <span className="text-xs text-on-surface-variant">
                                هیچ صنفی انتخاب نشده است
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* در صورت در حال بارگذاری */}
            {isLoading && (
                <div className="flex justify-center items-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="mr-2 text-sm text-on-surface-variant">
                        در حال بارگذاری صنف‌ها...
                    </span>
                </div>
            )}
        </div>
    );
}