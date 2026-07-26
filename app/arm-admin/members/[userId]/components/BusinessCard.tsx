// app/arm-admin/members/[userId]/components/BusinessCard.tsx
'use client';

import React, { useState } from 'react';
import { Building2, MapPin, TrendingUp, BadgeCheck, ChevronDown, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Business {
    id: string;
    name: string;
    type: string;
    verificationTier: string;
    city: string;
    province: string;
    trustScore: number;
    description?: string;
}

interface BusinessCardProps {
    businesses: Business[];
    onBusinessChange?: (businessId: string) => void;
}

export function BusinessCard({ businesses, onBusinessChange }: BusinessCardProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const business = businesses[selectedIndex];

    const getVerificationBadge = (tier: string) => {
        if (tier === 'none' || !tier) return null;
        const colors = {
            blue: 'text-blue-600 bg-blue-50',
            silver: 'text-gray-600 bg-gray-50',
            gold: 'text-yellow-600 bg-yellow-50',
        };
        return (
            <span className={cn(
                "inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full",
                colors[tier as keyof typeof colors] || colors.blue
            )}>
                <BadgeCheck className="w-3 h-3" />
                {tier === 'gold' ? 'طلایی' : tier === 'silver' ? 'نقره‌ای' : 'آبی'}
            </span>
        );
    };

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
        if (onBusinessChange) {
            onBusinessChange(businesses[index].id);
        }
    };

    return (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 sm:p-6">
            {businesses.length > 1 && (
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-outline-variant/30">
                    <Store className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-on-surface">کسب‌وکار:</span>
                    <div className="relative flex-1">
                        <select
                            value={selectedIndex}
                            onChange={(e) => handleSelect(Number(e.target.value))}
                            className="w-full appearance-none bg-surface-container-lowest border border-outline rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                            {businesses.map((b, idx) => (
                                <option key={b.id} value={idx}>{b.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                    </div>
                </div>
            )}

            <div>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Building2 className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-on-surface">
                                {business.name}
                            </h3>
                            {getVerificationBadge(business.verificationTier)}
                        </div>
                        <p className="text-sm text-on-surface-variant mt-1">{business.type}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-on-surface-variant">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {business.city}، {business.province}
                            </span>
                            <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                امتیاز: {business.trustScore}
                            </span>
                        </div>
                    </div>
                </div>
                {business.description && (
                    <p className="mt-3 text-sm text-on-surface-variant border-t border-outline-variant/30 pt-3">
                        {business.description}
                    </p>
                )}
            </div>
        </div>
    );
}