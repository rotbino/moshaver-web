// app/arm/[armId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setArm, setArmLoading, setArmError } from '@/lib/store/slices/armSlice';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';

export default function ArmPageContent() {
    const router = useRouter();
    const params = useParams();
    const dispatch = useDispatch();
    const [error, setError] = useState<string | null>(null);
    const [isServerDown, setIsServerDown] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const armId = params?.armId as string;

    useEffect(() => {
        const loadArm = async () => {
            if (!armId) {
                router.replace('/no-arm');
                return;
            }

            dispatch(setArmLoading(true));

            try {
                const arm = await apiService.arm.fetchArmData(armId);
                dispatch(setArm({ arm, slug: armId }));
                localStorage.setItem('lastArmSlug', armId);
                router.replace('/');
            } catch (error: any) {
                console.error('❌ Error loading arm:', error);

                const errorMessage = error.message || 'خطا در دریافت اطلاعات بازار';

                if (errorMessage.includes('سرور در دسترس نیست')) {
                    setIsServerDown(true);
                    setError('سرور در دسترس نیست. لطفاً بعداً تلاش کنید.');
                    toast.error('سرور در دسترس نیست');
                } else if (errorMessage.includes('یافت نشد')) {
                    setError(errorMessage);
                    toast.error(errorMessage);
                } else {
                    setError('خطا در دریافت اطلاعات بازار');
                    //toast.error(errorMessage);
                }

                dispatch(setArmError(errorMessage));

                // اگر خطای سرور بود، بعد از ۳ ثانیه دوباره تلاش کن (حداکثر ۳ بار)
                if (errorMessage.includes('سرور در دسترس نیست') && retryCount < 3) {
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                        setIsServerDown(false);
                        setError(null);
                        loadArm();
                    }, 3000);
                }
            }
        };

        loadArm();
    }, [armId, router, dispatch, retryCount]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">
                        {isServerDown ? '🔌' : '🔍'}
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                        {isServerDown ? 'سرور در دسترس نیست' : ''}
                    </h1>
                    <p className="text-body-md text-on-surface-variant mb-6">
                        {error}
                    </p>
                    {isServerDown && (
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary text-on-primary px-6 py-2 font-label-md hover:bg-primary/90 transition-colors"
                        >
                            تلاش مجدد
                        </button>
                    )}
                    {!isServerDown && (
                        <button
                            onClick={() => router.replace('/')}
                            className="bg-primary text-on-primary px-6 py-2 font-label-md hover:bg-primary/90 transition-colors"
                        >
                            بازگشت به صفحه اصلی
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-on-surface-variant">در حال بارگذاری بازار...</p>
            </div>
        </div>
    );
}