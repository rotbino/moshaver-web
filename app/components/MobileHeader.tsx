// app/components/MobileHeader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import {ArrowLeft, ArrowRight, Headphones} from 'lucide-react';
import { RootState } from '@/lib/store/store';
import { useArms } from '@/lib/api/apiHooks';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Image from 'next/image';
import { LocationFilter } from '@/app/components/LocationFilter';
import { useFilters } from '@/lib/hooks/useFilters';

interface MobileHeaderProps {
    showLocation?: boolean;
    fixed?: boolean;
    showBack?:boolean
}

export default function MobileHeader({ showLocation = false,showBack=true, fixed = true }: MobileHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { currentArm, currentSlug } = useSelector((state: RootState) => state.arm);
    const { location } = useFilters();
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
        if (!isAuthenticated) { router.push(`/login?redirect=/`); return; }
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
        window.location.href = 'tel:09196421264';
    };

    const armName = currentArm?.name || 'سرنخ';
    const armSlogan = currentArm?.slogan || 'قیمت امروز فروشندگان عمده مصالح';

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3011';
    const logoFileId = (currentArm as any)?.config?.general?.logoFileId || currentArm?.logoUrl; // ✅ اصلاح شد
    const logoUrl = (currentArm as any)?.config?.general?.logoUrl || currentArm?.logoUrl;
    const logoSrc = logoFileId ? `${API_BASE}/file/${logoFileId}` : logoUrl || '/images/logo.png';

    const showJoin = isHomePage && (!isAuthenticated || !isMember) && !armsLoading;


    return (
        <header className=" z-40 bg-white ">
            <div className="flex items-center justify-between px-4 h-16">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {showBack && (
                        <button onClick={() => router.back()} className="p-1.5 -ml-1">
                            <ArrowRight className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                    <div className="w-9 h-9 cursor-pointer relative rounded-lg overflow-hidden flex-shrink-0" onClick={() => router.push('/')}>
                        <Image src={logoSrc} alt="Logo" fill className="object-contain" unoptimized={logoSrc.startsWith('http')} sizes="36px" />
                    </div>
                    <div className="flex flex-col text-right min-w-0">
                        <div className="flex items-center gap-2">
                            <button onClick={() => router.push('/')} className="font-bold text-gray-900 dark:text-gray-100 text-[13px] leading-tight truncate">
                                {armName}
                            </button>
                            {showJoin && (
                                <button onClick={handleJoinClick} className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-bold disabled:opacity-50">
                                    {isJoining ? '...' : 'عضویت'}
                                </button>
                            )}
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 text-[9px] leading-tight truncate">{armSlogan}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {!showLocation && <ThemeToggle />}
                    <button onClick={handleSupportClick} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Headphones className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}