// app/business/register/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Factory, ShoppingCart, Send, Building2, User, ChevronDown, Check, FileText } from 'lucide-react';
import { FormHeader } from '@/app/components/FormHeader';
import { AppFooter } from '@/app/components/AppFooter';
import { useCreateBusiness, useActiveBusiness } from '@/lib/api/apiHooks';
import { ArmLocationSelector } from '@/app/components/ArmLocationSelector';
import { RootState } from '@/lib/store/store';
import { USER_POSITIONS } from '@/lib/api/data-types';
import { cn } from '@/lib/utils';

export default function RegisterBusinessPage() {
    const router = useRouter();
    const { currentArm, currentSlug } = useSelector((state: RootState) => state.arm);
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

    const armConfig = currentArm?.config as any || {};
    const supplierIndustries: { id: string; title: string }[] = armConfig.supplierIndustries || [];
    const buyerIndustries: { id: string; title: string }[] = armConfig.buyerIndustries || [];
    const allowManualRoleSelection = armConfig.accessRules?.allowManualRoleSelection ?? true;
    const restrictMembershipByIndustry = armConfig.accessRules?.restrictMembershipByIndustry ?? false;

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
        if (!formData.position) newErrors.position = 'سمت خود را وارد کنید';
        if (restrictMembershipByIndustry && !formData.industryId) newErrors.industry = 'انتخاب صنف الزامی است';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const typeMap: Record<string, string> = { seller: 'wholesaler', buyer: 'distributor' };

        const businessData = {
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
        };

        try {
            await createBusinessMutation.mutateAsync(businessData);
            toast.success('کسب‌وکار با موفقیت ثبت شد');
            router.push('/profile');
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error?.message || 'خطا در ثبت کسب‌وکار');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <FormHeader
                title="ثبت کسب و کار"
                subtitle="برای ثبت آگهی، اطلاعات کسب و کار خود را وارد کنید"
                backUrl="/profile"
            />

            <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-20 pb-60">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* نام کسب‌وکار */}
                    <div className="space-y-2">
                        <label className="font-label-md text-label-md text-on-surface-variant block">
                            نام کسب‌وکار <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, name: e.target.value }));
                                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                }}
                                placeholder="مثال: تولیدی بلوک آرمانی"
                                className={`w-full bg-surface-container-lowest border h-14 px-4 pr-12 font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all ${
                                    errors.name ? 'border-error' : 'border-outline'
                                }`}
                            />
                            <div className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant opacity-60">
                                <Building2 className="w-5 h-5" />
                            </div>
                        </div>
                        {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* توضیح کوتاه */}
                    <div className="space-y-2">
                        <label className="font-label-md text-label-md text-on-surface-variant block">
                            توضیح کوتاه کسب‌وکار
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.shortDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                                placeholder="مثال: تولید کننده انواع آجر فشاری"
                                className="w-full bg-surface-container-lowest border border-outline h-14 px-4 pr-12 font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            />
                            <div className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant opacity-60">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-xs text-on-surface-variant/60">حداکثر ۵۰ کاراکتر</p>
                    </div>

                    {/* نقش */}
                    <div className="space-y-3">
                        <label className="font-label-md text-label-md text-on-surface-variant block">
                            نقش اصلی شما در این بازار <span className="text-primary">*</span>
                        </label>
                        {errors.role && <p className="text-error text-sm">{errors.role}</p>}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { role: 'seller' as const, icon: Factory, title: 'فروشنده عمده', desc: 'تولیدی، بنکدار، عمده‌فروش' },
                                { role: 'buyer' as const, icon: ShoppingCart, title: 'خریدار عمده', desc: 'پیمانکار، خرده‌فروش، مجری' },
                            ].map(({ role, icon: Icon, title, desc }) => (
                                <button key={role} type="button"
                                        onClick={() => { setSelectedRole(role); setFormData(prev => ({ ...prev, industryId: '' })); setErrors(prev => ({ ...prev, role: '' })); }}
                                        className={cn(
                                            "relative flex flex-col items-center justify-center p-6 border-2 transition-all duration-200 aspect-square text-center space-y-3 rounded-xl",
                                            selectedRole === role ? "border-primary bg-primary text-white shadow-lg scale-[1.02]" : "border-outline-variant bg-surface-container-low hover:border-primary/50 hover:bg-primary/5"
                                        )}>
                                    {selectedRole === role && <div className="absolute top-2 right-2 bg-white text-primary rounded-full p-0.5 shadow-sm"><Check className="w-4 h-4" /></div>}
                                    <Icon className={cn("w-12 h-12", selectedRole === role ? "text-white" : "text-on-surface-variant")} />
                                    <span className={cn("font-bold text-base", selectedRole === role ? "text-white" : "text-on-surface")}>{title}</span>
                                    <span className={cn("text-xs leading-tight", selectedRole === role ? "text-white/80" : "text-on-surface-variant")}>{desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* انتخاب صنف - فقط وقتی restrictMembershipByIndustry فعال باشه */}
                    {shouldShowIndustrySelector && (
                        <div className="space-y-2">
                            <label className="font-label-md text-label-md text-on-surface-variant block">
                                صنف کسب‌وکار <span className="text-primary">*</span>
                            </label>
                            <div className="relative">
                                <select value={formData.industryId}
                                        onChange={(e) => { setFormData(prev => ({ ...prev, industryId: e.target.value })); setErrors(prev => ({ ...prev, industry: '' })); }}
                                        disabled={!selectedRole}
                                        className={`w-full bg-surface-container-lowest border h-14 px-4 pr-12 font-body-md text-right appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all ${!selectedRole ? 'opacity-50 cursor-not-allowed' : ''} ${errors.industry ? 'border-error' : 'border-outline'}`}>
                                    <option value="">{!selectedRole ? 'ابتدا نقش را انتخاب کنید' : availableIndustries.length === 0 ? 'هیچ صنفی تعریف نشده' : 'انتخاب صنف'}</option>
                                    {availableIndustries.map(ind => <option key={ind.id} value={ind.id}>{ind.title}</option>)}
                                </select>
                                <div className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant opacity-60 pointer-events-none"><User className="w-5 h-5" /></div>
                                <div className="absolute inset-y-0 left-12 flex items-center text-on-surface-variant opacity-60 pointer-events-none"><ChevronDown className="w-5 h-5" /></div>
                            </div>
                            {errors.industry && <p className="text-error text-sm mt-1">{errors.industry}</p>}
                        </div>
                    )}

                    {/* موقعیت */}
                    <ArmLocationSelector
                        provinceCode={formData.provinceCode}
                        cityCode={formData.cityCode}
                        onProvinceChange={(code, label) => { setFormData(prev => ({ ...prev, provinceCode: code, provinceLabel: label })); setErrors(prev => ({ ...prev, province: '' })); }}
                        onCityChange={(code, label) => { setFormData(prev => ({ ...prev, cityCode: code, cityLabel: label })); setErrors(prev => ({ ...prev, city: '' })); }}
                        error={errors.province || errors.city}
                    />

                    {/* ثبت */}
                    <div className="pt-4 pb-8">
                        <button type="submit" disabled={createBusinessMutation.isPending}
                                className="w-full bg-primary text-on-primary h-14 font-headline-sm text-headline-sm flex items-center justify-center gap-2 active:scale-95 transition-transform duration-150 rounded-lg">
                            {createBusinessMutation.isPending ? (
                                <div className="w-6 h-6 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                            ) : (
                                <>ثبت کسب‌وکار<Send className="w-5 h-5" /></>
                            )}
                        </button>
                    </div>
                </form>
            </main>

            <AppFooter activeTab="profile" />
        </div>
    );
}