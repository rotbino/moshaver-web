// app/home/AdModal.tsx
'use client';
import React from 'react';
import { Clock, MapPin, Phone, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdModalProps {
    ad: any;
    onClose: () => void;
    onContact: (adId: string) => void;
}

export default function AdModal({ ad, onClose, onContact }: AdModalProps) {
    const unitShortCode = ad.unit?.shortCode || 'تن';

    return (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl lg:max-w-3xl bg-surface z-10 max-h-[90vh] lg:max-h-[85vh] flex flex-col rounded-t-2xl lg:rounded-sm shadow-2xl overflow-hidden border border-outline-variant/50 lg:border-0">
                {/* Header */}
                <div className="flex justify-center pt-3 pb-1 lg:hidden bg-surface-container-low">
                    <div className="w-10 h-1 rounded-full bg-outline-variant" />
                </div>
                <div className="flex items-center justify-between p-4 pb-2 border-b border-outline-variant/30 bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-sm">
                            <span className="material-symbols-outlined text-primary text-xl">grid_view</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="font-bold text-base text-on-surface">{ad.title}</h2>
                                {ad.productType && (
                                    <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">
                    {ad.productType}
                  </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                                <span>{ad.business?.name}</span>
                                {ad.business?.verificationTier === 'verified' && (
                                    <span className="material-symbols-outlined text-sm text-green-600">verified</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-surface-container-high rounded-sm transition-colors">
                        <X className="w-5 h-5 text-on-surface-variant" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-4 flex-1 space-y-4">
                    {/* Price */}
                    <div className="bg-primary/5 border border-primary/20 rounded-sm p-3 flex items-center justify-between">
                        <span className="text-sm text-on-surface-variant">قیمت نقدی:</span>
                        <div className="text-left">
                            <span className="text-xl font-bold text-primary">{ad.unitPrice.toLocaleString()}</span>
                            <span className="text-xs text-on-surface-variant mr-1">تومان / {unitShortCode}</span>
                        </div>
                    </div>

                    {/* Payment methods */}
                    {ad.customFields?.paymentMethods && (
                        <div className="space-y-2">
                            {ad.customFields.paymentMethods.cheque?.enabled && (
                                <div className="bg-blue-50/50 border border-blue-200 rounded-sm p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">چکی</span>
                                        <span className="text-sm text-on-surface-variant">
                      تا {ad.customFields.paymentMethods.cheque.maxDays} روز
                    </span>
                                    </div>
                                    <span className="font-bold text-sm text-on-surface">
                    {ad.customFields.paymentMethods.cheque.price?.toLocaleString()} تومان
                  </span>
                                </div>
                            )}
                            {ad.customFields.paymentMethods.installment?.enabled && (
                                <div className="bg-green-50/50 border border-green-200 rounded-sm p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">اقساط</span>
                                        <span className="text-sm text-on-surface-variant">
                      {ad.customFields.paymentMethods.installment.months} ماه
                                            {ad.customFields.paymentMethods.installment.prepaymentPercent > 0 &&
                                                ` (${ad.customFields.paymentMethods.installment.prepaymentPercent}٪ پیش)`}
                    </span>
                                    </div>
                                    <span className="font-bold text-sm text-on-surface">
                    {ad.customFields.paymentMethods.installment.price?.toLocaleString()} تومان
                  </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Specs */}
                    {ad.customFields?.specs && Object.keys(ad.customFields.specs).length > 0 && (
                        <div>
                            <h4 className="font-medium text-sm mb-2 text-on-surface">مشخصات فنی</h4>
                            <div className="bg-surface-container-low border border-outline-variant/30 rounded-sm p-3">
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(ad.customFields.specs).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between text-xs">
                                            <span className="text-on-surface-variant">{key}</span>
                                            <span className="font-medium text-on-surface">{value as string}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Basic info grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-surface-container-low border border-outline-variant/50 rounded-sm p-3">
                            <span className="text-[10px] text-on-surface-variant block mb-1">حداقل سفارش</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-on-surface">{ad.minQuantity}</span>
                                <span className="text-xs text-on-surface-variant">{unitShortCode}</span>
                            </div>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant/50 rounded-sm p-3">
                            <span className="text-[10px] text-on-surface-variant block mb-1">موجودی فعلی</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-on-surface">{ad.availableQuantity || 'نامشخص'}</span>
                                {ad.availableQuantity && <span className="text-xs text-on-surface-variant">{unitShortCode}</span>}
                            </div>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant/50 rounded-sm p-3">
                            <span className="text-[10px] text-on-surface-variant block mb-1">مکان تحویل</span>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-on-surface-variant" />
                                <span className="text-sm font-medium text-on-surface">{ad.city || 'نامشخص'}</span>
                            </div>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant/50 rounded-sm p-3">
                            <span className="text-[10px] text-on-surface-variant block mb-1">اعتبار آگهی</span>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-on-surface-variant" />
                                <span className="text-sm font-medium text-on-surface">
                  {Math.ceil((new Date(ad.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))} ساعت
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {ad.description && (
                        <div>
                            <h4 className="font-medium text-sm mb-2 text-on-surface">توضیحات فروشنده</h4>
                            <p className="text-sm text-on-surface-variant bg-surface-container-low p-3 rounded-sm border border-outline-variant/30 leading-6">
                                {ad.description}
                            </p>
                        </div>
                    )}

                    {/* Price history */}
                    {ad.priceHistory && ad.priceHistory.length > 0 && (
                        <div>
                            <h4 className="font-medium text-sm mb-2 text-on-surface flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" /> تاریخچه قیمت
                            </h4>
                            <div className="border border-outline-variant/50 rounded-sm overflow-hidden">
                                {ad.priceHistory.map((item: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between text-xs bg-surface-container-low border-b border-outline-variant/30 py-2 px-3 last:border-b-0"
                                    >
                                        <span className="text-on-surface-variant">{new Date(item.updatedAt).toLocaleDateString('fa-IR')}</span>
                                        <span className="font-medium text-on-surface">{item.price.toLocaleString()} تومان</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact button */}
                <div className="p-4 border-t border-outline-variant/30 bg-surface">
                    <button
                        onClick={() => {
                            onClose();
                            onContact(ad.id);
                        }}
                        disabled={false}
                        className="w-full bg-primary text-on-primary py-3 rounded-sm font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Phone className="w-4 h-4" /> تماس با فروشنده و ثبت سفارش
                    </button>
                </div>
            </div>
        </div>
    );
}