// app/admin/arm/components/IndustrySelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Search, X, Loader2, Lock, Eye, AlertCircle, Save, Check } from 'lucide-react';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IndustrySelectorProps {
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    isAdmin?: boolean;
    onSave?: () => void;      // ← اضافه شد
    isSaving?: boolean;       // ← اضافه شد
}

interface Industry {
    id: string;
    title: string;
    path?: string;
    level?: number;
    code?: string;
    parentId?: string;
}

export function IndustrySelector({
                                     register,
                                     watch,
                                     setValue,
                                     isAdmin = false,
                                     onSave,                // ← دریافت onSave
                                     isSaving = false       // ← دریافت isSaving
                                 }: IndustrySelectorProps) {
    const [allIndustries, setAllIndustries] = useState<Industry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [searchSupplier, setSearchSupplier] = useState('');
    const [searchBuyer, setSearchBuyer] = useState('');

    const supplierIndustries = watch('config.supplierIndustries') || [];
    const buyerIndustries = watch('config.buyerIndustries') || [];

    const armAdminPermission = watch('config.armAdminPermission') || {};
    const industriesAccess = armAdminPermission.industries || {};
    const canEdit = isAdmin || industriesAccess.canEdit === true;

    useEffect(() => {
        if (!canEdit) {
            setIsLoading(false);
            setAllIndustries([]);
            return;
        }

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
    }, [canEdit]);

    const getFilteredIndustries = (searchTerm: string, selectedIds: string[]) => {
        if (!searchTerm.trim()) return [];
        return allIndustries.filter(
            (ind) =>
                ind.title.includes(searchTerm.trim()) &&
                !selectedIds.includes(ind.id)
        );
    };

    const addSupplier = (industry: Industry) => {
        if (!canEdit) return;
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

    const removeSupplier = (id: string) => {
        if (!canEdit) return;
        const current = supplierIndustries;
        setValue(
            'config.supplierIndustries',
            current.filter((i: any) => i.id !== id)
        );
    };

    const addBuyer = (industry: Industry) => {
        if (!canEdit) return;
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

    const removeBuyer = (id: string) => {
        if (!canEdit) return;
        const current = buyerIndustries;
        setValue(
            'config.buyerIndustries',
            current.filter((i: any) => i.id !== id)
        );
    };

    // ✅ تابع ذخیره واقعی
    const handleSave = () => {
        if (!canEdit) return;
        onSave?.(); // ← سرویس ذخیره تنظیمات را صدا می‌زند
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const filteredSupplier = getFilteredIndustries(
        searchSupplier,
        supplierIndustries.map((i: any) => i.id)
    );
    const filteredBuyer = getFilteredIndustries(
        searchBuyer,
        buyerIndustries.map((i: any) => i.id)
    );

    if (!canEdit) {
        return (
            <div className="space-y-6 bg-surface-container-low p-6 border border-outline-variant rounded-xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">اصناف تامین کننده و خریدار بازار</h3>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60">
                        <Lock className="w-3.5 h-3.5" />
                        فقط مشاهده
                    </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                        ویرایش صنوف فقط توسط مدیر سیستم قابل انجام است.
                        در صورت نیاز به تغییر، با پشتیبانی سرنخ تماس بگیرید.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-primary">تامین‌کنندگان بازار</h4>
                        <div className="flex flex-wrap gap-2">
                            {supplierIndustries.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                    <span>{item.title}</span>
                                    <Eye className="w-3 h-3 text-primary/50" />
                                </div>
                            ))}
                            {supplierIndustries.length === 0 && (
                                <span className="text-xs text-on-surface-variant">هیچ صنفی انتخاب نشده است</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold text-primary">خریداران بازار</h4>
                        <div className="flex flex-wrap gap-2">
                            {buyerIndustries.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                    <span>{item.title}</span>
                                    <Eye className="w-3 h-3 text-primary/50" />
                                </div>
                            ))}
                            {buyerIndustries.length === 0 && (
                                <span className="text-xs text-on-surface-variant">هیچ صنفی انتخاب نشده است</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full max-w-fit">
                    <input
                        type="checkbox"
                        id="allowManualRoleSelection"
                        checked={watch('config.allowManualRoleSelection') || false}
                        disabled={true}
                        className="max-w-5 h-2 opacity-50 cursor-not-allowed flex-shrink-0"
                    />
                    <label className="text-sm text-on-surface-variant/60 whitespace-nowrap">
                       عضویت فقط برای این اصناف امکانپذیر شود.
                    </label>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-surface-container-low p-6 border border-outline-variant rounded-xl">
            {/* هدر با دکمه ذخیره */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">اصناف تامین کننده و خریدار بازار</h3>
                    <p className="text-xs text-on-surface-variant">مدیریت صنف‌های مجاز برای عضویت در بازار</p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    {isSaving ? 'در حال ذخیره...' : saved ? 'ذخیره شد' : 'ذخیره'}
                </button>
            </div>

            {/* ✅ چک‌باکس با عرض محدود */}
            <div className="flex items-center gap-2 w-full max-w-fit">
                <input
                    type="checkbox"
                    id="allowManualRoleSelection"
                    checked={watch('config.allowManualRoleSelection') || false}
                    onChange={(e) => setValue('config.allowManualRoleSelection', e.target.checked)}
                    className="max-w-5 h-5 flex-shrink-0"
                />
                <label htmlFor="allowManualRoleSelection" className="text-sm whitespace-nowrap">
                   عضویت فقط برای این اصناف امکانپذیر شود.
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ============================================================
                    بخش تامین‌کنندگان (فروشندگان)
                    ============================================================ */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-primary">تامین‌کنندگان بازار</h4>

                    <div className="relative">
                        <input
                            type="text"
                            value={searchSupplier}
                            onChange={(e) => setSearchSupplier(e.target.value)}
                            placeholder="جستجوی صنف تامین‌کننده..."
                            disabled={isLoading}
                            className="w-full bg-surface-container-lowest border h-10 px-4 pr-10 font-body-md text-xs text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    </div>

                    {searchSupplier && filteredSupplier.length > 0 && (
                        <div className="border border-outline bg-surface max-h-60 overflow-y-auto divide-y divide-outline-variant/10">
                            {filteredSupplier.map((ind) => (
                                <button
                                    key={ind.id}
                                    type="button"
                                    onClick={() => addSupplier(ind)}
                                    className="w-full text-right px-3 py-1.5 text-xs hover:bg-surface-container-low transition-colors"
                                >
                                    {ind.title}
                                </button>
                            ))}
                        </div>
                    )}
                    {searchSupplier && filteredSupplier.length === 0 && (
                        <div className="text-xs text-on-surface-variant py-1">نتیجه‌ای یافت نشد</div>
                    )}

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
                            <span className="text-xs text-on-surface-variant">هیچ صنفی انتخاب نشده است</span>
                        )}
                    </div>
                </div>

                {/* ============================================================
                    بخش خریداران
                    ============================================================ */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-primary">خریداران بازار</h4>

                    <div className="relative">
                        <input
                            type="text"
                            value={searchBuyer}
                            onChange={(e) => setSearchBuyer(e.target.value)}
                            placeholder="جستجوی صنف خریدار..."
                            disabled={isLoading}
                            className="w-full bg-surface-container-lowest border h-10 px-4 pr-10 font-body-md text-xs text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    </div>

                    {searchBuyer && filteredBuyer.length > 0 && (
                        <div className="border border-outline bg-surface max-h-60 overflow-y-auto divide-y divide-outline-variant/10">
                            {filteredBuyer.map((ind) => (
                                <button
                                    key={ind.id}
                                    type="button"
                                    onClick={() => addBuyer(ind)}
                                    className="w-full text-right px-3 py-1.5 text-xs hover:bg-surface-container-low transition-colors"
                                >
                                    {ind.title}
                                </button>
                            ))}
                        </div>
                    )}
                    {searchBuyer && filteredBuyer.length === 0 && (
                        <div className="text-xs text-on-surface-variant py-1">نتیجه‌ای یافت نشد</div>
                    )}

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
                            <span className="text-xs text-on-surface-variant">هیچ صنفی انتخاب نشده است</span>
                        )}
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="mr-2 text-sm text-on-surface-variant">در حال بارگذاری صنف‌ها...</span>
                </div>
            )}
        </div>
    );
}