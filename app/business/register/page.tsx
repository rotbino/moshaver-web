// app/business/register/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Factory, ShoppingCart, Send, Building2, FileText, ChevronDown, Check, Info, AlertCircle } from 'lucide-react';
import { FormHeader } from '@/app/components/FormHeader';
import { AppFooter } from '@/app/components/AppFooter';
import { useCreateBusiness, useActiveBusiness } from '@/lib/api/apiHooks';
import { ArmLocationSelector } from '@/app/components/ArmLocationSelector';
import { RootState } from '@/lib/store/store';
import { cn } from '@/lib/utils';

export default function RegisterBusinessPage() {
    const router = useRouter();
    const { currentArm, currentSlug } = useSelector((state: RootState) => state.arm);

    const armConfig = currentArm?.config as any || {};
    const supplierIndustries: { id: string; title: string }[] = armConfig.supplierIndustries || [];
    const buyerIndustries: { id: string; title: string }[] = armConfig.buyerIndustries || [];
    const restrictMembershipByIndustry = armConfig.accessRules?.restrictMembershipByIndustry ?? false;
    const requireBusinessVerification = armConfig.accessRules?.requireBusinessVerification ?? false;
    const labels = currentArm?.config?.formLabels || {};

    const [formData, setFormData] = useState({
        name: '',
        shortDescription: '',
        type: 'wholesaler',
        provinceCode: '',
        provinceLabel: '',
        cityCode: '',
        cityLabel: '',
        position: 'صاحب کسب‌وکار',
        industryId: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedRole, setSelectedRole] = useState<'seller' | 'buyer' | null>(null);

    const createBusinessMutation = useCreateBusiness();
    const { data: activeBusiness, isLoading: isLoadingBusiness } = useActiveBusiness();

    const availableIndustries = useMemo(() => {
        if (!selectedRole) return [];
        return selectedRole === 'seller' ? supplierIndustries : buyerIndustries;
    }, [selectedRole, supplierIndustries, buyerIndustries]);

    const shouldShowIndustrySelector = restrictMembershipByIndustry && selectedRole;

    useEffect(() => {
        if (activeBusiness && !isLoadingBusiness) {
            router.push('/profile');
        }
    }, [activeBusiness, isLoadingBusiness, router]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'نام کسب‌وکار الزامی است';
        if (!selectedRole) newErrors.role = 'لطفاً نقش خود را انتخاب کنید';
        if (!formData.provinceCode) newErrors.province = 'استان الزامی است';
        if (!formData.cityCode) newErrors.city = 'شهر الزامی است';
        if (restrictMembershipByIndustry && !formData.industryId) newErrors.industry = 'انتخاب صنف الزامی است';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const typeMap: Record<string, string> = { seller: 'wholesaler', buyer: 'distributor' };

        try {
            await createBusinessMutation.mutateAsync({
                name: formData.name,
                shortDescription: formData.shortDescription || undefined,
                type: selectedRole ? typeMap[selectedRole] : 'wholesaler',
                province: formData.provinceLabel,
                city: formData.cityLabel,
                provinceCode: formData.provinceCode,
                cityCode: formData.cityCode,
                phone: '',
                description: '',
                position: formData.position,
                industryId: formData.industryId || undefined,
                armSlug: currentSlug,
            });
            toast.success('کسب‌وکار با موفقیت ثبت شد');
            router.push('/profile');
        } catch (error: any) {
            toast.error(error?.message || 'خطا در ثبت کسب‌وکار');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface dark:bg-gray-950">
            <FormHeader title="ثبت کسب و کار" subtitle="اطلاعات خود را وارد کنید" backUrl="/profile" />

            <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-20 pb-28">
                {/* ⭐ کارت فقط برای دسکتاپ */}
                <div className="lg:bg-white lg:dark:bg-gray-900 lg:rounded-2xl lg:border lg:border-outline-variant/20 lg:dark:border-gray-800 lg:shadow-sm lg:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* نام کسب‌وکار */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-on-surface dark:text-gray-200 block">
                                نام کسب‌وکار <span className="text-primary">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, name: e.target.value }));
                                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                }}
                                placeholder={labels['business.name.placeholder'] || 'مثال: تولیدی بلوک آرمانی'}
                                className={`w-full bg-white dark:bg-gray-800 border h-11 px-4 text-sm text-right rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                                    errors.name ? 'border-error' : 'border-outline-variant/30 dark:border-gray-700'
                                }`}
                            />
                            {errors.name && <p className="text-error text-[11px] mt-1">{errors.name}</p>}
                        </div>

                        {/* توضیح کوتاه */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-on-surface dark:text-gray-200 block">
                                {labels['business.shortDescription.label'] || 'توضیح کوتاه'}
                            </label>
                            <input
                                type="text"
                                value={formData.shortDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                                placeholder={labels['business.shortDescription.placeholder'] || 'تولید کننده انواع آجر فشاری'}
                                className="w-full bg-white dark:bg-gray-800 border border-outline-variant/30 dark:border-gray-700 h-11 px-4 text-sm text-right rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>

                        {/* ⭐ نقش - دکمه‌های کوچک‌تر */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-on-surface dark:text-gray-200 block">
                                نقش اصلی شما <span className="text-primary">*</span>
                            </label>
                            {errors.role && <p className="text-error text-[11px]">{errors.role}</p>}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { role: 'seller' as const, icon: Factory, title: 'فروشنده عمده' },
                                    { role: 'buyer' as const, icon: ShoppingCart, title: 'خریدار عمده' },
                                ].map(({ role, icon: Icon, title }) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => { setSelectedRole(role); setFormData(prev => ({ ...prev, industryId: '' })); setErrors(prev => ({ ...prev, role: '' })); }}
                                        className={cn(
                                            "relative flex items-center gap-3 p-7 border-2 transition-all duration-200 rounded-xl",
                                            selectedRole === role
                                                ? "border-primary bg-primary/5 dark:bg-primary/10"
                                                : "border-outline-variant/30 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/30"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "w-8 h-8 flex-shrink-0",
                                            selectedRole === role ? "text-primary" : "text-on-surface-variant/40 dark:text-gray-500"
                                        )} />
                                        <div className="text-right">
                                            <span className={cn(
                                                "font-bold text-sm block",
                                                selectedRole === role ? "text-primary dark:text-primary-400" : "text-on-surface dark:text-gray-200"
                                            )}>{title}</span>
                                        </div>
                                        {selectedRole === role && (
                                            <Check className="absolute top-1.5 right-1.5 w-4 h-4 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ⭐ انتخاب صنف */}
                        {shouldShowIndustrySelector && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-on-surface dark:text-gray-200 block">
                                    صنف کسب‌وکار <span className="text-primary">*</span>
                                </label>

                                {availableIndustries.length === 0 ? (
                                    <div className="bg-error/5 dark:bg-red-900/20 text-error dark:text-red-400 p-3 rounded-xl text-xs flex items-start gap-2 border border-error/20 dark:border-red-800">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <p>هیچ صنفی برای این نقش تعریف نشده. با مدیر بازار تماس بگیرید.</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={formData.industryId}
                                            onChange={(e) => { setFormData(prev => ({ ...prev, industryId: e.target.value })); setErrors(prev => ({ ...prev, industry: '' })); }}
                                            className={`w-full bg-white dark:bg-gray-800 border h-11 px-4 text-sm text-right rounded-xl appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                                                errors.industry ? 'border-error' : 'border-outline-variant/30 dark:border-gray-700'
                                            }`}
                                        >
                                            <option value="">انتخاب صنف...</option>
                                            {availableIndustries.map(ind => <option key={ind.id} value={ind.id}>{ind.title}</option>)}
                                        </select>
                                        <div className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant/40 dark:text-gray-500 pointer-events-none">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                                {errors.industry && <p className="text-error text-[11px] mt-1">{errors.industry}</p>}
                            </div>
                        )}

                        {/* موقعیت مکانی */}
                        <ArmLocationSelector
                            provinceCode={formData.provinceCode}
                            cityCode={formData.cityCode}
                            onProvinceChange={(code, label) => { setFormData(prev => ({ ...prev, provinceCode: code, provinceLabel: label })); setErrors(prev => ({ ...prev, province: '' })); }}
                            onCityChange={(code, label) => { setFormData(prev => ({ ...prev, cityCode: code, cityLabel: label })); setErrors(prev => ({ ...prev, city: '' })); }}
                            error={errors.province || errors.city}
                        />

                        {/* ⭐ پیام تأیید مدارک */}
                        {requireBusinessVerification && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-2.5 rounded-xl text-[11px] flex items-start gap-2 border border-amber-200 dark:border-amber-800">
                                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                <p>مدارک شما پس از ثبت، بررسی و تأیید خواهد شد.</p>
                            </div>
                        )}

                        {/* دکمه ثبت */}
                        <button
                            type="submit"
                            disabled={createBusinessMutation.isPending}
                            className="w-full bg-primary text-on-primary h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 shadow-sm mt-2"
                        >
                            {createBusinessMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                            ) : (
                                <>ثبت کسب‌وکار<Send className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>
            </main>


        </div>
    );
}