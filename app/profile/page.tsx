// app/profile/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useActiveBusiness, useCreditBalance, useBusinesses, useBusiness } from '@/lib/api/apiHooks';
import { AppHeader, AppFooter } from '@/app/components';
import { setUser } from '@/lib/store/slices/authSlice';
import { EditProfileModal } from '@/app/profile/components/EditProfileModal';
import { RefreshModal } from '@/app/ad/RefreshModal';
import { EditModal } from '@/app/ad/EditModal';
import { Key, Factory } from 'lucide-react';
import { ChangePasswordModal } from '@/app/register/ChangePasswordModal';
import { toast } from 'sonner';
import { VerificationModal } from '../business/VerificationModal';
import { cn } from '@/lib/utils';
import { ManagedArmsList } from "./components/ManagedArmsList";
import { apiService } from '@/lib/api/apiService';

import ProfileHeader from './components/ProfileHeader';
import BusinessCard from './components/BusinessCard';
import AdsList from './components/AdsList';
import CreditsCard from './components/CreditsCard';
import TipsList from './components/TipsList';
import BusinessList from './components/BusinessList';

export default function ProfilePage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: activeBusiness, isLoading: activeLoading, refetch } = useActiveBusiness();
    const { data: creditBalance, refetch: refetchBalance } = useCreditBalance();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [selectedAd, setSelectedAd] = useState<any>(null);
    const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false);
    const [isEditAdModalOpen, setIsEditAdModalOpen] = useState(false);
    const [isArmOwner, setIsArmOwner] = useState(false);

    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

    // هوک‌ها
    const { data: businessesList } = useBusinesses();
    const { data: selectedBusiness, isLoading: businessLoading, refetch: refetchBusiness } = useBusiness(selectedBusinessId || '');

    const hasTemporaryPassword = user?.temporaryPassword === true;
    const hasBusiness = !!activeBusiness;
    const isSystemAdmin = user?.role === 'system_admin';

    // انتخاب اولین کسب‌وکار در صورت وجود
    useEffect(() => {
        if (activeBusiness && !selectedBusinessId) {
            setSelectedBusinessId(activeBusiness.id);
        }
    }, [activeBusiness, selectedBusinessId]);

    // محاسبات بر اساس selectedBusiness
    const completionPercentage = useMemo(() => {
        const b = selectedBusiness;
        if (!b) return 0;
        const name = b.name ? 15 : 0;
        const shortDesc = b.shortDescription ? 10 : 0;
        const type = b.type ? 15 : 0;
        const location = b.province && b.city ? 15 : 0;
        const activities = (b.activities?.length || 0) > 0 ? 15 : 0;
        const phone = b.phone ? 10 : 0;
        const desc = b.description ? 10 : 0;
        const position = b.position ? 10 : 0;
        return name + shortDesc + type + location + activities + phone + desc + position;
    }, [selectedBusiness]);

    const isComplete = completionPercentage === 100;
    const isPending = selectedBusiness?.verificationStatus === 'pending';
    const isRejected = selectedBusiness?.verificationStatus === 'rejected';
    const isApproved = selectedBusiness?.verificationStatus === 'approved';
    const currentTier = selectedBusiness?.verificationTier || 'none';
    const hasApprovedTier = isApproved && currentTier !== 'none';
    const isGold = currentTier === 'gold' && isApproved;
    const canRequestInitial = isComplete && !isPending && !hasApprovedTier && !isRejected;
    const canUpgrade = hasApprovedTier && !isGold && !isPending;

    const totalAds = selectedBusiness?.ads?.length || 0;
    const activeAds = selectedBusiness?.ads?.filter((ad: any) => ad.status === 'active').length || 0;
    const expiredAds = selectedBusiness?.ads?.filter((ad: any) =>
        ad.status === 'expired' || new Date(ad.expiresAt) < new Date()
    ).length || 0;

    // خواندن bumpCost از تنظیمات بازو
    const armConfig = useSelector((state: RootState) => state.arm.currentArm?.config) as any || {};
    const bumpCost = armConfig?.economy?.bumpCost || 10;
    const maxActiveAds = armConfig?.modules?.priceTable?.maxActiveAdsPerUser || 5;
    useEffect(() => {
        const checkArmOwner = async () => {
            if (!user) return;
            try {
                const arms = await apiService.arm.getUserArms();
                const isOwner = arms.some((a: any) => a.role === 'arm_owner');
                setIsArmOwner(isOwner);
            } catch (error) { console.error(error); }
        };
        checkArmOwner();
    }, [user]);

    const handleProfileUpdate = async (data: { fullName: string; avatarUrl?: string; password?: string }) => {
        try {
            const updatedUser = await apiService.auth.updateProfile({ fullName: data.fullName });
            dispatch(setUser({ ...user, fullName: updatedUser.fullName, avatarFileId: data.avatarUrl ? data.avatarUrl : user?.avatarFileId, temporaryPassword: data.password ? false : user?.temporaryPassword }));
            await refetch(); await refetchBalance();
            toast.success('پروفایل با موفقیت به‌روزرسانی شد');
        } catch (error: any) { toast.error(error?.message || 'خطا'); }
    };

    const handlePasswordChange = async () => {
        dispatch(setUser({ ...user, temporaryPassword: false }));
        await refetch();
    };

    // ✅ تابع فعال/غیرفعال کردن آگهی
    // app/profile/page.tsx - پیام مناسب در فرانت‌اند

    const handleToggleActive = async (ad: any) => {
        try {
            const newStatus = ad.status === 'active' ? 'inactive' : 'active';
            const result = await apiService.ad.update(ad.id, { status: newStatus });

            if (newStatus === 'active') {
                // بررسی اینکه آیا اعتبار کسر شده یا نه (با خواندن metadata)
                const creditDeducted = result?.metadata?.creditDeducted || false;
                if (creditDeducted) {
                    toast.success('آگهی فعال شد و اعتبار مربوطه از حساب شما کسر گردید');
                } else {
                    toast.success('آگهی فعال و به برگه آگهی‌های فعال منتقل شد');
                }
            } else {
                toast.success('آگهی غیر فعال و به برگه آگهی‌های غیر فعال منتقل شد');
            }

            refetchBusiness();
            refetch();
            refetchBalance();
        } catch (error: any) {
            if (error?.data?.errorCode === 'INSUFFICIENT_CREDIT') {
                const needed = error?.data?.data?.needed || 10;
                toast.error(`اعتبار کافی نیست. برای فعال‌سازی به ${needed} اعتبار نیاز دارید.`);
            } else {
                toast.error(error?.message || 'خطا در تغییر وضعیت آگهی');
            }
        }
    };

    // ✅ تابع حذف آگهی (اختیاری)
    const handleDeleteAd = async (ad: any) => {
        try {
            await apiService.ad.delete(ad.id);
            toast.success('آگهی با موفقیت حذف شد');
            refetchBusiness();
            refetch();
        } catch (error: any) {
            toast.error(error?.message || 'خطا در حذف آگهی');
        }
    };

    useEffect(() => { if (!activeLoading) { refetch(); refetchBalance(); } }, []);

    if ((activeLoading || businessLoading) && !selectedBusiness) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-surface-container-low/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900/30">
            <AppHeader showBack={false} />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
                {hasTemporaryPassword && (
                    <div className="bg-error/5 border-2 border-error shadow-lg rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-error flex items-center justify-center flex-shrink-0 shadow-md">
                                <Key className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-extrabold text-error">رمز عبور شما موقت است!</p>
                                <p className="text-xs text-on-surface dark:text-gray-300 mt-1">
                                    برای حفظ امنیت حساب خود، <span className="font-bold">همین حالا</span> رمز عبور جدیدی تعیین کنید.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="flex-1 sm:flex-none bg-error text-white px-6 py-2.5 text-sm font-bold rounded-lg hover:bg-error/90 transition-colors shadow-lg shadow-error/30 flex items-center justify-center gap-2 animate-pulse"
                            >
                                <Key className="w-4 h-4" />
                                تغییر رمز
                            </button>
                        </div>
                    </div>
                )}

                {/* دسکتاپ */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-1 space-y-6">
                        <ProfileHeader user={user} business={selectedBusiness} isArmOwner={isArmOwner} isSystemAdmin={isSystemAdmin} onEditClick={() => setIsEditModalOpen(true)} />
                        <CreditsCard balance={creditBalance?.balance} />
                        <TipsList />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
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
                                <BusinessList selectedId={selectedBusinessId} onSelect={(id) => setSelectedBusinessId(id)} />
                                {selectedBusiness && (
                                    <BusinessCard
                                        business={selectedBusiness}
                                        completionPercentage={completionPercentage}
                                        isComplete={isComplete}
                                        isPending={isPending}
                                        isRejected={isRejected}
                                        hasApprovedTier={hasApprovedTier}
                                        currentTier={currentTier}
                                        canRequestInitial={canRequestInitial}
                                        canUpgrade={canUpgrade}
                                        isGold={isGold}
                                        totalAds={totalAds}
                                        activeAds={activeAds}
                                        expiredAds={expiredAds}
                                        onVerificationClick={() => setIsVerificationModalOpen(true)}
                                    />
                                )}
                                <AdsList
                                    ads={selectedBusiness?.ads || []}
                                    businessId={selectedBusinessId || ''}
                                    totalAds={totalAds}
                                    activeAds={activeAds}
                                    expiredAds={expiredAds}

                                    onRefreshClick={(ad) => { setSelectedAd(ad); setIsRefreshModalOpen(true); }}
                                    onEditClick={(ad) => { setSelectedAd(ad); setIsEditAdModalOpen(true); }}
                                    onRepublishClick={(ad) => {
                                        // ✅ برای آگهی‌های منقضی نیز همان مودال تمدید باز می‌شود
                                        setSelectedAd(ad);
                                        setIsRefreshModalOpen(true);
                                    }}
                                    onToggleActive={handleToggleActive}  // ✅ پاس دادن تابع
                                    onDeleteClick={handleDeleteAd}       // ✅ پاس دادن تابع حذف
                                    maxActiveAds={maxActiveAds}                    // ✅ مقدار پیش‌فرض، از تنظیمات بازو قابل خواندن است
                                    creditBalance={creditBalance?.balance || 0}
                                    bumpCost={bumpCost}
                                />
                            </>
                        )}
                        <ManagedArmsList onRefresh={() => refetch()} />
                    </div>
                </div>

                {/* موبایل */}
                <div className="lg:hidden space-y-6">
                    <ProfileHeader user={user} business={selectedBusiness} isArmOwner={isArmOwner} isSystemAdmin={isSystemAdmin} onEditClick={() => setIsEditModalOpen(true)} />
                    <CreditsCard balance={creditBalance?.balance} />
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
                            <BusinessList selectedId={selectedBusinessId} onSelect={(id) => setSelectedBusinessId(id)} />
                            {selectedBusiness && (
                                <BusinessCard
                                    business={selectedBusiness}
                                    completionPercentage={completionPercentage}
                                    isComplete={isComplete}
                                    isPending={isPending}
                                    isRejected={isRejected}
                                    hasApprovedTier={hasApprovedTier}
                                    currentTier={currentTier}
                                    canRequestInitial={canRequestInitial}
                                    canUpgrade={canUpgrade}
                                    isGold={isGold}
                                    totalAds={totalAds}
                                    activeAds={activeAds}
                                    expiredAds={expiredAds}
                                    onVerificationClick={() => setIsVerificationModalOpen(true)}
                                />
                            )}
                            <AdsList
                                ads={selectedBusiness?.ads || []}
                                businessId={selectedBusinessId || ''}
                                totalAds={totalAds}
                                activeAds={activeAds}
                                expiredAds={expiredAds}
                                onRefreshClick={(ad) => { setSelectedAd(ad); setIsRefreshModalOpen(true); }}
                                onEditClick={(ad) => { setSelectedAd(ad); setIsEditAdModalOpen(true); }}
                                onRepublishClick={(ad) => {
                                    // ✅ برای آگهی‌های منقضی نیز همان مودال تمدید باز می‌شود
                                    setSelectedAd(ad);
                                    setIsRefreshModalOpen(true);
                                }}
                                onToggleActive={handleToggleActive}
                                onDeleteClick={handleDeleteAd}
                                maxActiveAds={maxActiveAds }
                                creditBalance={creditBalance?.balance || 0}
                                bumpCost={bumpCost}
                            />
                        </>
                    )}
                    <ManagedArmsList onRefresh={() => refetch()} />
                    <TipsList />
                </div>
            </main>

            {/* مودال‌ها */}
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onSuccess={handlePasswordChange} />
            {user && <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onUpdate={handleProfileUpdate} />}
            {hasBusiness && selectedBusiness && (
                <VerificationModal
                    isOpen={isVerificationModalOpen}
                    onClose={() => setIsVerificationModalOpen(false)}
                    businessId={selectedBusiness?.id}
                    businessName={selectedBusiness?.name}
                    currentLevel={selectedBusiness?.verificationTier as any || 'none'}
                    isProfileComplete={isComplete}
                    onSuccess={() => { toast.success('مدارک ارسال شد'); refetch(); refetchBalance(); }}
                />
            )}
            {selectedAd && (
                <>
                    <RefreshModal
                        isOpen={isRefreshModalOpen}
                        onClose={() => { setIsRefreshModalOpen(false);
                        setSelectedAd(null); }}
                        ad={selectedAd}
                        onSuccess={() => {
                            refetch();
                            refetchBusiness();
                            refetchBalance();
                        }}
                    />

                    <EditModal isOpen={isEditAdModalOpen} onClose={() => { setIsEditAdModalOpen(false); setSelectedAd(null); }} ad={selectedAd} onSuccess={() => { refetch(); refetchBalance(); }} />
                </>
            )}
            <AppFooter activeTab="profile" />
        </div>
    );
}