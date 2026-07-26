// app/components/AppHeader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ArrowLeft, Plus, Headphones, User } from 'lucide-react';
import { RootState } from '@/lib/store/store';
import { useArms } from '@/lib/api/apiHooks';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';
import {ThemeToggle} from "@/app/components/ThemeToggle";
import Image from 'next/image';
import {cn} from "@/lib/utils";

interface AppHeaderProps {
    showJoinButton?: boolean;
    onJoinClick?: () => void;
    showBackButton?: boolean;
    onBackClick?: () => void;
    backUrl?: string;
    fixed?: boolean;
}

export function AppHeader({
                              showJoinButton = false,
                              onJoinClick,
                              showBackButton = false,
                              onBackClick,
                              backUrl,
                              fixed=false
                          }: AppHeaderProps) {
    const router = useRouter();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { currentArm, currentSlug } = useSelector((state: RootState) => state.arm);
    const [isMember, setIsMember] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const { data: arms, isLoading: armsLoading, refetch: refetchArms } = useArms();

    useEffect(() => {
        if (!isAuthenticated || !currentSlug || !arms) {
            setIsMember(false);
            return;
        }
        const member = arms.some((a: any) => a.slug === currentSlug);
        setIsMember(member);
    }, [isAuthenticated, currentSlug, arms]);

    const handleBack = () => {
        if (onBackClick) onBackClick();
        else if (backUrl) router.push(backUrl);
        else router.back();
    };

    const handleJoinClick = async () => {
        if (onJoinClick) { onJoinClick(); return; }
        if (!isAuthenticated) { router.push(`/login?redirect=/`); return; }

        setIsJoining(true);
        try {
            await apiService.arm.join(currentSlug || 'barton');
            toast.success('با موفقیت در بازار عضو شدید');
            await refetchArms();
            setIsMember(true);
        } catch (error: any) {
            if (error?.data?.errorCode === 'ALREADY_MEMBER') {
                toast.info('شما قبلاً عضو این بازار هستید');
                setIsMember(true);
            } else {
                toast.error(error?.message || 'خطا در عضویت در بازار');
            }
        } finally {
            setIsJoining(false);
        }
    };

    const handleSupportClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const supportNumber = '09196421264';
        if (window.innerWidth < 768) {
            window.location.href = `tel:${supportNumber}`;
        } else {
            toast.info(`تماس با پشتیبانی: ${supportNumber}`, { duration: 5000 });
            navigator.clipboard.writeText(supportNumber)
                .then(() => toast.success('شماره پشتیبانی در کلیپ‌بورد کپی شد'))
                .catch(() => {});
        }
    };

    const shouldShowJoinButton = showJoinButton && (!isAuthenticated || !isMember) && !armsLoading;
    const armName = currentArm?.name || 'سرنخ';
    const armSlogan = currentArm?.slogan || 'قیمت امروز فروشندگان عمده مصالح';
    // app/components/AppHeader.tsx
    // app/components/AppHeader.tsx
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3011';

    const logoFileId =
        (currentArm as any)?.config?.general?.logoFileId ||
        currentArm?.logoFileId;

    const logoUrl =
        (currentArm as any)?.config?.general?.logoUrl ||
        currentArm?.logoUrl;

    const logoSrc = logoFileId
        ? `${API_BASE}/file/${logoFileId}`
        : logoUrl || '/images/logo.png';

    // app/components/AppHeader.tsx
// ⬇ فقط بخش return

    return (
        <header className={cn(
            "bg-surface w-full z-40 flex justify-between items-center px-4 h-16 shadow-[0_1px_8px_-1px_rgba(0,0,0,0.15)]",
            fixed !== false && "fixed top-0 left-0 right-0"
        )}>
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 cursor-pointer relative rounded-lg overflow-hidden flex-shrink-0" onClick={() => router.push('/')}>
                    <Image
                        src={logoSrc}
                        alt="Logo"
                        fill
                        className="object-contain"
                        unoptimized={logoSrc.startsWith('http')}
                        sizes="40px"
                    />
                </div>
                <div className="flex flex-col text-right">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push('/')}
                            className="font-bold text-on-surface text-body-md leading-tight hover:opacity-80 transition-opacity"
                        >
                            {armName}
                        </button>
                        {shouldShowJoinButton ? (
                            <button
                                onClick={handleJoinClick}
                                className="bg-primary hover:bg-primary/90 text-on-primary px-3 py-1 rounded-md text-[10px] font-medium transition-all active:scale-95 shadow-sm"
                                disabled={isJoining}
                            >
                                {isJoining ? 'در حال عضویت...' : 'عضویت در این بازار'}
                            </button>
                        ) : (
                            <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                            نسخه بتا (آزمایشی)
                        </span>
                        )}
                    </div>
                    <span className="text-on-surface-variant text-[10px] leading-tight mt-1">
                    {armSlogan}
                </span>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <ThemeToggle />

                {/* پروفایل - دسکتاپ */}
                <button
                    onClick={() => router.push('/profile')}
                    className="hidden lg:flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-surface-container"
                >
                    <User className="w-4 h-4" />
                    پروفایل من
                </button>

                {/* ثبت قیمت - دسکتاپ */}
                <button
                    onClick={() => router.push(`/ad/create?arm=${currentSlug}`)}
                    className="hidden lg:flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm"
                >
                    <Plus className="w-3.5 h-3.5" />
                    ثبت قیمت
                </button>

                {/* پشتیبانی - دسکتاپ */}
                <button
                    onClick={handleSupportClick}
                    className="hidden lg:flex items-center justify-center p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors"
                    title="پشتیبانی"
                >
                    <Headphones className="w-5 h-5" />
                </button>

                {/* دکمه بازگشت یا لوگو */}
                {showBackButton ? (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors active:scale-95"
                    >
                        <span className="text-sm">بازگشت</span>
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                ) : (
                    <span className="font-mono-data font-bold text-[10px] text-on-surface-variant tracking-widest uppercase">
                    SARNAKH
                </span>
                )}
            </div>
        </header>
    );
}