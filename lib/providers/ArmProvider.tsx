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
];

interface ArmProviderProps {
    children: React.ReactNode;
}

export function ArmProvider({ children }: ArmProviderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const { currentSlug, currentArm } = useSelector((state: RootState) => state.arm);
    const [isInitialized, setIsInitialized] = useState(false);

    const { data: armData, isLoading: armLoading, refetch: refetchArm } = useArm(currentSlug || '');

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

    useEffect(() => {
        const initArm = async () => {
            // ۱. اگر در صفحات عمومی هستیم، کاری نکن
            if (PUBLIC_PATHS.some(path => pathname === path || pathname?.startsWith(`${path}/`))) {
                setIsInitialized(true);
                return;
            }

            // ۲. تشخیص مسیر بازار: /:slug
            const firstSegment = pathname?.split('/').filter(Boolean)[0];

            // اگر مسیر یک اسلاگ معتبر است (مثلاً /barton)
            if (pathname?.startsWith('/') && pathname !== '/' && !PUBLIC_PATHS.some(p => pathname?.startsWith(p))) {
                const slug = firstSegment;

                // اگر اسلاگ با اسلاگ فعلی فرق داره، بازار رو بارگذاری کن
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
                        //toast.error('خطا در دریافت اطلاعات بازار');
                        router.replace('/no-arm');
                        setIsInitialized(true);
                        return;
                    }
                }

                setIsInitialized(true);
                return;
            }

            // ۳. اگر بازارفعلی وجود نداره و در صفحه اصلی هستیم
            if (!currentSlug && pathname === '/') {
                const lastSlug = localStorage.getItem('lastArmSlug');
                if (lastSlug) {
                    router.replace(`/${lastSlug}`);
                    return;
                }
                router.replace('/no-arm');
                return;
            }

            // ۴. اگر بازارفعال وجود داره و اطلاعاتش توی استور نیست
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
                    //toast.error('خطا در دریافت اطلاعات بازار');
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