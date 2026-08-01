// app/home/AdCard.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import {
    Clock, MapPin, Package, TrendingUp, BadgeCheck, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdCardProps {
    ad: any;
    onContact: (adId: string) => void;
    onDetail: (ad: any) => void;
}

function formatNum(n: number | undefined) {
    return n?.toLocaleString('fa-IR') ?? '—';
}

export default function AdCard({ ad, onDetail }: AdCardProps) {
    const unit = ad.unit?.shortCode || 'تن';
    const payment = ad.customFields?.paymentMethods;
    const hasCheque = payment?.cheque?.enabled;
    const hasInstallment = payment?.installment?.enabled;
    const tier = ad.business?.verificationTier;
    const hoursLeft = Math.ceil(
        (new Date(ad.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60),
    );
    const isUrgent = hoursLeft > 0 && hoursLeft <= 12;

    const adImage = ad.files?.find((f: any) => f.fieldKey?.startsWith('ad-image'));
    const imageUrl = adImage
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/file/${adImage.id}/thumbnail`
        : '/images/no_product_image.jpg';

    const tierColor =
        tier === 'gold' ? 'text-yellow-500 dark:text-yellow-400' :
            tier === 'silver' ? 'text-gray-400 dark:text-gray-300' :
                tier === 'blue' ? 'text-blue-500 dark:text-blue-400' : '';

    return (
        <div
            onClick={() => onDetail(ad)}
            className={cn(
                'relative overflow-hidden rounded-xl cursor-pointer group',
                'bg-white dark:bg-gray-900',
                'border border-outline-variant/15 dark:border-gray-800/80',
                'hover:shadow-md hover:border-primary/20 dark:hover:border-primary/25',
                'active:scale-[0.99] transition-all duration-200',
            )}
        >
            {/* بج نردبان */}
            {ad.isBumped && (
                <div className="absolute top-2 right-2 z-20 flex items-center gap-0.5 bg-gradient-to-l from-orange-500 to-rose-500 text-white text-[9px] font-extrabold px-1.5 py-[3px] rounded-md shadow-lg">
                    <TrendingUp className="w-2.5 h-2.5" />
                    نردبان
                </div>
            )}

            {/* ═══ موبایل: افقی ═══ */}
            <div className="flex lg:hidden items-center gap-4 p-4">
                <div className="relative w-[76px] h-[76px] rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <Image
                        src={imageUrl}
                        alt={ad.productType || ad.title}
                        fill
                        className="object-contain p-1.5"
                        sizes="76px"
                        unoptimized
                    />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center gap-[5px]">
                    <div className="flex items-center gap-1 min-w-0">
                        <h3 className="font-bold text-[13px] text-gray-900 dark:text-white truncate leading-tight">
                            {ad.productType || ad.title}
                        </h3>
                        {tier && tier !== 'none' && (
                            <BadgeCheck className={cn("w-3.5 h-3.5 shrink-0 -mt-px", tierColor)} strokeWidth={2.5} />
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 min-w-0">
                        <span className="truncate">{ad.business?.name || '—'}</span>
                        {ad.city && (
                            <>
                                <span className="text-gray-200 dark:text-gray-700 shrink-0">·</span>
                                <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
                                <span className="shrink-0">{ad.city}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-baseline gap-1">
                        <span className="text-[18px] font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
                            {formatNum(ad.unitPrice)}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">
                            تومان/{unit}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px] text-gray-400 dark:text-gray-500 flex-wrap">
                        <span className="flex items-center gap-0.5 shrink-0">
                            <Package className="w-3 h-3" />
                            {formatNum(ad.minQuantity)} {unit}
                        </span>
                        {ad.availableQuantity && (
                            <span className="flex items-center gap-0.5 shrink-0">
                                <Layers className="w-3 h-3" />
                                {formatNum(ad.availableQuantity)} {unit}
                            </span>
                        )}
                        {hasCheque && (
                            <span className="font-semibold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-px rounded shrink-0">چکی</span>
                        )}
                        {hasInstallment && (
                            <span className="font-semibold text-emerald-500 dark:text-emerald-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-px rounded shrink-0">اقساط</span>
                        )}
                        {isUrgent && (
                            <span className="flex items-center gap-0.5 text-red-500 shrink-0">
                                <Clock className="w-3 h-3 animate-pulse" />
                                فوری
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ دسکتاپ: عمودی فشرده ═══ */}
            <div className="hidden lg:flex flex-col">
                <div className="relative w-full aspect-[5/3] bg-gray-50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                    <Image
                        src={imageUrl}
                        alt={ad.productType || ad.title}
                        fill
                        className="object-contain p-3"
                        sizes="(max-width:1280px) 33vw, 25vw"
                        unoptimized
                    />
                </div>

                <div className="p-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1 min-w-0">
                        <h3 className="font-bold text-[12.5px] text-gray-900 dark:text-white truncate leading-tight">
                            {ad.productType || ad.title}
                        </h3>
                        {tier && tier !== 'none' && (
                            <BadgeCheck className={cn("w-3.5 h-3.5 shrink-0 -mt-px", tierColor)} strokeWidth={2.5} />
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 min-w-0">
                        <span className="truncate">{ad.business?.name || '—'}</span>
                        {ad.city && (
                            <>
                                <span className="text-gray-200 dark:text-gray-700 shrink-0">·</span>
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-primary/60" />
                                <span className="shrink-0">{ad.city}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-baseline gap-1">
                        <span className="text-[17px] font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
                            {formatNum(ad.unitPrice)}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">
                            تومان/{unit}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 flex-wrap">
                        <span className="flex items-center gap-0.5 shrink-0">
                            <Package className="w-2.5 h-2.5" />
                            {formatNum(ad.minQuantity)} {unit}
                        </span>
                        {ad.availableQuantity && (
                            <span className="flex items-center gap-0.5 shrink-0">
                                <Layers className="w-2.5 h-2.5" />
                                {formatNum(ad.availableQuantity)} {unit}
                            </span>
                        )}
                        {hasCheque && (
                            <span className="font-semibold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-px rounded shrink-0">چکی</span>
                        )}
                        {hasInstallment && (
                            <span className="font-semibold text-emerald-500 dark:text-emerald-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-px rounded shrink-0">اقساط</span>
                        )}
                        {isUrgent && (
                            <span className="flex items-center gap-0.5 text-red-500 shrink-0">
                                <Clock className="w-2.5 h-2.5 animate-pulse" />
                                فوری
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}