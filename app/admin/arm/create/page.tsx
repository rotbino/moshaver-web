// app/admin/arm/create/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateArm } from '@/lib/api/apiHooks';
import { ArmForm } from '../components/ArmForm';
import { FormHeader } from '@/app/components/FormHeader';

export default function CreateArmPage() {
    const router = useRouter();
    const createArmMutation = useCreateArm();

    const handleSubmit = async (data: any) => {
        try {
            const result = await createArmMutation.mutateAsync(data);
            toast.success('بازار با موفقیت ساخته شد');
            // ✅ بعد از ساخت، به لیست بازارها برو
            router.push('/admin/arm');
        } catch (error: any) {
            console.error('Error creating arm:', error);
            toast.error(error?.message || 'خطا در ساخت بازار');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <FormHeader
                title="ساخت بازارجدید"
                subtitle="همه تنظیمات بازار را مشخص کنید"
                backUrl="/admin/arm"
            />
            <main className="max-w-4xl mx-auto px-4 py-8 pb-32">
                <ArmForm
                    onSubmit={handleSubmit}
                    isSubmitting={createArmMutation.isPending}
                    isEditMode={false}
                />
            </main>
        </div>
    );
}