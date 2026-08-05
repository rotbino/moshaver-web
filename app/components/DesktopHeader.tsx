// app/components/DesktopHeader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Plus, Headphones, User } from 'lucide-react';
import { RootState } from '@/lib/store/store';
import { useArms } from '@/lib/api/apiHooks';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { getApiUrl } from '@/lib/api/apiRequest';

interface DesktopHeaderProps {
    showLocation?: boolean;
    fixed?: boolean;
    showBack?: boolean;
}

export default function DesktopHeader({ showLocation = false, showBack = true, fixed = true }: DesktopHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const { currentArm, currentSlug } = useSelector((state: RootState) => state.arm);
    const [isMember, setIsMember] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const { data: arms, isLoading: armsLoading, refetch: refetchArms } = useArms();

    const isHomePage = pathname === `/${params.slug}` || pathname === '/';

    useEffect(() => {
        if (!isAuthenticated || !currentSlug || !arms) {
            setIsMember(false);
            return;
        }
        const member = arms.some((a: any) => a.slug === currentSlug);
        setIsMember(member);
    }, [isAuthenticated, currentSlug, arms]);

    const handleJoinClick = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/`);
            return;
        }
        setIsJoining(true);
        try {
            await apiService.arm.join(currentSlug || 'barton');
            toast.success('با موفقیت در بازار عضو شدید');
            await refetchArms();
            setIsMember(true);
        } catch (error: any) {
            if (error?.data?.errorCode === 'ALREADY_MEMBER') {
                setIsMember(true);
            } else {
                toast.error(error?.message || 'خطا در عضویت');
            }
        } finally {
            setIsJoining(false);
        }
    };

    const handleSupportClick = () => {
        const supportNumber = '09196421264';
        toast.info(`تماس با پشتیبانی: ${supportNumber}`, { duration: 5000 });
        navigator.clipboard.writeText(supportNumber).then(() => toast.success('شماره پشتیبانی کپی شد')).catch(() => {});
    };

    const armName = currentArm?.name || 'سرنخ';
    const armSlogan = currentArm?.slogan || 'قیمت امروز فروشندگان عمده مصالح';

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3011';
    const logoFileId = (currentArm as any)?.config?.general?.logoFileId || currentArm?.logoUrl;
    const logoUrl = (currentArm as any)?.config?.general?.logoUrl || currentArm?.logoUrl;
    const logoSrc = logoFileId ? `${API_BASE}/file/${logoFileId}` : logoUrl || '/images/logo.png';

    const fullName = user?.fullName || 'کاربر';
    const avatarSrc = user?.avatarFile?.id ? getApiUrl(`/file/${user.avatarFile.id}/thumbnail`) : null;

    const showJoin = isHomePage && (!isAuthenticated || !isMember) && !armsLoading;

    return (
        // ✅ تغییر اصلی: اضافه کردن شرط fixed و کلاس‌های position
        <header className={`hidden lg:block bg-white dark:bg-gray-900 border-b border-outline-variant/20 ${fixed ? 'sticky top-0 left-0 right-0 z-50 w-full' : ''}`}>
            <div className="flex items-center justify-between px-6 lg:px-8 h-[80px]">
                {/* ... (بقیه محتوا بدون تغییر) ... */}
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 cursor-pointer relative rounded-xl overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity" onClick={() => router.push('/')}>
                        <Image src={logoSrc} alt="Logo" fill className="object-contain" unoptimized={logoSrc.startsWith('http')} sizes="44px" />
                    </div>
                    <div className="flex flex-col text-right">
                        <div className="flex items-center gap-3">
                            <button onClick={() => router.push('/')} className="font-extrabold text-gray-900 dark:text-gray-100 text-[17px] leading-tight hover:opacity-80 transition-opacity">
                                {armName}
                            </button>
                            {showJoin && (
                                <button onClick={handleJoinClick} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-[11px] font-medium transition-colors shadow-sm disabled:opacity-50">
                                    {isJoining ? 'در حال عضویت...' : 'عضویت رایگان'}
                                </button>
                            )}
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 text-[11px] mt-0.5">{armSlogan}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => router.push(`/ad/create?arm=${currentSlug}`)} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> ثبت قیمت
                    </button>
                    <ThemeToggle />
                    <button
                        onClick={() => router.push('/profile')}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={fullName}
                    >
                        {avatarSrc ? (
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <Image src={avatarSrc} alt={fullName} width={32} height={32} className="w-full h-full object-cover" unoptimized={avatarSrc.startsWith('http')} />
                            </div>
                        ) : (
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                <Image src="/images/no_profile_image.jpg" alt="بدون تصویر" width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}