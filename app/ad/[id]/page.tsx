// app/ad/[id]/page.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';
import {
    Loader2, Phone, MapPin, Package, Layers, Clock, TrendingUp,
    X, Award, Verified, Building2, FileText, BarChart3, Truck,
    User, ShoppingCart, Calendar, Globe, Mail, Shield, CheckCircle,
    AlertCircle, ChevronLeft, ChevronRight, Zap, Banknote,
    Tag, MapPinned, Briefcase, BadgeCheck, Star, Bookmark,
    Eye, MessageCircle, Share2, Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api/apiRequest';

// ─── کامپوننت‌های کوچک ───
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/5 dark:bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
            </div>
        </div>
    );
}

function formatNum(n: number | undefined) {
    return n?.toLocaleString('fa-IR') ?? '—';
}

function timeLeft(expiresAt: string) {
    const hours = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60));
    if (hours <= 0) return 'منقضی شده';
    if (hours < 24) return `${hours} ساعت`;
    const days = Math.floor(hours / 24);
    return `${days} روز مانده`;
}

function getTierLabel(tier: string | undefined) {
    if (tier === 'gold') return 'سطح ۳ (طلایی)';
    if (tier === 'silver') return 'سطح ۲ (نقره‌ای)';
    if (tier === 'blue') return 'سطح ۱ (برنزی)';
    return null;
}

function getTierStyle(tier: string | undefined) {
    if (tier === 'gold') return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    if (tier === 'silver') return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    if (tier === 'blue') return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    return '';
}

export default function AdDetailPage() {
    const router = useRouter();
    const params = useParams();
    const adId = params.id as string;

    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { currentArm, currentSlug } = useSelector((state: RootState) => state.arm);

    const [ad, setAd] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCalling, setIsCalling] = useState(false);
    const [activeTab, setActiveTab] = useState<'business' | 'similar' | 'achievements'>('business');
    const [similarAds, setSimilarAds] = useState<any[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [interactionStats, setInteractionStats] = useState<any>(null);

    // خواندن قوانین تماس از config بازو
    const armConfig = currentArm?.config as any || {};
    const priceTable = armConfig.modules?.priceTable || {};
    const requireLoginToCall = priceTable.requireLoginToCall ?? false;
    const requireMembershipToCall = priceTable.requireMembershipToCall ?? false;

    useEffect(() => {
        fetchAdDetail();
        checkMembership();
        checkIfSaved();
        trackView();
    }, [adId]);

    const fetchAdDetail = async () => {
        setLoading(true);
        try {
            const data = await apiService.ad.getDetail(adId);
            setAd(data);
            // دریافت آگهی‌های مشابه (همین کسب‌وکار)
            if (data.business?.id) {
                const similar = await apiService.ad.getBusinessAds(data.business.id);
                setSimilarAds(similar.filter((a: any) => a.id !== adId && a.status === 'active'));
            }
            // دریافت آمار تعاملات
            const stats = await apiService.ad.getStats(adId);
            setInteractionStats(stats);
        } catch (error: any) {
            toast.error(error?.message || 'خطا در دریافت اطلاعات آگهی');
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const checkMembership = async () => {
        if (!isAuthenticated || !currentSlug) return;
        try {
            const arms = await apiService.arm.getUserArms();
            setIsMember(arms.some((a: any) => a.slug === currentSlug));
        } catch (error) {
            setIsMember(false);
        }
    };

    const checkIfSaved = async () => {
        if (!isAuthenticated) return;
        try {
            const saved = await apiService.ad.getSavedAds();
            setIsSaved(saved.some((s: any) => s.id === adId));
        } catch (error) {
            // خطا را نادیده بگیر
        }
    };

    const trackView = async () => {
        try {
            await apiService.ad.interact(adId, 'view', { sessionId: 'session-' + Date.now() });
        } catch (error) {
            // خطا را نادیده بگیر
        }
    };

    const handleSave = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/ad/${adId}`);
            return;
        }
        try {
            if (isSaved) {
                await apiService.ad.unsave(adId);
                setIsSaved(false);
                toast.success('از لیست ذخیره‌ها حذف شد');
            } else {
                await apiService.ad.save(adId);
                setIsSaved(true);
                toast.success('آگهی ذخیره شد');
            }
        } catch (error: any) {
            toast.error(error?.message || 'خطا');
        }
    };

    const handleContact = async () => {
        // ۱. بررسی لاگین
        if (requireLoginToCall && !isAuthenticated) {
            router.push(`/login?redirect=/ad/${adId}`);
            return;
        }

        // ۲. بررسی عضویت
        if (requireMembershipToCall && !isMember) {
            toast.error('برای تماس با فروشنده، ابتدا عضو بازار شوید');
            return;
        }

        // ۳. بررسی اعتبار (هزینه تماس از تنظیمات)
        const interactionCosts = armConfig.economy?.interactionCosts || {};
        const callCost = interactionCosts.call || 0;

        if (callCost > 0 && isAuthenticated) {
            try {
                const balance = await apiService.credit.getBalance();
                if (balance.balance < callCost) {
                    toast.error(`اعتبار کافی نیست. برای تماس به ${callCost} اعتبار نیاز دارید.`);
                    return;
                }
            } catch (error) {
                toast.error('خطا در بررسی اعتبار');
                return;
            }
        }

        // ۴. دریافت شماره تماس
        if (isCalling) return;
        setIsCalling(true);
        try {
            const contactInfo = await apiService.ad.getContact(adId);
            await apiService.ad.interact(adId, 'call', {});
            if (window.innerWidth < 768) {
                window.location.href = `tel:${contactInfo.phone}`;
            } else {
                toast.info(`${contactInfo.businessName}\nشماره: ${contactInfo.phone}`, { duration: 8000 });
                navigator.clipboard.writeText(contactInfo.phone).catch(() => {});
            }
        } catch (error: any) {
            if (error?.data?.errorCode === 'DAILY_CALL_LIMIT_EXCEEDED') {
                toast.error(error?.data?.message || 'محدودیت تماس روزانه');
            } else if (error?.data?.errorCode === 'INSUFFICIENT_CREDIT') {
                toast.error(error?.data?.message || 'اعتبار کافی نیست');
            } else {
                toast.error(error?.message || 'خطا در دریافت شماره تماس');
            }
        } finally {
            setIsCalling(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: ad?.productType || ad?.title, url });
                await apiService.ad.interact(adId, 'share', {});
            } catch (error) {
                if ((error as any).name !== 'AbortError') {
                    console.error(error);
                }
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success('لینک آگهی کپی شد');
            await apiService.ad.interact(adId, 'share', {});
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!ad) return null;

    const unit = ad.unit?.shortCode || 'تن';
    const payment = ad.customFields?.paymentMethods;
    const chequeDetail = payment?.cheque?.enabled ? `تا ${payment.cheque.maxDays} روز` : null;
    const installmentDetail = payment?.installment?.enabled
        ? `${payment.installment.months} ماهه${payment.installment.prepaymentPercent > 0 ? ` · ${payment.installment.prepaymentPercent}٪ پیش‌پرداخت` : ''}`
        : null;
    const chequePrice = payment?.cheque?.price;
    const installmentPrice = payment?.installment?.price;

    const adImages = ad.files?.filter((f: any) => f.fieldKey?.startsWith('ad-image')) || [];
    const hasImages = adImages.length > 0;

    const seller = ad.business;
    const tierLabel = getTierLabel(seller?.verificationTier);
    const tierStyle = getTierStyle(seller?.verificationTier);

    const businessTypeLabel = seller?.type === 'wholesaler' ? 'عمده‌فروش' :
        seller?.type === 'producer' ? 'تولیدی' :
            seller?.type === 'importer' ? 'واردکننده' :
                seller?.type === 'exporter' ? 'صادرکننده' : seller?.type || '';

    const locationLabel = seller?.province && seller?.city ? `${seller.province}، ${seller.city}` : seller?.city || seller?.province || '';

    // اطلاعات مالک و مسوول فروش (کاربر اصلی)
    const owner = seller?.owner;
    const ownerAvatarUrl = owner?.avatarFile?.path
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${owner.avatarFile.id}/thumbnail`
        : owner?.avatarUrl || null;

    return (
        <div className="min-h-screen bg-surface dark:bg-gray-950">
            {/* هدر */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                                {ad.productType || ad.title}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                           {/* {ad.isBumped && (
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-gradient-to-l from-orange-500 to-rose-500 text-white px-2.5 py-1 rounded-full">
                                    <TrendingUp className="w-3 h-3" /> نردبان
                                </span>
                            )}*/}
                            {ad.business?.verificationTier && ad.business?.verificationTier !== 'none' && (
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500 text-white px-2.5 py-1 rounded-full">
        <Verified className="w-3 h-3" /> تایید هویت {getTierLabel(ad.business.verificationTier)}
    </span>
                            )}
                           {/* <button
                                onClick={handleSave}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="ذخیره آگهی"
                            >
                                <Bookmark className={cn("w-5 h-5", isSaved ? "fill-primary text-primary" : "text-gray-500 dark:text-gray-400")} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="اشتراک‌گذاری"
                            >
                                <Share2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>*/}
                        </div>
                    </div>
                </div>
            </header>

            {/* محتوای اصلی */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-32">
                {/* بخش بالایی: تصویر + اطلاعات سریع */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ستون تصاویر */}
                    <div className="lg:col-span-2">
                        {hasImages ? (
                            <div className="grid grid-cols-2 gap-2">
                                {adImages.slice(0, 4).map((file: any, idx: number) => (
                                    <div
                                        key={file.id}
                                        className={cn(
                                            "relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden",
                                            idx === 0 && "col-span-2 row-span-2"
                                        )}
                                    >
                                        <Image
                                            src={file.path?.startsWith('http') ? file.path : `${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${file.id}`}
                                            alt={ad.productType || ad.title}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        {idx === 3 && adImages.length > 4 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg">
                                                +{adImages.length - 4}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                <Package className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                            </div>
                        )}
                    </div>

                    {/* ستون اطلاعات اصلی */}
                    <div className="space-y-4">
                        {/* قیمت */}
                        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20 dark:border-primary/30">
                            <span className="text-xs text-gray-500 dark:text-gray-400">قیمت نقدی (هر {unit})</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-extrabold text-primary dark:text-primary-400">
                                    {formatNum(ad.unitPrice)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">تومان</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                اعتبار قیمت تا
                                <span>{timeLeft(ad.expiresAt)}</span>
                            </div>
                        </div>

                        {/* روش‌های پرداخت */}
                        {(chequeDetail || installmentDetail) && (
                            <div className="grid grid-cols-2 gap-2">
                                {chequeDetail && (
                                    <div className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-1.5 text-primary dark:text-primary-400">
                                            <Zap className="w-4 h-4" />
                                            <span className="text-xs font-bold">چکی</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{chequeDetail}</p>
                                        {chequePrice && <p className="text-xs text-gray-500 dark:text-gray-400">{formatNum(chequePrice)} تومان/{unit}</p>}
                                    </div>
                                )}
                                {installmentDetail && (
                                    <div className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                            <Layers className="w-4 h-4" />
                                            <span className="text-xs font-bold">اقساط</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{installmentDetail}</p>
                                        {installmentPrice && <p className="text-xs text-gray-500 dark:text-gray-400">{formatNum(installmentPrice)} تومان/{unit}</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* اطلاعات سریع */}
                        <div className="grid grid-cols-2 gap-2">
                            <InfoItem icon={<ShoppingCart className="w-4 h-4 text-primary" />} label="حداقل سفارش" value={`${formatNum(ad.minQuantity)} ${unit}`} />
                            <InfoItem icon={<Layers className="w-4 h-4 text-primary" />} label="موجودی" value={ad.availableQuantity ? `${formatNum(ad.availableQuantity)} ${unit}` : 'نامشخص'} />
                            <InfoItem icon={<MapPin className="w-4 h-4 text-primary" />} label="محل تحویل" value={ad.city || 'نامشخص'} />
                            <InfoItem icon={<Tag className="w-4 h-4 text-primary" />} label="نوع کالا" value={ad.productType || ad.title} />
                        </div>

                        {/* آمار تعاملات */}
                       {/* {interactionStats && (
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-3">
                                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {interactionStats.uniqueViews || 0}</span>
                                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {interactionStats.totalSaves || 0}</span>
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {interactionStats.totalCalls || 0}</span>
                            </div>
                        )}*/}

                        {/* ═══ کارت مالک و مسوول فروش (بالای دکمه تماس) ═══ */}
                        {owner && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 overflow-hidden flex-shrink-0">
                                            {ownerAvatarUrl ? (
                                                <Image
                                                    src={ownerAvatarUrl}
                                                    alt={owner.fullName || 'کاربر'}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover w-full h-full"
                                                    unoptimized
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-400 m-auto mt-3" />
                                            )}
                                        </div>
                                        <div className={cn(
                                            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900",
                                            seller?.isOnline ? "bg-green-500" : "bg-gray-400"
                                        )} />
                                    </div>

                                    <div className="flex-1 min-w-0">

                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {owner.fullName || 'کاربر'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {seller?.position || 'مالک و مسوول فروش'}
                                        </p>
                                        {/*<div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                                            <span className="flex items-center gap-0.5">
                                                <Clock className="w-3 h-3" />
                                                {seller?.lastSeen ? new Date(seller.lastSeen).toLocaleDateString('fa-IR') : 'نامشخص'}
                                            </span>
                                            <span className={cn(
                                                "flex items-center gap-0.5",
                                                seller?.isOnline ? "text-green-600" : "text-gray-400"
                                            )}>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full inline-block",
                                                    seller?.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                                                )} />
                                                {seller?.isOnline ? 'آنلاین' : 'آفلاین'}
                                            </span>
                                        </div>*/}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* دکمه تماس */}
                        <button
                            onClick={handleContact}
                            disabled={isCalling}
                            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 transition-all"
                        >
                            {isCalling ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <Phone className="w-5 h-5" />
                                    تماس با فروشنده
                                </>
                            )}
                        </button>
                        {requireLoginToCall && !isAuthenticated && (
                            <p className="text-xs text-center text-amber-600 dark:text-amber-400">برای تماس با فروشنده ابتدا وارد شوید</p>
                        )}
                        {requireMembershipToCall && !isMember && isAuthenticated && (
                            <p className="text-xs text-center text-amber-600 dark:text-amber-400">برای تماس با فروشنده، عضو بازار شوید</p>
                        )}
                    </div>
                </div>

                {/* ═══════ تب‌ها ═══════ */}
                <div className="mt-8 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex flex-wrap gap-6">
                        <button
                            onClick={() => setActiveTab('business')}
                            className={cn(
                                "pb-3 text-sm font-medium transition-colors relative",
                                activeTab === 'business'
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                        >
                           اطلاعات فروشنده
                        </button>
                        {seller?.licenseFiles?.length?(
                            <button
                                onClick={() => setActiveTab('achievements')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'achievements'
                                        ? "text-primary border-b-2 border-primary"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                )}
                            >
                                مجوزهاو جوایز
                                {((seller?.licenseFiles?.length || 0) + (seller?.awardFiles?.length || 0) + (seller?.certificateFiles?.length || 0)) > 0 && (
                                    <span className="mr-1.5 px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">
                                    {(seller?.licenseFiles?.length || 0) + (seller?.awardFiles?.length || 0) + (seller?.certificateFiles?.length || 0)}
                                </span>
                                )}
                            </button>
                        ):null}
                        {similarAds.length>1 ?(
                            <button
                                onClick={() => setActiveTab('similar')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'similar'
                                        ? "text-primary border-b-2 border-primary"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                )}
                            >
                                آگهی‌های دیگر
                                {similarAds.length > 0 && (
                                    <span className="mr-1.5 px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">
                                    ({similarAds.length})
                                </span>
                                )}
                            </button>
                        ):null }

                    </div>
                </div>

                {/* محتوای تب‌ها */}
                <div className="mt-6">
                    {/* تب کسب‌وکار (فروشنده) */}
                    {activeTab === 'business' && seller && (
                        <div className="space-y-6">
                            {/* هدر فروشنده - با لوگو، نام، نقش، وضعیت آنلاین و آخرین حضور */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 overflow-hidden flex-shrink-0">
                                            {seller.logoUrl ? (
                                                <Image
                                                    src={seller.logoUrl}
                                                    alt={seller.name}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover w-full h-full"
                                                    unoptimized
                                                />
                                            ) : (
                                                <Building2 className="w-8 h-8 text-gray-400 m-auto mt-4" />
                                            )}
                                        </div>
                                        <div className={cn(
                                            "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900",
                                            seller.isOnline ? "bg-green-500" : "bg-gray-400"
                                        )} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{seller.name}</h2>
                                            {tierLabel && (
                                                <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border", tierStyle)}>
                                                    <BadgeCheck className="w-3.5 h-3.5" /> {tierLabel}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            {businessTypeLabel && (
                                                <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                                    {businessTypeLabel}
                                                </span>
                                            )}
                                            {seller.position && (
                                                <span className="flex items-center gap-1 text-xs">
                                                    <User className="w-3 h-3" /> {seller.position}
                                                </span>
                                            )}
                                            {seller.owner?.fullName && (
                                                <span className="flex items-center gap-1 text-xs">
                                                    <User className="w-3 h-3" /> {seller.owner.fullName}
                                                </span>
                                            )}
                                        </div>
                                        {/*<div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                آخرین حضور: {seller.lastSeen ? new Date(seller.lastSeen).toLocaleDateString('fa-IR', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'نامشخص'}
                                            </span>
                                            <span className={cn(
                                                "flex items-center gap-1",
                                                seller.isOnline ? "text-green-600" : "text-gray-400"
                                            )}>
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full inline-block",
                                                    seller.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                                                )} />
                                                {seller.isOnline ? 'آنلاین' : 'آفلاین'}
                                            </span>
                                        </div>*/}
                                        {seller.shortDescription && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{seller.shortDescription}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleContact}
                                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
                                        >
                                            <Phone className="w-4 h-4" /> تماس
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* اطلاعات کسب‌وکار */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-primary" /> اطلاعات اصلی
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                            <span className="text-gray-500 dark:text-gray-400">نام</span>
                                            <span className="text-gray-900 dark:text-white font-medium">{seller.name}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                            <span className="text-gray-500 dark:text-gray-400">نوع</span>
                                            <span className="text-gray-900 dark:text-white">{businessTypeLabel || '—'}</span>
                                        </div>
                                        {seller.industry && (
                                            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                                <span className="text-gray-500 dark:text-gray-400">صنف</span>
                                                <span className="text-gray-900 dark:text-white">{seller.industry.title}</span>
                                            </div>
                                        )}
                                        {locationLabel && (
                                            <div className="flex justify-between py-1.5">
                                                <span className="text-gray-500 dark:text-gray-400">موقعیت</span>
                                                <span className="text-gray-900 dark:text-white">{locationLabel}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary" /> اطلاعات تماس
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                            <span className="text-gray-500 dark:text-gray-400">شماره تماس</span>
                                            <span className="text-gray-900 dark:text-white font-mono">{seller.phone || '—'}</span>
                                        </div>
                                        {seller.website && (
                                            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                                <span className="text-gray-500 dark:text-gray-400">وب‌سایت</span>
                                                <a href={seller.website} target="_blank" rel="noopener" className="text-primary hover:underline">{seller.website}</a>
                                            </div>
                                        )}
                                        {seller.address && (
                                            <div className="flex justify-between py-1.5">
                                                <span className="text-gray-500 dark:text-gray-400">آدرس</span>
                                                <span className="text-gray-900 dark:text-white">{seller.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* فعالیت‌ها و صنوف */}
                            {seller.activities && seller.activities.length > 0 && (
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-primary" /> فعالیت‌ها
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {seller.activities.map((act: any) => (
                                            <span key={act.id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary-400 text-xs rounded-full border border-primary/10 dark:border-primary/20">
                                                <Tag className="w-3 h-3" /> {act.title}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* توضیحات */}
                            {seller.description && (
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" /> درباره ما
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-justify">{seller.description}</p>
                                </div>
                            )}

                            {/* آمار اعتماد */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center shadow-sm">
                                    <p className="text-2xl font-bold text-primary">{seller.totalAds || 0}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">آگهی فعال</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center shadow-sm">
                                    <p className="text-2xl font-bold text-primary">{seller.totalDeals || 0}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">معاملات موفق</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center shadow-sm">
                                    <p className="text-2xl font-bold text-primary">{seller.totalViews || 0}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">تعداد بازدید</p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center shadow-sm">
                                    <p className="text-2xl font-bold text-primary">{seller.trustScore || 0}%</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">امتیاز اعتماد</p>
                                </div>
                            </div>

                            {/* مدارک تایید */}
                            {seller.verifications && seller.verifications.length > 0 && (
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-primary" /> مدارک تأیید شده
                                    </h3>
                                    <div className="space-y-2">
                                        {seller.verifications.map((v: any) => (
                                            <div key={v.id} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 py-2 last:border-0">
                                                <span className="text-gray-600 dark:text-gray-400">سطح {v.tier}</span>
                                                <span className={cn(
                                                    "text-xs font-medium px-2 py-0.5 rounded-full",
                                                    v.status === 'approved' ? "bg-green-100 text-green-700" :
                                                        v.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                                                            "bg-red-100 text-red-700"
                                                )}>
                                                    {v.status === 'approved' ? 'تایید شده' : v.status === 'pending' ? 'در انتظار' : 'رد شده'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* تب جوایز و افتخارات */}
                    {activeTab === 'achievements' && (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Award className="w-4 h-4 text-primary" /> جوایز، گواهینامه‌ها و افتخارات
                            </h3>
                            {(seller?.licenseFiles?.length > 0 || seller?.awardFiles?.length > 0 || seller?.certificateFiles?.length > 0) ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {seller?.licenseFiles?.map((file: any) => (
                                        <div key={file.id} className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <Image
                                                src={file.fullUrl || `${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${file.id}`}
                                                alt="مجوز"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">مجوز</div>
                                        </div>
                                    ))}
                                    {seller?.awardFiles?.map((file: any) => (
                                        <div key={file.id} className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <Image
                                                src={file.fullUrl || `${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${file.id}`}
                                                alt="جایزه"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">جایزه</div>
                                        </div>
                                    ))}
                                    {seller?.certificateFiles?.map((file: any) => (
                                        <div key={file.id} className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <Image
                                                src={file.fullUrl || `${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${file.id}`}
                                                alt="گواهینامه"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">گواهینامه</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                    <p>هیچ جایزه، گواهینامه یا افتخاری ثبت نشده است.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* تب آگهی‌های مشابه */}
                    {activeTab === 'similar' && (
                        similarAds.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {similarAds.map((similarAd: any) => (
                                    <Link
                                        key={similarAd.id}
                                        href={`/ad/${similarAd.id}`}
                                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                            {similarAd.files?.length > 0 ? (
                                                <Image
                                                    src={similarAd.files[0].thumbnailPath
                                                        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${similarAd.files[0].id}/thumbnail`
                                                        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${similarAd.files[0].id}`
                                                    }
                                                    alt={similarAd.title}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover w-full h-full"
                                                    unoptimized
                                                />
                                            ) : (
                                                <Package className="w-8 h-8 text-gray-300 m-auto mt-4" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{similarAd.productType || similarAd.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatNum(similarAd.unitPrice)} تومان/{similarAd.unit?.shortCode || 'تن'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-[10px] text-gray-400">{timeLeft(similarAd.expiresAt)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <p>این فروشنده آگهی دیگری ثبت نکرده است.</p>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}