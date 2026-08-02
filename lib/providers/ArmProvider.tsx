// lib/providers/ArmProvider.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setArm, setArmLoading, setArmError } from '@/lib/store/slices/armSlice';
import { useArm } from '@/lib/api/apiHooks';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';

const PUBLIC_PATHS = [
    '/login',
    '/register',
    '/admin',
    '/arm-admin',
    '/no-arm',
    '/business',
    '/profile',
    '/ad',

    '/ad/create',
    '/ad/edit',
    '/dashboard',
    '/terms',
    '/purchase',
    '/credit/purchase',
    '/credit/verify',
    '/feedback',
    '/credit/payments',
    '/credit/report',

];

interface ArmProviderProps {
    children: React.ReactNode;
}

export function ArmProvider({ children }: ArmProviderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const { currentSlug, currentArm } = useSelector((state: RootState) => state.arm);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [isInitialized, setIsInitialized] = useState(false);
    const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);

    const { data: armData, isLoading: armLoading, refetch: refetchArm } = useArm(currentSlug || '');

    // ⭐ ست کردن بازو توی Redux
    useEffect(() => {
        if (armData && currentSlug) {
            dispatch(setArm({ arm: armData, slug: currentSlug }));
            localStorage.setItem('lastArmSlug', currentSlug);
        }
    }, [armData, currentSlug, dispatch]);

    useEffect(() => {
        if (currentSlug && !armLoading) {
            refetchArm();
        }
    }, [currentSlug, refetchArm, armLoading]);

    // ⭐ عضویت خودکار هنگام ورود به بازار
    // lib/providers/ArmProvider.tsx

// ⭐ عضویت خودکار هنگام ورود به بازار
    useEffect(() => {
        if (!armData || !isAuthenticated || autoJoinAttempted) return;

        const config = armData.config || {};
        const autoJoinOnEntry = config?.accessRules?.autoJoinOnEntry === true;

        if (!autoJoinOnEntry) return;

        const checkAndJoin = async () => {
            try {
                const userArms = await apiService.arm.getUserArms();
                const isAlreadyMember = userArms.some((a: any) => a.slug === currentSlug);

                if (!isAlreadyMember) {
                    await apiService.arm.join(currentSlug!);
                    toast.success('به‌طور خودکار عضو بازار شدید');

                    // ⭐ ریلود دیتای بازو برای آپدیت membership count
                    const updatedArm = await apiService.arm.fetchArmData(currentSlug!);
                    dispatch(setArm({ arm: updatedArm, slug: currentSlug! }));
                }
            } catch (error: any) {
                if (error?.data?.errorCode === 'INDUSTRY_NOT_ALLOWED') {
                   // toast.error('صنف شما مجاز به عضویت در این بازار نیست');
                } else if (error?.data?.errorCode === 'ALREADY_MEMBER') {
                    // هیچی
                } else {
                    console.error('Auto-join failed:', error);
                }
            } finally {
                setAutoJoinAttempted(true);
            }
        };

        checkAndJoin();
    }, [armData, isAuthenticated, currentSlug, autoJoinAttempted]);

    // ⭐ ریست autoJoinAttempted وقتی مسیر عوض میشه
    useEffect(() => {
        setAutoJoinAttempted(false);
    }, [currentSlug]);

    // ⭐ لود اولیه بازو
    useEffect(() => {
        const initArm = async () => {
            if (PUBLIC_PATHS.some(path => pathname === path || pathname?.startsWith(`${path}/`))) {
                setIsInitialized(true);
                return;
            }

            const firstSegment = pathname?.split('/').filter(Boolean)[0];

            if (pathname?.startsWith('/') && pathname !== '/' && !PUBLIC_PATHS.some(p => pathname?.startsWith(p))) {
                const slug = firstSegment;

                if (slug && slug !== currentSlug) {
                    dispatch(setArmLoading(true));
                    try {
                        const arm = await apiService.arm.fetchArmData(slug);
                        if (arm) {
                            dispatch(setArm({ arm, slug }));
                            localStorage.setItem('lastArmSlug', slug);
                        } else {
                            router.replace('/no-arm');
                            setIsInitialized(true);
                            return;
                        }
                    } catch (error) {
                        console.error('Error loading arm:', error);
                        dispatch(setArmError('خطا در دریافت اطلاعات بازار'));
                        router.replace('/no-arm');
                        setIsInitialized(true);
                        return;
                    }
                }

                setIsInitialized(true);
                return;
            }

            if (!currentSlug && pathname === '/') {
                const lastSlug = localStorage.getItem('lastArmSlug');
                if (lastSlug) {
                    router.replace(`/${lastSlug}`);
                    return;
                }
                router.replace('/no-arm');
                return;
            }

            if (currentSlug && !currentArm) {
                dispatch(setArmLoading(true));
                try {
                    const arm = await apiService.arm.fetchArmData(currentSlug);
                    if (arm) {
                        dispatch(setArm({ arm, slug: currentSlug }));
                        localStorage.setItem('lastArmSlug', currentSlug);
                    } else {
                        router.replace('/no-arm');
                    }
                } catch (error) {
                    console.error('Error fetching arm:', error);
                    dispatch(setArmError('خطا در دریافت اطلاعات بازار'));
                }
            }

            setIsInitialized(true);
        };

        initArm();
    }, [pathname, currentSlug, currentArm, router, dispatch]);

    if (!isInitialized || armLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-on-surface-variant">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}