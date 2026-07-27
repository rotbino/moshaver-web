// app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useActiveBusiness, useCreditBalance } from '@/lib/api/apiHooks';
import { AppHeader, AppFooter } from '@/app/components';
import { setUser } from '@/lib/store/slices/authSlice';
import { EditProfileModal } from '@/app/profile/components/EditProfileModal';
import { RefreshModal } from '@/app/ad/RefreshModal';
import { EditModal } from '@/app/ad/EditModal';
import {
    User, Building2, Package, PlusCircle, Edit, CreditCard,
    Factory, AlertTriangle, Key, BadgeCheck, RefreshCw, Pencil,
    Phone, MapPin, Briefcase, Award, Shield, Sparkles,
    Tag, Clock, TrendingUp, Store, ChevronLeft, Layers,
} from 'lucide-react';
import { ChangePasswordModal } from '@/app/register/ChangePasswordModal';
import { getApiUrl } from '@/lib/api/apiRequest';
import { toast } from 'sonner';
import { VerificationModal } from '../business/VerificationModal';
import { cn } from '@/lib/utils';
import { ManagedArmsList } from "./components/ManagedArmsList";
import { apiService } from '@/lib/api/apiService';

export default function ProfilePage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: business, isLoading, refetch } = useActiveBusiness();
    const { data: creditBalance, refetch: refetchBalance } = useCreditBalance();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [selectedAd, setSelectedAd] = useState<any>(null);
    const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false);
    const [isEditAdModalOpen, setIsEditAdModalOpen] = useState(false);

    const hasTemporaryPassword = user?.temporaryPassword === true;
    const hasBusiness = !!business;
    const logoUrl = business?.logoUrl ? getApiUrl(`/file/${business.logoUrl}`) : null;
    const avatarUrl = user?.avatarFileId ? getApiUrl(`/file/${user.avatarFileId}`) : null;

    const handleProfileUpdate = async (data: { fullName: string; avatarUrl?: string; password?: string }) => {
        try {
            const updatedUser = await apiService.auth.updateProfile({ fullName: data.fullName });
            dispatch(setUser({ ...user, fullName: updatedUser.fullName, avatarFileId: data.avatarUrl ? data.avatarUrl : user?.avatarFileId, temporaryPassword: data.password ? false : user?.temporaryPassword }));
            await refetch(); await refetchBalance();
            toast.success('پروفایل با موفقیت به‌روزرسانی شد');
        } catch (error: any) { toast.error(error?.message || 'خطا در به‌روزرسانی پروفایل'); }
    };

    const handlePasswordChange = async () => {
        dispatch(setUser({ ...user, temporaryPassword: false }));
        await refetch();
    };

    useEffect(() => { if (!isLoading) { refetch(); refetchBalance(); } }, []);

    const totalAds = business?.ads?.length || 0;
    const activeAds = business?.ads?.filter((ad: any) => ad.status === 'active').length || 0;
    const expiredAds = totalAds - activeAds;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-surface-container-low/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900/30">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">

                {/* ═══════════════ هشدار رمز موقت ═══════════════ */}
                {hasTemporaryPassword && (
                    <div className="bg-gradient-to-r from-error/10 via-error/5 to-error/10 dark:from-error/20 dark:via-error/10 dark:to-error/20 border-2 border-error/50 dark:border-error/40 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-error/20 dark:bg-error/30 flex items-center justify-center flex-shrink-0"><Key className="w-5 h-5 text-error" /></div>
                            <div>
                                <p className="text-sm font-bold text-error">رمز عبور موقت شما ۱۲۳۴۵۶ است</p>
                                <p className="text-xs text-on-surface-variant dark:text-gray-400">برای امنیت بیشتر، لطفاً رمز عبور خود را تغییر دهید</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => setIsPasswordModalOpen(true)} className="flex-1 sm:flex-none bg-error text-white px-5 py-2 text-sm font-medium hover:bg-error/90 rounded-lg flex items-center justify-center gap-2"><Key className="w-4 h-4" />تغییر رمز</button>
                            <button onClick={() => setIsEditModalOpen(true)} className="flex-1 sm:flex-none bg-surface dark:bg-gray-800 border border-outline dark:border-gray-700 text-on-surface dark:text-gray-200 px-4 py-2 text-sm hover:bg-surface-container-low dark:hover:bg-gray-700 rounded-lg">ویرایش پروفایل</button>
                        </div>
                    </div>
                )}

                {/* ═══════════════ دسکتاپ: دو ستونه ═══════════════ */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-8">

                    {/* ستون چپ: پروفایل + اطلاعات */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* کارت پروفایل */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-outline-variant/50 dark:border-gray-700 p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border-4 border-primary/20 dark:border-primary/30 overflow-hidden">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={user?.fullName || 'کاربر'} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-primary" />
                                        )}
                                    </div>
                                    <button onClick={() => setIsEditModalOpen(true)} className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <h1 className="text-lg font-bold text-on-surface dark:text-gray-100">{user?.fullName && user.fullName !== '' && user.fullName !== 'کاربر مهمان' ? user.fullName : 'بی‌نام'}</h1>
                                <p className="text-sm text-on-surface-variant dark:text-gray-400 mt-1">{user?.phone || ''}</p>
                                {hasBusiness && (
                                    <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 text-xs rounded-full font-medium">
                                        <Store className="w-3 h-3" />
                                        {business.type === 'wholesaler' ? 'عمده‌فروش' : 'خریدار'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* کیف اعتبار */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-outline-variant/50 dark:border-gray-700 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    <h3 className="text-sm font-semibold text-on-surface dark:text-gray-100">کیف اعتبار</h3>
                                </div>
                                <button onClick={() => router.push('/credit/purchase')} className="text-primary hover:text-primary/80"><PlusCircle className="w-5 h-5" /></button>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-primary">{creditBalance?.balance?.toLocaleString() || 0}</span>
                                <span className="text-xs text-on-surface-variant dark:text-gray-400">اعتبار</span>
                            </div>
                        </div>

                        {/* نکات */}
                        <div className="space-y-3">
                            {[
                                { icon: Sparkles, text: 'قیمت‌های جدیدتر در شرایط مشابه، بالاتر قرار می‌گیرند.' },
                                { icon: AlertTriangle, text: 'درج قیمت‌های غیر واقعی موجب امتیاز منفی خواهد شد.' },
                                { icon: Package, text: 'برای هر کالا می‌توانید چند قیمت با حداقل خرید متفاوت ثبت کنید.' },
                                { icon: TrendingUp, text: '۵ آگهی رایگان روی تابلو. اعتبار فقط برای نردبان.' },
                            ].map((tip, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-outline-variant/30 dark:border-gray-700 p-3 flex items-start gap-2.5 shadow-sm">
                                    <tip.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-on-surface dark:text-gray-300 leading-relaxed">{tip.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ستون راست: کسب‌وکار + آگهی‌ها + بازارها */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* کسب‌وکار یا دعوت به ثبت */}
                        {!hasBusiness ? (
                            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10 border-2 border-primary/30 dark:border-primary/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center"><Factory className="w-6 h-6 text-primary" /></div>
                                        <div>
                                            <h3 className="text-base font-semibold text-on-surface dark:text-gray-100">شروع فعالیت صنعتی</h3>
                                            <p className="text-sm text-on-surface-variant dark:text-gray-400">کسب و کار خود را در یک دقیقه ثبت کنید.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => router.push('/business/register')} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium">ثبت کسب‌وکار</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* کارت کسب‌وکار */}
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-outline-variant/50 dark:border-gray-700 p-5 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-surface-container-high dark:bg-gray-800 border border-outline dark:border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {logoUrl ? <img src={logoUrl} alt={business.name} className="w-full h-full object-cover" /> : <Building2 className="w-8 h-8 text-primary" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-lg font-semibold text-on-surface dark:text-gray-100 truncate">{business.name}</h2>
                                                {business.verificationTier !== 'none' && (
                                                    <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1"><BadgeCheck className="w-3 h-3" />تأیید شده</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-on-surface-variant dark:text-gray-400">
                                                {business.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{business.city}</span>}
                                                {business.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{business.phone}</span>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => router.push(`/business/edit/${business.id}`)} className="px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 rounded-lg text-xs font-medium hover:bg-primary/20 dark:hover:bg-primary/30"><Edit className="w-4 h-4 inline ml-1" />ویرایش</button>
                                            <button onClick={() => setIsVerificationModalOpen(true)} className="px-4 py-2 border border-outline dark:border-gray-700 text-on-surface dark:text-gray-300 rounded-lg text-xs hover:bg-surface-container-low dark:hover:bg-gray-800"><Shield className="w-4 h-4 inline ml-1" />تیک اعتماد</button>
                                        </div>
                                    </div>
                                    {/* آمار */}
                                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-outline-variant/50 dark:border-gray-700">
                                        {[
                                            { value: totalAds, label: 'کل آگهی‌ها', color: 'text-primary' },
                                            { value: activeAds, label: 'فعال', color: 'text-green-600 dark:text-green-400' },
                                            { value: expiredAds, label: 'منقضی', color: 'text-warning' },
                                        ].map(s => (
                                            <div key={s.label} className="text-center">
                                                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                                                <p className="text-[10px] text-on-surface-variant dark:text-gray-400">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* آگهی‌ها */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-semibold text-on-surface dark:text-gray-100 flex items-center gap-2">آگهی‌های من <span className="text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 px-2 py-0.5 rounded-full">{totalAds}</span></h3>
                                        <button onClick={() => router.push('/ad/create')} className="text-sm text-primary hover:underline flex items-center gap-1"><PlusCircle className="w-4 h-4" />جدید</button>
                                    </div>

                                    {totalAds === 0 ? (
                                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-outline-variant/50 dark:border-gray-700 p-8 text-center">
                                            <Package className="w-12 h-12 text-on-surface-variant/30 dark:text-gray-600 mx-auto mb-3" />
                                            <p className="text-sm text-on-surface-variant dark:text-gray-400">هنوز آگهی ثبت نکرده‌اید</p>
                                            <button onClick={() => router.push('/ad/create')} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-lg text-sm">ثبت اولین آگهی</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                            {business.ads.map((ad: any) => (
                                                <div key={ad.id} className="bg-white dark:bg-gray-900 rounded-xl border border-outline-variant/50 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all">
                                                    <div className="flex items-start justify-between">
                                                        <div className="min-w-0">
                                                            <h4 className="font-semibold text-sm text-on-surface dark:text-gray-100 truncate">{ad.title}</h4>
                                                            <p className="text-[10px] text-on-surface-variant dark:text-gray-500">{ad.arm?.name || 'بدون بازار'}</p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-lg font-bold text-primary">{ad.unitPrice.toLocaleString()}</p>
                                                            <p className="text-[9px] text-on-surface-variant dark:text-gray-500">ت/{ad.unit?.shortCode || 'تن'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant/20 dark:border-gray-700 text-[10px]">
                                                        <span className={cn("px-2 py-0.5 rounded-full", ad.status === 'active' ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-warning/10 dark:bg-yellow-900/30 text-warning dark:text-yellow-400")}>
                                                            {ad.status === 'active' ? `${Math.ceil((new Date(ad.expiresAt).getTime() - Date.now()) / 86400000)} روز` : 'منقضی'}
                                                        </span>
                                                        {ad.isBumped && <span className="text-primary dark:text-primary-400 bg-primary/5 dark:bg-primary/20 px-2 py-0.5 rounded-full">نردبان</span>}
                                                    </div>
                                                    <div className="flex gap-2 mt-3 pt-3 border-t border-outline-variant/20 dark:border-gray-700">
                                                        {ad.status === 'active' ? (
                                                            <>
                                                                <button onClick={() => { setSelectedAd(ad); setIsRefreshModalOpen(true); }} className="flex-1 py-1.5 bg-primary text-white text-xs rounded-lg">تمدید</button>
                                                                <button onClick={() => { setSelectedAd(ad); setIsEditAdModalOpen(true); }} className="px-3 py-1.5 border border-outline dark:border-gray-600 text-on-surface dark:text-gray-300 rounded-lg text-xs hover:bg-surface-container-low dark:hover:bg-gray-800"><Pencil className="w-3.5 h-3.5" /></button>
                                                            </>
                                                        ) : (
                                                            <button className="flex-1 py-1.5 border border-primary text-primary rounded-lg text-xs">انتشار مجدد</button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* بازارهای تحت مدیریت */}
                        <ManagedArmsList onRefresh={() => refetch()} />
                    </div>
                </div>

                {/* ═══════════════ موبایل: مثل قبل ═══════════════ */}
                <div className="lg:hidden space-y-6">
                    {/* کارت پروفایل */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-outline-variant/50 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border-2 border-primary/20 dark:border-primary/30 overflow-hidden">
                                    {avatarUrl ? <img src={avatarUrl} alt={user?.fullName || 'کاربر'} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-primary" />}
                                </div>
                                <button onClick={() => setIsEditModalOpen(true)} className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-lg"><Pencil className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-on-surface dark:text-gray-100 truncate">{user?.fullName && user.fullName !== '' && user.fullName !== 'کاربر مهمان' ? user.fullName : 'بی‌نام'}</h1>
                                    {hasBusiness && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 text-xs rounded-full"><Store className="w-3 h-3" />{business.type === 'wholesaler' ? 'عمده‌فروش' : 'خریدار'}</span>}
                                </div>
                                <p className="text-sm text-on-surface-variant dark:text-gray-400 mt-1">{user?.phone || ''}</p>
                            </div>
                        </div>
                    </div>

                    {/* کیف اعتبار */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-outline-variant/50 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-primary" />
                                <div><h3 className="text-sm font-semibold text-on-surface dark:text-gray-100">کیف اعتبار</h3><p className="text-[10px] text-on-surface-variant dark:text-gray-400">برای نردبان آگهی‌ها</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-primary">{creditBalance?.balance?.toLocaleString() || 0}</span>
                                <span className="text-xs text-on-surface-variant dark:text-gray-400">اعتبار</span>
                                <button onClick={() => router.push('/credit/purchase')}><PlusCircle className="w-5 h-5 text-primary" /></button>
                            </div>
                        </div>
                    </div>

                    {!hasBusiness ? (
                        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10 border-2 border-primary/30 dark:border-primary/20 rounded-2xl p-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Factory className="w-6 h-6 text-primary" />
                                    <div><h3 className="text-base font-semibold text-on-surface dark:text-gray-100">شروع فعالیت صنعتی</h3><p className="text-sm text-on-surface-variant dark:text-gray-400">کسب و کار خود را ثبت کنید.</p></div>
                                </div>
                                <button onClick={() => router.push('/business/register')} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm">ثبت کسب‌وکار</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* کارت کسب‌وکار - موبایل */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-outline-variant/50 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-surface-container-high dark:bg-gray-800 border flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {logoUrl ? <img src={logoUrl} alt={business.name} className="w-full h-full object-cover" /> : <Building2 className="w-8 h-8 text-primary" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-semibold text-on-surface dark:text-gray-100 truncate">{business.name}</h2>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-on-surface-variant dark:text-gray-400">
                                            {business.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{business.city}</span>}
                                            <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{totalAds} آگهی</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                                    {[{ v: totalAds, l: 'کل', c: 'text-primary' }, { v: activeAds, l: 'فعال', c: 'text-green-600 dark:text-green-400' }, { v: expiredAds, l: 'منقضی', c: 'text-warning dark:text-yellow-400' }].map(s => (
                                        <div key={s.l} className="text-center"><p className={cn("text-xl font-bold", s.c)}>{s.v}</p><p className="text-[10px] text-on-surface-variant dark:text-gray-400">{s.l}</p></div>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-3 pt-3 border-t dark:border-gray-700">
                                    <button onClick={() => router.push(`/business/edit/${business.id}`)} className="flex-1 py-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 rounded-lg text-sm font-medium">ویرایش</button>
                                    <button onClick={() => setIsVerificationModalOpen(true)} className="flex-1 py-2 border dark:border-gray-600 text-on-surface dark:text-gray-300 rounded-lg text-sm hover:bg-surface-container-low dark:hover:bg-gray-800">تیک اعتماد</button>
                                </div>
                            </div>

                            {/* آگهی‌ها - موبایل */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-semibold text-on-surface dark:text-gray-100 flex items-center gap-2">آگهی‌های من <span className="text-xs bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 px-2 py-0.5 rounded-full">{totalAds}</span></h3>
                                    <button onClick={() => router.push('/ad/create')} className="text-sm text-primary flex items-center gap-1"><PlusCircle className="w-4 h-4" />جدید</button>
                                </div>
                                {totalAds === 0 ? (
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-700 p-8 text-center"><Package className="w-12 h-12 text-on-surface-variant/30 dark:text-gray-600 mx-auto mb-3" /><p className="text-sm text-on-surface-variant dark:text-gray-400">هنوز آگهی ثبت نکرده‌اید</p></div>
                                ) : (
                                    <div className="space-y-3">
                                        {business.ads.map((ad: any) => (
                                            <div key={ad.id} className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-700 p-4 shadow-sm">
                                                <div className="flex items-start justify-between">
                                                    <div className="min-w-0"><h4 className="font-semibold text-sm text-on-surface dark:text-gray-100 truncate">{ad.title}</h4><p className="text-[10px] text-on-surface-variant dark:text-gray-500">{ad.arm?.name}</p></div>
                                                    <div className="text-right"><p className="text-lg font-bold text-primary">{ad.unitPrice.toLocaleString()}</p><p className="text-[9px] text-on-surface-variant dark:text-gray-500">ت/{ad.unit?.shortCode || 'تن'}</p></div>
                                                </div>
                                                <div className="flex gap-2 mt-3 pt-3 border-t dark:border-gray-700">
                                                    {ad.status === 'active' ? (
                                                        <>
                                                            <button onClick={() => { setSelectedAd(ad); setIsRefreshModalOpen(true); }} className="flex-1 py-1.5 bg-primary text-white text-xs rounded-lg">تمدید</button>
                                                            <button onClick={() => { setSelectedAd(ad); setIsEditAdModalOpen(true); }} className="px-3 py-1.5 border dark:border-gray-600 text-on-surface dark:text-gray-300 rounded-lg text-xs hover:bg-surface-container-low dark:hover:bg-gray-800"><Pencil className="w-3.5 h-3.5" /></button>
                                                        </>
                                                    ) : (
                                                        <button className="flex-1 py-1.5 border border-primary text-primary rounded-lg text-xs">انتشار مجدد</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <ManagedArmsList onRefresh={() => refetch()} />

                    {/* نکات - موبایل */}
                    <div className="space-y-3">
                        {[
                            { icon: Sparkles, text: 'قیمت‌های جدیدتر در شرایط مشابه، بالاتر قرار می‌گیرند.' },
                            { icon: AlertTriangle, text: 'درج قیمت‌های غیر واقعی موجب امتیاز منفی خواهد شد.' },
                            { icon: Package, text: 'برای هر کالا می‌توانید چند قیمت با حداقل خرید متفاوت ثبت کنید.' },
                        ].map((tip, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 p-3 flex items-start gap-2.5 shadow-sm">
                                <tip.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-on-surface dark:text-gray-300 leading-relaxed">{tip.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* مودال‌ها */}
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onSuccess={handlePasswordChange} />
            {user && <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onUpdate={handleProfileUpdate} />}
            {hasBusiness && <VerificationModal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} businessId={business?.id} businessName={business?.name} onSuccess={() => { toast.success('مدارک ارسال شد'); refetch(); refetchBalance(); }} />}
            {selectedAd && (
                <>
                    <RefreshModal isOpen={isRefreshModalOpen} onClose={() => { setIsRefreshModalOpen(false); setSelectedAd(null); }} ad={selectedAd} onSuccess={() => { refetch(); refetchBalance(); }} />
                    <EditModal isOpen={isEditAdModalOpen} onClose={() => { setIsEditAdModalOpen(false); setSelectedAd(null); }} ad={selectedAd} onSuccess={() => { refetch(); refetchBalance(); }} />
                </>
            )}
        </div>
    );
}