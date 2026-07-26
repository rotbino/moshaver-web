// app/admin/arm/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';
import { ArmForm } from '../../components/ArmForm';
import { FormHeader } from '@/app/components/FormHeader';
import { Loader2 } from 'lucide-react';

export default function EditArmPage() {
    const router = useRouter();
    const params = useParams();
    const armId = params.id as string;

    const [arm, setArm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // واکشی اطلاعات بازار
    useEffect(() => {
        const fetchArm = async () => {
            try {
                const data = await apiService.admin.arms.getOne(armId);
                setArm(data);
            } catch (error: any) {
                console.error('Error fetching arm:', error);
                toast.error(error?.message || 'خطا در دریافت اطلاعات بازار');
                router.push('/admin/arm');
            } finally {
                setLoading(false);
            }
        };
        fetchArm();
    }, [armId, router]);

    const handleSubmit = async (data: any) => {
        setSaving(true);
        try {
            await apiService.admin.arms.update(armId, data);
            //toast.success('بازار با موفقیت به‌روزرسانی شد');
            //router.push('/admin/arm');
        } catch (error: any) {
            console.error('Error updating arm:', error);
            toast.error(error?.message || 'خطا در به‌روزرسانی بازار');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-on-surface-variant">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (!arm) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-error">بازار یافت نشد</p>
                    <button
                        onClick={() => router.push('/admin/arm')}
                        className="mt-4 bg-primary text-on-primary px-4 py-2 hover:bg-primary/90 transition-colors"
                    >
                        بازگشت به لیست
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <FormHeader
                title={`ویرایش بازار: ${arm.name}`}
                subtitle="تنظیمات بازار را به‌روزرسانی کنید"
                backUrl="/admin/arm"
            />
            <main className="mx-auto px-4 py-8 pb-32">
                <ArmForm
                    initialData={arm}
                    onSubmit={handleSubmit}
                    isSubmitting={saving}
                />
            </main>
        </div>
    );
}