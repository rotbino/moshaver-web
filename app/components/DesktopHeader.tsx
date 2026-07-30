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

export default function DesktopHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { currentArm, currentSlug } = useSelector((state: RootState) => state.arm);
    const [isMember, setIsMember] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const { data: arms, isLoading: armsLoading, refetch: refetchArms } = useArms();

    const isHomePage = pathname === `/${params.slug}` || pathname === '/';

    useEffect(() => {
        if (!isAuthenticated || !currentSlug || !arms) { setIsMember(false); return; }
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
            if (error?.data?.errorCode === 'ALREADY_MEMBER') { setIsMember(true); }
            else { toast.error(error?.message || 'خطا در عضویت'); }
        } finally { setIsJoining(false); }
    };

    const handleSupportClick = () => {
        const supportNumber = '09196421264';
        toast.info(`تماس با پشتیبانی: ${supportNumber}`, { duration: 5000 });
        navigator.clipboard.writeText(supportNumber).then(() => toast.success('شماره پشتیبانی کپی شد')).catch(() => {});
    };

    const armName = currentArm?.name || 'سرنخ';
    const armSlogan = currentArm?.slogan || 'قیمت امروز فروشندگان عمده مصالح';

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3011';
    const logoFileId = (currentArm as any)?.config?.general?.logoFileId || currentArm?.logoFileId;
    const logoUrl = (currentArm as any)?.config?.general?.logoUrl || currentArm?.logoUrl;
    const logoSrc = logoFileId ? `${API_BASE}/file/${logoFileId}` : logoUrl || '/images/logo.png';

    const showJoin = isHomePage && (!isAuthenticated || !isMember) && !armsLoading;

    return (
        <header className="bg-white dark:bg-gray-900 .header-shadow {box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
} border-b-[0px] border-outline-variant/1">

            <div className="flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 cursor-pointer relative rounded-md overflow-hidden flex-shrink-0" onClick={() => router.push('/')}>
                        <Image src={logoSrc} alt="Logo" fill className="object-contain" unoptimized={logoSrc.startsWith('http')} sizes="40px" />
                    </div>
                    <div className="flex flex-col text-right">
                        <div className="flex items-center gap-2">
                            <button onClick={() => router.push('/')} className="font-bold text-on-surface text-sm leading-tight hover:opacity-80">
                                {armName}
                            </button>
                            {showJoin && (
                                <button onClick={handleJoinClick} className="bg-primary hover:bg-primary/90 text-on-primary px-3 py-1 rounded-md text-[10px] font-medium" disabled={isJoining}>
                                    {isJoining ? 'در حال عضویت...' : 'عضویت در این بازار'}
                                </button>
                            )}
                        </div>
                        <span className="text-on-surface-variant text-[10px] leading-tight mt-0.5">{armSlogan}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => router.push(`/ad/create?arm=${currentSlug}`)} className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm">
                        <Plus className="w-3.5 h-3.5" /> ثبت قیمت
                    </button>
                    <ThemeToggle />
                    <button onClick={() => router.push('/profile')} className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary pl-2 py-1.5 rounded-md hover:bg-surface-container transition-colors">
                        <User className="w-4 h-4" />
                    </button>

                    <button onClick={handleSupportClick} className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors" title="پشتیبانی">
                        <Headphones className="w-5 h-5" />
                    </button>

                    <span className="font-mono font-bold text-[10px] text-on-surface-variant tracking-widest uppercase">SARNAKH</span>
                </div>
            </div>
        </header>
    );
}