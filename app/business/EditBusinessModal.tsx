// app/business/EditBusinessModal.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Building2, MapPin, Phone, Globe, FileText, Image, Save, Plus, XCircle, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { ArmLocationSelector } from '@/app/components/ArmLocationSelector';
import { USER_POSITIONS } from '@/lib/api/data-types';
import { useUpdateBusiness, useUploadFile } from '@/lib/api/apiHooks';
import { FileUploader } from '@/components/common/FileUploader';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api/apiService';
import {ActivitySelectorModal} from "@/app/components/ActivitySelectorModal";
import {cn} from "@/lib/utils/utils";


interface EditBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: {
        id: string;
        name: string;
        type: string;
        city: string;
        province: string;
        phone: string;
        description?: string;
        address?: string;
        website?: string;
        provinceCode?: string;
        cityCode?: string;
        logoUrl?: string;
        position?: string;
        industryId?: string;
        activities?: Array<{ id: string; activityId: string; activity: { id: string; title: string } }>;
    };
    onUpdate: () => void;
}

export function EditBusinessModal({ isOpen, onClose, business, onUpdate }: EditBusinessModalProps) {
    const updateBusinessMutation = useUpdateBusiness();
    const uploadMutation = useUploadFile();

    // ============================================================
    // ✅ دریافت لیست فعالیت‌ها از API
    // ============================================================
    const { data: allActivities, isLoading: activitiesLoading } = useQuery({
        queryKey: ['admin', 'activities', 'leaves'],
        queryFn: () => apiService.admin.activities.getLeaves(),
        enabled: isOpen,
    });

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        province: '',
        city: '',
        provinceCode: '',
        provinceLabel: '',
        cityCode: '',
        cityLabel: '',
        phone: '',
        address: '',
        website: '',
        description: '',
        position: '',
        logoUrl: '',
        industryId: '',
        activityIds: [] as string[], // ✅ لیست شناسه فعالیت‌ها
    });

    const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
    const [currentLogoFileId, setCurrentLogoFileId] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);


    // در کامپوننت:
    const [showActivityModal, setShowActivityModal] = useState(false);

    // ============================================================
    // ✅ پر کردن دیتاها از business
    // ============================================================
    useEffect(() => {
        if (business) {
            const activityIds = business.activities?.map(a => a.activityId) || [];
            setFormData({
                name: business.name || '',
                type: business.type || '',
                province: business.province || '',
                city: business.city || '',
                provinceCode: business.provinceCode || '',
                provinceLabel: business.province || '',
                cityCode: business.cityCode || '',
                cityLabel: business.city || '',
                phone: business.phone || '',
                address: business.address || '',
                website: business.website || '',
                description: business.description || '',
                position: business.position || '',
                logoUrl: business.logoUrl || '',
                industryId: business.industryId || '',
                activityIds: activityIds,
            });
            setCurrentLogoFileId(business.logoUrl || '');
        }
    }, [business]);

    // ============================================================
    // ✅ لیست فعالیت‌های انتخاب شده
    // ============================================================
    const selectedActivities = useMemo(() => {
        if (!allActivities) return [];
        return allActivities.filter((a: any) => formData.activityIds.includes(a.id));
    }, [allActivities, formData.activityIds]);

    // ============================================================
    // ✅ فعالیت‌های قابل انتخاب (که قبلاً انتخاب نشده‌اند)
    // ============================================================
    const availableActivities = useMemo(() => {
        if (!allActivities) return [];
        return allActivities.filter((a: any) => !formData.activityIds.includes(a.id));
    }, [allActivities, formData.activityIds]);

    // ============================================================
    // ✅ محدودیت ۵ فعالیت
    // ============================================================
    const MAX_ACTIVITIES = 5;
    const canAddMore = formData.activityIds.length < MAX_ACTIVITIES;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) {
            newErrors.name = 'نام کسب‌وکار الزامی است';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ============================================================
    // ✅ افزودن فعالیت
    // ============================================================
    const handleAddActivity = (activityId: string) => {
        if (formData.activityIds.length >= MAX_ACTIVITIES) {
            toast.warning(`حداکثر ${MAX_ACTIVITIES} فعالیت قابل انتخاب است`);
            return;
        }
        if (!formData.activityIds.includes(activityId)) {
            setFormData({
                ...formData,
                activityIds: [...formData.activityIds, activityId],
            });
        }
    };

    // ============================================================
    // ✅ حذف فعالیت
    // ============================================================
    const handleRemoveActivity = (activityId: string) => {
        setFormData({
            ...formData,
            activityIds: formData.activityIds.filter(id => id !== activityId),
        });
    };

    // ============================================================
    // ✅ ثبت تغییرات
    // ============================================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        let newLogoFileId = currentLogoFileId;

        // ۱. اگر فایل جدید انتخاب شده، اول آپلود کن
        if (selectedLogoFile) {
            setIsUploading(true);
            setUploadError(null);

            try {
                const result = await uploadMutation.mutateAsync({
                    file: selectedLogoFile,
                    model: 'Business',
                    modelId: business.id,
                    fieldKey: 'logo',
                });

                newLogoFileId = result.id;
                setCurrentLogoFileId(result.id);
                setFormData(prev => ({ ...prev, logoUrl: result.id }));
                toast.success('لوگو با موفقیت آپلود شد');
            } catch (error: any) {
                console.error('❌ Upload error:', error);
                setUploadError(error.message || 'خطا در آپلود لوگو');
                toast.error(error.message || 'خطا در آپلود لوگو');
            } finally {
                setIsUploading(false);
            }
        }

        // ۲. به‌روزرسانی کسب‌وکار
        try {
            const updateData = {
                name: formData.name.trim(),
                type: formData.type,
                province: formData.provinceLabel || formData.province,
                city: formData.cityLabel || formData.city,
                provinceCode: formData.provinceCode,
                cityCode: formData.cityCode,
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                website: formData.website.trim(),
                description: formData.description.trim(),
                position: formData.position,
                logoUrl: newLogoFileId,
                industryId: formData.industryId || undefined,
                activityIds: formData.activityIds.length > 0 ? formData.activityIds : undefined,
            };

            await updateBusinessMutation.mutateAsync({
                id: business.id,
                data: updateData,
            });

            toast.success('کسب‌وکار با موفقیت ویرایش شد');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('❌ Update error:', error);
            toast.error(error?.message || 'خطا در ویرایش کسب‌وکار');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-0 md:p-4">
            <div className="bg-surface w-full h-full md:h-auto md:max-h-[95vh] md:max-w-2xl md:rounded-lg border-0 md:border border-outline-variant shadow-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b-2 border-primary/20 bg-white shadow-md flex-shrink-0">
                    <h3 className="text-base font-semibold text-primary">
                        ویرایش کسب‌وکار
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* ============================================================
                            بخش ۱: لوگو
                            ============================================================ */}
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-3">
                                <Image className="w-4 h-4" />
                                <span className="text-sm font-medium">لوگو</span>
                            </div>
                            <div className="flex justify-center">
                                <FileUploader
                                    model="Business"
                                    modelId={business.id}
                                    fieldKey="logo"
                                    value={currentLogoFileId}
                                    onFileSelect={(file) => setSelectedLogoFile(file)}
                                    onSuccess={(fileId) => {
                                        setCurrentLogoFileId(fileId);
                                        setFormData(prev => ({ ...prev, logoUrl: fileId }));
                                    }}
                                    onError={(error) => toast.error(error)}
                                    rounded={false}
                                    width={100}
                                    height={100}
                                    error={uploadError || undefined}
                                    disabled={isLoading}
                                />
                            </div>
                            {uploadError && (
                                <p className="text-xs text-error text-center mt-2">{uploadError}</p>
                            )}
                        </div>

                        {/* ============================================================
                            بخش ۲: اطلاعات اصلی
                            ============================================================ */}
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-3 border-b border-outline-variant pb-2">
                                <Building2 className="w-4 h-4" />
                                <span className="text-sm font-medium">اطلاعات اصلی</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-on-surface-variant">
                                        نام کسب‌وکار <span className="text-primary">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: undefined });
                                        }}
                                        placeholder="مثال: بازرگانی آهن مرکزی"
                                        className={`w-full bg-surface-container-lowest border h-10 px-3 text-sm text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all ${
                                            errors.name ? 'border-error' : 'border-outline'
                                        }`}
                                    />
                                    {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-on-surface-variant">
                                        نوع کسب‌وکار
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => {
                                            setFormData({ ...formData, type: e.target.value });
                                            if (errors.type) setErrors({ ...errors, type: undefined });
                                        }}
                                        className="w-full bg-surface-container-lowest border h-10 px-3 text-sm text-right appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                    >
                                        <option value="">انتخاب نوع...</option>
                                        <option value="producer">تولیدی</option>
                                        <option value="wholesaler">عمده‌فروش</option>
                                        <option value="importer">واردکننده</option>
                                        <option value="exporter">صادرکننده</option>
                                        <option value="distributor">توزیع‌کننده</option>
                                        <option value="retailer">خرده‌فروش</option>
                                        <option value="contractor">پیمانکار</option>
                                        <option value="service_provider">خدمات</option>
                                        <option value="other">سایر</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-on-surface-variant">
                                        سمت شما در کسب‌وکار
                                    </label>
                                    <select
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full bg-surface-container-lowest border border-outline h-10 px-3 text-sm text-right appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                    >
                                        <option value="">انتخاب سمت...</option>
                                        {USER_POSITIONS.map((pos) => (
                                            <option key={pos.value} value={pos.value}>
                                                {pos.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>


                        <div>
                            <div className="flex items-center gap-2 text-primary mb-3 border-b border-outline-variant pb-2">
                                <Briefcase className="w-4 h-4" />
                                <span className="text-sm font-medium">فعالیت‌های کسب‌وکار</span>
                                <span className="text-[10px] text-on-surface-variant mr-auto">
                                {formData.activityIds.length} / {MAX_ACTIVITIES}
                            </span>
                            </div>

                            {/* نمایش فعالیت‌های انتخاب شده */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedActivities.map((activity: any) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 text-xs rounded-full"
                                    >
                                        <span>{activity.title}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveActivity(activity.id)}
                                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {formData.activityIds.length === 0 && (
                                    <span className="text-xs text-on-surface-variant/50">
                هیچ فعالیتی انتخاب نشده است
            </span>
                                )}
                            </div>

                            {/* دکمه باز کردن مودال */}
                            <button
                                type="button"
                                onClick={() => setShowActivityModal(true)}
                                disabled={formData.activityIds.length >= MAX_ACTIVITIES}
                                className={cn(
                                    "w-full h-11 border border-dashed text-sm transition-colors",
                                    formData.activityIds.length >= MAX_ACTIVITIES
                                        ? "border-outline-variant text-on-surface-variant/50 cursor-not-allowed"
                                        : "border-primary text-primary hover:bg-primary/5"
                                )}
                            >
                                {formData.activityIds.length >= MAX_ACTIVITIES
                                    ? `حداکثر ${MAX_ACTIVITIES} فعالیت انتخاب شده`
                                    : '➕ افزودن فعالیت'}
                            </button>

                            {/* مودال انتخاب فعالیت */}
                            <ActivitySelectorModal
                                isOpen={showActivityModal}
                                onClose={() => setShowActivityModal(false)}
                                selectedIds={formData.activityIds}
                                onSelect={(ids) => {
                                    setFormData({ ...formData, activityIds: ids });
                                }}
                                max={MAX_ACTIVITIES}
                                title="انتخاب فعالیت‌های کسب‌وکار"
                            />
                        </div>

                        {/* ============================================================
                            بخش ۴: موقعیت مکانی
                            ============================================================ */}
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-3 border-b border-outline-variant pb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-medium">موقعیت مکانی</span>
                            </div>

                            <div className="space-y-3">
                                <ArmLocationSelector
                                    provinceCode={formData.provinceCode}
                                    cityCode={formData.cityCode}
                                    onProvinceChange={(code, label) => {
                                        setFormData({ ...formData, provinceCode: code, provinceLabel: label });
                                        if (errors.province) setErrors({ ...errors, province: undefined });
                                    }}
                                    onCityChange={(code, label) => {
                                        setFormData({ ...formData, cityCode: code, cityLabel: label });
                                        if (errors.city) setErrors({ ...errors, city: undefined });
                                    }}
                                    error={errors.province || errors.city}
                                />

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-on-surface-variant">
                                        آدرس کامل
                                    </label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="آدرس کامل کسب‌وکار را وارد کنید..."
                                        rows={2}
                                        className="w-full bg-surface-container-lowest border border-outline px-3 py-2 text-sm text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ============================================================
                            بخش ۵: اطلاعات تماس
                            ============================================================ */}
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-3 border-b border-outline-variant pb-2">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm font-medium">اطلاعات تماس</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-on-surface-variant">
                                        شماره تماس
                                    </label>
                                    <input
                                        type="text"
                                        dir="ltr"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            setFormData({ ...formData, phone: e.target.value });
                                            if (errors.phone) setErrors({ ...errors, phone: undefined });
                                        }}
                                        //placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
                                        className="w-full bg-surface-container-lowest border h-10 px-3 text-sm text-right font-mono focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-on-surface-variant">
                                        وب‌سایت
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            dir="ltr"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            placeholder="https://example.com"
                                            className="w-full bg-surface-container-lowest border border-outline h-10 px-3 pr-10 text-sm text-right font-mono focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                        />
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-60" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================
                            بخش ۶: توضیحات
                            ============================================================ */}
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-3 border-b border-outline-variant pb-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-medium">توضیحات</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-on-surface-variant">
                                    توضیحات درباره کسب‌وکار
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="توضیحات کامل درباره کسب‌وکار، محصولات و خدمات..."
                                    rows={3}
                                    className="w-full bg-surface-container-lowest border border-outline px-3 py-2 text-sm text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============================================================
                        دکمه‌ها
                        ============================================================ */}
                    <div className="flex gap-3 p-4 border-t border-outline-variant bg-surface flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-10 border border-outline text-sm text-on-surface hover:bg-surface-container-low transition-colors font-medium"
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 h-10 bg-primary text-sm text-on-primary hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                'در حال ذخیره...'
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    ذخیره تغییرات
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}