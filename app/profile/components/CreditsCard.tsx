// app/profile/components/CreditsCard.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, PlusCircle } from 'lucide-react';

interface CreditsCardProps {
    balance: number;
}

export default function CreditsCard({ balance }: CreditsCardProps) {
    const router = useRouter();

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-outline-variant/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-semibold text-on-surface dark:text-gray-100">کیف اعتبار</h3>
                </div>
                <button onClick={() => router.push('/credit/purchase')} className="text-primary hover:text-primary/80"><PlusCircle className="w-5 h-5" /></button>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">{balance?.toLocaleString() || 0}</span>
                <span className="text-xs text-on-surface-variant dark:text-gray-400">اعتبار</span>
            </div>
        </div>
    );
}