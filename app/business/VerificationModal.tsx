// components/business/VerificationModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Shield, CheckCircle, Phone, Info, Upload, Award, Medal, Star, ChevronRight, BadgeCheck } from 'lucide-react';
import { FileUploader } from '@/components/common/FileUploader';
import { toast } from 'sonner';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
    businessName: string;
    currentLevel?: 'none' | 'blue' | 'silver' | 'gold';
    onSuccess?: () => void;
}

export function VerificationModal({
                                      isOpen,
                                      onClose,
                                      businessId,
                                      businessName,
                                      currentLevel = 'none',
                                      onSuccess
                                  }: VerificationModalProps) {
    const [nationalId, setNationalId] = useState('');
    const [nationalCardFileId, setNationalCardFileId] = useState('');
    const [licenseFileId, setLicenseFileId] = useState('');
    const [awardFiles, setAwardFiles] = useState<{ id: string; name: string; fileId: string }[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeLevel, setActiveLevel] = useState<'blue' | 'silver' | 'gold'>('blue');

    if (!isOpen) return null;

    // وضعیت فعلی تیک
    const getLevelInfo = () => {
        switch(currentLevel) {
            case 'gold':
                return { label: 'طلایی', icon: <BadgeCheck className="w-5 h-5 text-green-500 fill-green-500" />, color: 'text-green-500' };
            case 'silver':
                return { label: 'نقره‌ای', icon: <BadgeCheck className="w-5 h-5 text-gray-400 fill-gray-400" />, color: 'text-gray-400' };
            case 'blue':
                return { label: 'آبی', icon: <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500" />, color: 'text-blue-500' };
            default:
                return { label: 'در انتظار', icon: <Shield className="w-5 h-5 text-gray-300" />, color: 'text-gray-300' };
        }
    };

    const levelInfo = getLevelInfo();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (activeLevel === 'blue' || activeLevel === 'silver' || activeLevel === 'gold') {
            if (!nationalId) {
                newErrors.nationalId = 'کد ملی الزامی است';
            } else if (!/^\d{10}$/.test(nationalId)) {
                newErrors.nationalId = 'کد ملی باید ۱۰ رقم باشد';
            }
            if (!nationalCardFileId) {
                newErrors.nationalCard = 'تصویر کارت ملی الزامی است';
            }
        }

        if (activeLevel === 'silver' || activeLevel === 'gold') {
            if (!licenseFileId) {
                newErrors.license = 'تصویر مجوز کسب‌وکار الزامی است';
            }
        }

        if (activeLevel === 'gold') {
            if (awardFiles.length === 0) {
                newErrors.awards = 'حداقل یک مدرک افتخار یا جوایز الزامی است';
            }
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setIsSubmitting(true);
        try {
            const data = {
                level: activeLevel,
                nationalId,
                nationalCardFileId,
                licenseFileId: licenseFileId || undefined,
                awardFiles: awardFiles.map(f => f.fileId),
            };

            console.log('📤 Verification data:', data);
            await new Promise(resolve => setTimeout(resolve, 1500));

            const levelNames = { blue: 'آبی', silver: 'نقره‌ای', gold: 'طلایی' };
            toast.success(`تیک ${levelNames[activeLevel]} با موفقیت دریافت شد`);
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error?.message || 'خطا در ارسال مدارک');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-0 md:p-4">
            <div className="bg-surface w-full h-full md:h-auto md:max-h-[95vh] md:max-w-lg md:rounded-lg border-0 md:border border-outline-variant shadow-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b-2 border-primary/20 bg-white shadow-md flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-semibold text-primary">
                            تیک اعتماد
                        </h3>
                        <span className={`text-xs ${levelInfo.color} flex items-center gap-1`}>
                            {levelInfo.icon}
                            {levelInfo.label}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* وضعیت فعلی */}
                    <div className="bg-primary-container/5 border border-primary/10 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-on-surface">{businessName}</p>
                                <p className="text-xs text-on-surface-variant">وضعیت تیک اعتماد</p>
                            </div>
                            <div className={`flex items-center gap-1 ${levelInfo.color}`}>
                                {levelInfo.icon}
                                <span className="text-sm font-bold">{levelInfo.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* انتخاب سطح - با رنگ‌های جدید */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveLevel('blue')}
                            className={`p-2 text-center border transition-colors ${
                                activeLevel === 'blue'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-outline hover:bg-surface-container-low'
                            }`}
                        >
                            <BadgeCheck className={`w-6 h-6 mx-auto ${activeLevel === 'blue' ? 'text-blue-500 fill-blue-500' : 'text-gray-300'}`} />
                            <span className={`text-[10px] ${activeLevel === 'blue' ? 'text-blue-500 font-medium' : 'text-on-surface-variant'}`}>
                                تیک آبی
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLevel('silver')}
                            className={`p-2 text-center border transition-colors ${
                                activeLevel === 'silver'
                                    ? 'border-gray-400 bg-gray-50'
                                    : 'border-outline hover:bg-surface-container-low'
                            }`}
                        >
                            <BadgeCheck className={`w-6 h-6 mx-auto ${activeLevel === 'silver' ? 'text-gray-400 fill-gray-400' : 'text-gray-300'}`} />
                            <span className={`text-[10px] ${activeLevel === 'silver' ? 'text-gray-600 font-medium' : 'text-on-surface-variant'}`}>
                                تیک نقره‌ای
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLevel('gold')}
                            className={`p-2 text-center border transition-colors ${
                                activeLevel === 'gold'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-outline hover:bg-surface-container-low'
                            }`}
                        >
                            <BadgeCheck className={`w-6 h-6 mx-auto ${activeLevel === 'gold' ? 'text-green-500 fill-green-500' : 'text-gray-300'}`} />
                            <span className={`text-[10px] ${activeLevel === 'gold' ? 'text-green-600 font-medium' : 'text-on-surface-variant'}`}>
                                تیک طلایی
                            </span>
                        </button>
                    </div>

                    {/* مدارک مورد نیاز بر اساس سطح */}
                    <div className="bg-surface-container-low p-3 text-xs text-on-surface-variant rounded-lg">
                        <span className="font-medium">مدارک مورد نیاز:</span>
                        {activeLevel === 'blue' && ' کد ملی + کارت ملی'}
                        {activeLevel === 'silver' && ' کد ملی + کارت ملی + مجوز کسب‌وکار'}
                        {activeLevel === 'gold' && ' کد ملی + کارت ملی + مجوز کسب‌وکار + جوایز و افتخارات'}
                    </div>

                    {/* کد ملی */}
                    {(activeLevel === 'blue' || activeLevel === 'silver' || activeLevel === 'gold') && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                                کد ملی
                                <span className="text-primary">*</span>
                            </label>
                            <input
                                type="text"
                                dir="ltr"
                                value={nationalId}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setNationalId(value);
                                    if (errors.nationalId) setErrors({ ...errors, nationalId: undefined });
                                }}
                                placeholder="۱۲۳۴۵۶۷۸۹۰"
                                className={`w-full bg-surface-container-lowest border h-10 px-3 text-sm text-right font-mono focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all ${
                                    errors.nationalId ? 'border-error' : 'border-outline'
                                }`}
                            />
                            {errors.nationalId && <p className="text-error text-xs mt-1">{errors.nationalId}</p>}
                        </div>
                    )}

                    {/* کارت ملی */}
                    {(activeLevel === 'blue' || activeLevel === 'silver' || activeLevel === 'gold') && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                                تصویر کارت ملی
                                <span className="text-primary">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <FileUploader
                                    model="Business"
                                    modelId={businessId}
                                    fieldKey="nationalCard"
                                    value={nationalCardFileId}
                                    onSuccess={(fileId) => {
                                        setNationalCardFileId(fileId);
                                        if (errors.nationalCard) setErrors({ ...errors, nationalCard: undefined });
                                    }}
                                    onError={(error) => toast.error(error)}
                                    rounded={false}
                                    width={80}
                                    height={80}
                                    error={errors.nationalCard}
                                    disabled={isSubmitting}
                                    label="آپلود"
                                />
                                <div className="flex-1">
                                    <p className="text-[10px] text-on-surface-variant">
                                        تصویر کارت ملی خود را آپلود کنید
                                    </p>
                                </div>
                            </div>
                            {errors.nationalCard && <p className="text-error text-xs mt-1">{errors.nationalCard}</p>}
                        </div>
                    )}

                    {/* مجوز کسب‌وکار */}
                    {(activeLevel === 'silver' || activeLevel === 'gold') && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                                تصویر مجوز کسب‌وکار
                                <span className="text-primary">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <FileUploader
                                    model="Business"
                                    modelId={businessId}
                                    fieldKey="license"
                                    value={licenseFileId}
                                    onSuccess={(fileId) => {
                                        setLicenseFileId(fileId);
                                        if (errors.license) setErrors({ ...errors, license: undefined });
                                    }}
                                    onError={(error) => toast.error(error)}
                                    rounded={false}
                                    width={80}
                                    height={80}
                                    error={errors.license}
                                    disabled={isSubmitting}
                                    label="آپلود"
                                />
                                <div className="flex-1">
                                    <p className="text-[10px] text-on-surface-variant">
                                        تصویر مجوز کسب‌وکار
                                    </p>
                                </div>
                            </div>
                            {errors.license && <p className="text-error text-xs mt-1">{errors.license}</p>}
                        </div>
                    )}

                    {/* جوایز و افتخارات */}
                    {activeLevel === 'gold' && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                                جوایز و افتخارات
                                <span className="text-primary">*</span>
                                <span className="text-[9px] text-green-600 mr-auto">حداقل ۱ مدرک</span>
                            </label>

                            {awardFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {awardFiles.map((award, index) => (
                                        <div key={index} className="flex items-center gap-1 bg-primary-container/10 px-2 py-1 text-xs rounded">
                                            <Award className="w-3 h-3 text-primary" />
                                            <span>{award.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAwardFiles(awardFiles.filter((_, i) => i !== index));
                                                }}
                                                className="text-error hover:text-error/80"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <FileUploader
                                    model="Business"
                                    modelId={businessId}
                                    fieldKey={`award-${awardFiles.length}`}
                                    value=""
                                    onSuccess={(fileId) => {
                                        setAwardFiles([...awardFiles, {
                                            id: fileId,
                                            name: `مدرک ${awardFiles.length + 1}`,
                                            fileId
                                        }]);
                                        if (errors.awards) setErrors({ ...errors, awards: undefined });
                                    }}
                                    onError={(error) => toast.error(error)}
                                    rounded={false}
                                    width={80}
                                    height={80}
                                    disabled={isSubmitting}
                                    label="آپلود مدرک"
                                />
                                <div className="flex-1">
                                    <p className="text-[9px] text-on-surface-variant">
                                        مدارک افتخارات، جوایز، گواهی‌نامه‌ها و دستاوردها
                                    </p>
                                </div>
                            </div>
                            {errors.awards && <p className="text-error text-xs mt-1">{errors.awards}</p>}
                        </div>
                    )}

                    {/* دکمه‌ها */}
                    <div className="flex gap-3 pt-2 border-t border-outline-variant">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 h-10 bg-primary text-sm text-on-primary hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'در حال ارسال...' : 'ارسال مدارک'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (window.innerWidth < 768) {
                                    window.location.href = 'tel:09196421264';
                                } else {
                                    toast.info('شماره پشتیبانی: ۰۹۱۹۶۴۲۱۲۶۴');
                                }
                            }}
                            className="h-10 px-4 border border-primary text-primary text-sm hover:bg-primary/5 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Phone className="w-4 h-4" />
                            تماس با پشتیبانی
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}