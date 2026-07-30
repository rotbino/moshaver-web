// app/home/AdCard.tsx
'use client';
import React from 'react';
import { Clock, MapPin, Package, Phone, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdCardProps {
    ad: any;
    onContact: (adId: string) => void;
    onDetail: (ad: any) => void;
    categoryUnitMap?: Map<string, string>; // optional, fallback to ad.unit.shortCode
}

export default function AdCard({ ad, onContact, onDetail }: AdCardProps) {
    const unitShortCode = ad.unit?.shortCode || 'تن';
    const paymentMethods = ad.customFields?.paymentMethods;
    const hasCheque = paymentMethods?.cheque?.enabled;
    const hasInstallment = paymentMethods?.installment?.enabled;

    return (
        <div
            onClick={() => onDetail(ad)}
            className="bg-surface-container-lowest border border-outline-variant p-3 pt-5 flex flex-col gap-2 rounded-sm group hover:shadow-md transition-shadow min-w-0 relative cursor-pointer"
        >
            {/* نردبان */}
            {ad.isBumped && (
                <div className="absolute top-1 right-2 flex items-center h-3.5 gap-1 text-red-600 bg-red-50/90 px-2 py-0.5 rounded-full border border-red-200 shadow-sm z-10">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[8px] font-bold text-red-600">نردبان</span>
                </div>
            )}

            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 min-w-11 bg-surface-container-high flex items-center justify-center rounded-sm border border-outline-variant/50">
                        <span className="material-symbols-outlined text-primary text-xl">grid_view</span>
                    </div>
                    <div className="flex flex-col min-w-0 gap-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-sm text-on-surface truncate">{ad.productType || ad.title}</h3>
                            {ad.category?.title && (
                                <span className="text-[9px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {ad.category.title}
                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-on-surface-variant truncate">
                            <span>{ad.business?.name || 'نامشخص'}</span>
                            {ad.business?.verificationTier === 'verified' && (
                                <span className="material-symbols-outlined text-[14px] text-green-600">verified</span>
                            )}
                        </div>
                        {(hasCheque || hasInstallment) && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {hasCheque && (
                                    <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">چکی</span>
                                )}
                                {hasInstallment && (
                                    <span className="text-[8px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">اقساط</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-left flex-shrink-0 flex flex-col items-end">
          <span className="font-bold text-sm text-primary">
            {ad.unitPrice.toLocaleString()}
              <span className="text-[9px] font-normal text-on-surface-variant">ت/{unitShortCode}</span>
          </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onContact(ad.id);
                        }}
                        disabled={false}
                        className="bg-primary text-on-primary text-[10px] px-2.5 py-1 rounded-sm active:scale-95 transition-transform font-medium mt-1 flex items-center gap-1 disabled:opacity-50"
                    >
                        <Phone className="w-3 h-3" /> تماس
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between text-[10px] border-t border-outline-variant/50 pt-2 mt-1">
                <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-on-surface font-medium bg-surface-container-high px-1.5 py-0.5 rounded-sm">
            <Package className="w-3 h-3 text-primary" />min: {ad.minQuantity} {unitShortCode}
          </span>
                    <span className="flex items-center gap-1 text-on-surface-variant">
            <MapPin className="w-3 h-3" />{ad.city || 'نامشخص'}
          </span>
                </div>
                <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-on-surface-variant">
            <Clock className="w-3 h-3" />
              {Math.ceil((new Date(ad.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))} س
          </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetail(ad);
                        }}
                        className="text-primary text-[10px] font-medium hover:underline"
                    >
                        جزئیات
                    </button>
                </div>
            </div>
        </div>
    );
}