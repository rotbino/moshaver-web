// app/admin/arm/components/LocationSelector.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UseFormSetValue, UseFormWatch, useFieldArray, Control } from 'react-hook-form';
import { Plus, MapPin, Globe, X, Save, AlertTriangle } from 'lucide-react';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LocationSelectorProps {
    control: Control<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    onSave?: () => void;
}

export function LocationSelector({ control, watch, setValue, onSave }: LocationSelectorProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'config.locationSelections',
    });

    const [tree, setTree] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ index: number; city: string } | null>(null);

    // ============================================================
    // واکشی درخت
    // ============================================================
    useEffect(() => {
        apiService.admin.locations.getTree()
            .then(data => {
                setTree(data || []);
                const iran = data?.find((c: any) => c.countryCode === 'IR');
                if (iran) setSelectedCountry(iran.id);
            })
            .catch(() => toast.error('خطا در دریافت موقعیت‌ها'))
            .finally(() => setLoading(false));
    }, []);

    // ============================================================
    // داده‌های استخراج‌شده
    // ============================================================
    const countries = useMemo(() => tree.filter(n => n.type === 'country'), [tree]);
    const activeCountry = useMemo(() => countries.find(c => c.id === selectedCountry), [countries, selectedCountry]);
    const provinces = useMemo(() => activeCountry?.children?.filter((c: any) => c.type === 'province') || [], [activeCountry]);
    const activeProvince = useMemo(() => provinces.find((p: any) => p.id === selectedProvince), [provinces, selectedProvince]);
    const cities = useMemo(() => activeProvince?.children?.filter((c: any) => c.type === 'city') || [], [activeProvince]);

    const currentSelections = watch('config.locationSelections') || [];

    // ============================================================
    // افزودن (با auto-save)
    // ============================================================
    const addCity = (city: any) => {
        if (currentSelections.some((s: any) => s.locationId === city.id)) {
            toast.info('این شهر قبلاً اضافه شده');
            return;
        }
        append({
            locationId: city.id,
            customLabel: '',
            displayPriority: currentSelections.length,
            isActive: true,
        });
        setTimeout(() => onSave?.(), 100);
        toast.success(`${city.title} اضافه شد`);

    };

    const addProvince = (province: any) => {
        const provinceCities = province.children?.filter((c: any) => c.type === 'city') || [];
        let added = 0;
        provinceCities.forEach((city: any) => {
            if (!currentSelections.some((s: any) => s.locationId === city.id)) {
                append({
                    locationId: city.id,
                    customLabel: '',
                    displayPriority: currentSelections.length + added,
                    isActive: true,
                });
                added++;
            }
        });
        if (added === 0) {
            toast.info('همه شهرهای این استان قبلاً اضافه شده‌اند');
        } else {
            toast.success(`${added} شهر از ${province.title} اضافه شد`);
            setTimeout(() => onSave?.(), 100);
        }
    };

    // ============================================================
    // حذف با تأیید
    // ============================================================
    const confirmRemove = (index: number, cityName: string) => {
        setDeleteConfirm({ index, city: cityName });
    };

    const handleRemove = () => {
        if (deleteConfirm) {
            remove(deleteConfirm.index);
            setDeleteConfirm(null);
            toast.success('موقعیت حذف شد');
            setTimeout(() => onSave?.(), 100);
        }
    };

    // ============================================================
    // تغییر customLabel (با debounce ساده)
    // ============================================================
    const handleCustomLabelChange = (index: number, value: string) => {
        setValue(`config.locationSelections.${index}.customLabel`, value);
        setTimeout(() => onSave?.(), 300);
    };

    // ============================================================
    // پیدا کردن نام
    // ============================================================
    const findLocationName = (locationId: string) => {
        for (const country of countries) {
            for (const province of (country.children || [])) {
                for (const city of (province.children || [])) {
                    if (city.id === locationId) {
                        return { city: city.title, province: province.title, country: country.title };
                    }
                }
            }
        }
        return { city: locationId, province: '', country: '' };
    };

    if (loading) {
        return <div className="text-center py-8 text-on-surface-variant">در حال بارگذاری موقعیت‌ها...</div>;
    }

    return (
        <div className="space-y-4">
            {/* ═══════════════ موقعیت‌های انتخاب‌شده (بالا) ═══════════════ */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    موقعیت‌های انتخاب‌شده
                    <span className="text-xs text-on-surface-variant font-normal">({fields.length})</span>
                </h3>

                {fields.length === 0 ? (
                    <div className="text-center py-6 text-sm text-on-surface-variant">
                        هیچ موقعیتی انتخاب نشده. از بخش زیر شهرها را اضافه کنید.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {fields.map((field, index) => {
                            const { city, province } = findLocationName(field.locationId);
                            return (
                                <div key={field.id}
                                     className="inline-flex items-center gap-2 px-3 py-2 bg-surface border border-outline-variant/30 rounded-lg text-sm group">
                                    <MapPin className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                                    <span className="font-medium">{city}</span>
                                    <span className="text-[10px] text-on-surface-variant/60">({province})</span>
                                    <input
                                        value={field.customLabel || ''}
                                        onChange={e => handleCustomLabelChange(index, e.target.value)}
                                        placeholder="برچسب..."
                                        className="w-20 bg-transparent border-b border-outline-variant/30 text-xs px-1 py-0.5 focus:border-primary outline-none"
                                    />
                                    <button
                                        onClick={() => confirmRemove(index, city)}
                                        className="p-0.5 hover:bg-error/10 hover:text-error rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        type="button"
                                        title="حذف">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ═══════════════ نوار کشورها ═══════════════ */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-3">
                <p className="text-[10px] text-on-surface-variant mb-2 font-medium flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> کشور
                </p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {countries.map(c => (
                        <button key={c.id} onClick={() => { setSelectedCountry(c.id); setSelectedProvince(''); }}
                                className={cn(
                                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border flex-shrink-0",
                                    selectedCountry === c.id
                                        ? "bg-primary text-on-primary border-primary"
                                        : "bg-surface text-on-surface-variant border-outline-variant/50 hover:border-primary/30"
                                )}>
                            {c.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════════════ استان‌ها و شهرها ═══════════════ */}
            {activeCountry && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* استان‌ها */}
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
                        <div className="px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" /> استان‌ها
                            </h4>
                            <span className="text-xs text-on-surface-variant">{provinces.length}</span>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto divide-y divide-outline-variant/10">
                            {provinces.map((province: any) => (
                                <div key={province.id}
                                     className={cn(
                                         "flex items-center justify-between px-4 py-2.5 hover:bg-surface-container-low transition-colors cursor-pointer",
                                         selectedProvince === province.id && "bg-primary/5"
                                     )}
                                     onClick={() => setSelectedProvince(selectedProvince === province.id ? '' : province.id)}>
                                    <span className="text-sm">{province.title}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-on-surface-variant/50">{province.children?.length || 0} شهر</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addProvince(province); }}
                                            className="p-1 hover:bg-primary/10 hover:text-primary rounded transition-colors"
                                            title="افزودن همه شهرهای این استان">
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* شهرها */}
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
                        <div className="px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" /> شهرها
                            </h4>
                            <span className="text-xs text-on-surface-variant">{cities.length}</span>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {!selectedProvince ? (
                                <div className="text-center py-12 text-sm text-on-surface-variant">
                                    استانی را انتخاب کنید
                                </div>
                            ) : cities.length === 0 ? (
                                <div className="text-center py-12 text-sm text-on-surface-variant">
                                    شهری یافت نشد
                                </div>
                            ) : (
                                <div className="divide-y divide-outline-variant/10">
                                    {cities.map((city: any) => {
                                        const isAdded = currentSelections.some((s: any) => s.locationId === city.id);
                                        return (
                                            <div key={city.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-surface-container-low transition-colors">
                                                <span className="text-sm">{city.title}</span>
                                                <button
                                                    onClick={() => !isAdded && addCity(city)}
                                                    disabled={isAdded}
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-colors text-xs",
                                                        isAdded
                                                            ? "bg-green-50 text-green-600 cursor-default"
                                                            : "hover:bg-primary/10 hover:text-primary"
                                                    )}>
                                                    {isAdded ? '✓ اضافه شده' : <Plus className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ مودال تأیید حذف ═══════════════ */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl border border-outline-variant">
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                هشدار
                            </h3>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 hover:bg-surface-container-high rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className="text-sm text-on-surface">
                                حذف <span className="font-semibold">«{deleteConfirm.city}»</span> ممکن است روی آگهی‌های ثبت‌شده در این شهر تأثیر بگذارد.
                            </p>
                            <p className="text-xs text-on-surface-variant">
                                آگهی‌های موجود حذف نمی‌شوند اما این شهر دیگر در تنظیمات بازار نخواهد بود.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 h-10 border border-outline rounded-xl text-sm">انصراف</button>
                                <button onClick={handleRemove}
                                        className="flex-1 h-10 bg-error text-on-error rounded-xl text-sm hover:bg-error/90">حذف</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}