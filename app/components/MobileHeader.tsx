// app/components/MobileHeader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { MapPin, ChevronDown, Headphones, ArrowLeft, X } from 'lucide-react';
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
}

export default function MobileHeader({ showLocation = false, fixed }: MobileHeaderProps) {
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
    const logoFileId = (currentArm as any)?.config?.general?.logoFileId || currentArm?.logoFileId;
    const logoUrl = (currentArm as any)?.config?.general?.logoUrl || currentArm?.logoUrl;
    const logoSrc = logoFileId ? `${API_BASE}/file/${logoFileId}` : logoUrl || '/images/logo.png';

    const locationLabel = (() => {
        if (location.cityId) return location.cityLabel;
        if (location.provinceId) return `استان ${location.provinceLabel}`;
        return null;
    })();

    const showJoin = isHomePage && (!isAuthenticated || !isMember) && !armsLoading;
    const showBack = !isHomePage;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-2">
                        {showBack && (
                            <button onClick={() => router.back()} className="p-1.5 -ml-1.5">
                                <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
                            </button>
                        )}
                        <div className="w-10 h-10 cursor-pointer relative rounded-md overflow-hidden flex-shrink-0" onClick={() => router.push('/')}>
                            <Image src={logoSrc} alt="Logo" fill className="object-contain" unoptimized={logoSrc.startsWith('http')} sizes="40px" />
                        </div>
                        <div className="flex flex-col text-right">
                            <div className="flex items-center gap-2">
                                <button onClick={() => router.push('/')} className="font-bold text-on-surface text-sm leading-tight">
                                    {armName}
                                </button>
                                {showJoin && (
                                    <button onClick={handleJoinClick} className="bg-primary hover:bg-primary/90 text-on-primary px-2.5 py-0.5 rounded-md text-[10px] font-medium" disabled={isJoining}>
                                        {isJoining ? '...' : 'عضویت'}
                                    </button>
                                )}
                            </div>
                            <span className="text-on-surface-variant text-[10px] leading-tight mt-0.5">{armSlogan}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {!showLocation? (
                            <LocationFilter />
                        ):(
                            <>
                                <ThemeToggle />
                                <button onClick={handleSupportClick} className="p-2 text-on-surface-variant">
                                    <Headphones className="w-5 h-5" />
                                </button>
                            </>
                        )}

                    </div>
                </div>
            </header>


        </>
    );
}