'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { Input } from '@/components/radix/input';
import { Badge } from '@/components/radix/badge';
import { Switch } from '@/components/radix/switch';
import { Settings, Save, Clock, DollarSign, Phone, Video, User, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/data-transfer/api-hooks';
import { usePricing, useBulkCreatePricings } from '@/lib/data-transfer/api-hooks';
import {
    ConsultationDuration,
    ConsultationType,
} from '@/lib/data-transfer/data-types';
import {toast} from "@/lib/hooks/app-toast";
import {FloatingLabel} from "@/components/common";
import {CreatePricingDto} from "@/lib/data-transfer/types";

// کامپوننت NumberInput
interface NumberInputProps {
    value: number | undefined;
    onChange: (value: number) => void;
    unit?: string;
    className?: string;
    maxLength?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
                                                            value,
                                                            onChange,
                                                            unit,
                                                            className,
                                                            maxLength = 7,
                                                            ...rest
                                                        }) => {
    const formatValue = (val: number | undefined) =>
        val ? val.toLocaleString("en-US") : "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
        const num = raw ? Number(raw) : 0;

        if (raw.length <= maxLength) {
            onChange(num);
        }
    };

    return (
        <div className="relative">
            <input
                {...rest}
                dir="ltr"
                inputMode="numeric"
                value={formatValue(value)}
                onChange={handleChange}
                className={`w-full ${className}`}
            />
            {unit && (
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm">
                    {unit}
                </span>
            )}
        </div>
    );
};

const consultationTypes = [
    { id: 'IN_PERSON', name: 'حضوری', description: 'مشاوره حضوری در دفتر وکیل', icon: User },
    { id: 'PHONE', name: 'تلفنی', description: 'مشاوره تلفنی', icon: Phone },
    { id: 'VIDEO', name: 'تماس ویدئویی', description: 'مشاوره تماس ویدئوییدر واتساپ', icon: Video },
    { id: 'TEXT_CHAT', name: 'چت متنی', description: 'مشاوره از طریق چت متنی', icon: MessageSquare }
];

const pricingOptions = [
    { duration: 'MIN_30' as ConsultationDuration, name: '30 دقیقه', defaultPrice: 250000 },
    { duration: 'MIN_60' as ConsultationDuration, name: '1 ساعت', defaultPrice: 450000 },
    { duration: 'MIN_90' as ConsultationDuration, name: '1.5 ساعت', defaultPrice: 600000 },
    { duration: 'MIN_120' as ConsultationDuration, name: '2 ساعت و بیشتر', defaultPrice: 750000 }
];

export default function ConsultationPricingManager() {

    const { usePricings, useBulkCreatePricings } = usePricing();
    const { data: pricings = [], isLoading } = usePricings();
    const { mutate: bulkCreatePricings } = useBulkCreatePricings();

    // State برای 16 قیمت
    const [pricingData, setPricingData] = useState<{ [key: string]: number }>({});

    // State برای تخفیف‌ها
    const [globalPercentages, setGlobalPercentages] = useState({
        phone: 80,
        video: 90,
        textChat: 70
    });
    const [timeDiscount, setTimeDiscount] = useState(0);
    const [specialDiscount, setSpecialDiscount] = useState(0);

    // مقداردهی اولیه از API
    useEffect(() => {
        if (pricings.length > 0) {
            const initialData: { [key: string]: number } = {};
            pricings.forEach(pricing => {
                const key = `${pricing.duration}__${pricing.consultationType}`;
                initialData[key] = pricing.price;
            });
            setPricingData(initialData);
        }
    }, [pricings]);

    // Handle percentage changes
    const handlePercentageChange = (type: keyof typeof globalPercentages, value: number) => {
        const clampedValue = Math.min(100, Math.max(0, value));
        setGlobalPercentages(prev => ({
            ...prev,
            [type]: clampedValue
        }));
    };

    // Handle discount changes
    const handleTimeDiscountChange = (value: number) => {
        const clampedValue = Math.min(100, Math.max(0, value));
        setTimeDiscount(clampedValue);
    };

    const handleSpecialDiscountChange = (value: number) => {
        const clampedValue = Math.min(100, Math.max(1, value));
        setSpecialDiscount(clampedValue);
    };

    // Handle individual price changes
    const handlePriceChange = (duration: ConsultationDuration, type: ConsultationType, value: number) => {
        const key = `${duration}__${type}`;
        setPricingData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Apply global percentages and calculate prices
    const applyGlobalPercentages = () => {
        if (pricingData['MIN_30__IN_PERSON'] === undefined) {
            toast.error('لطفاً ابتدا قیمت نیم ساعت حضوری را تعیین کنید');
            return;
        }

        const newPrices: { [key: string]: number } = {};

        // محاسبه قیمت برای هر نوع مشاوره (نیم ساعت)
        consultationTypes.forEach(type => {
            const consultationType = type.id.toUpperCase() as ConsultationType;
            const key = `MIN_30__${consultationType}`;
            if (consultationType === 'IN_PERSON') {
                newPrices[key] = pricingData['MIN_30__IN_PERSON'] || 0;
            } else if (consultationType === 'PHONE') {
                newPrices[key] = Math.round((pricingData['MIN_30__IN_PERSON'] || 0) * globalPercentages.phone / 100);
            } else if (consultationType === 'VIDEO') {
                newPrices[key] = Math.round((pricingData['MIN_30__IN_PERSON'] || 0) * globalPercentages.video / 100);
            } else if (consultationType === 'TEXT_CHAT') {
                newPrices[key] = Math.round((pricingData['MIN_30__IN_PERSON'] || 0) * globalPercentages.textChat / 100);
            }
        });

        // محاسبه قیمت برای سایر مدت‌های زمانی
        pricingOptions.forEach(option => {
            if (option.duration !== 'MIN_30') {
                consultationTypes.forEach(type => {
                    const consultationType = type.id.toUpperCase() as ConsultationType;
                    const key = `${option.duration}__${consultationType}`;
                    const baseKey = `MIN_30__${consultationType}`;
                    const basePriceForType = newPrices[baseKey] || 0;

                    let multiplier = 1;
                    if (option.duration === 'MIN_60') multiplier = 2;
                    else if (option.duration === 'MIN_90') multiplier = 3;
                    else if (option.duration === 'MIN_120') multiplier = 4;

                    newPrices[key] = Math.round(basePriceForType * multiplier);
                });
            }
        });

        // اعمال تخفیف‌ها
        Object.keys(newPrices).forEach(key => {
            let finalPrice = newPrices[key];

            if (timeDiscount > 0) {
                finalPrice = Math.round(finalPrice * (100 - timeDiscount) / 100);
            }

            if (specialDiscount > 0) {
                finalPrice = Math.round(finalPrice * (100 - specialDiscount) / 100);
            }

            newPrices[key] = finalPrice;
        });

        setPricingData(newPrices);
        toast.success("قیمت ها با تخفیف‌ها محاسبه شد");
    };

    // Save all prices to server
    const saveAllPrices = () => {
        const requiredFields = 16;
        if (Object.keys(pricingData).length < requiredFields) {
            toast.error(`لطفاً تمامی ${requiredFields} قیمت‌ها را پر کنید`);
            return;
        }

        const pricingsToSave: CreatePricingDto[] = [];
        Object.entries(pricingData).forEach(([key, price]) => {
            const [duration, consultationType] = key.split('__');
            pricingsToSave.push({
                consultationType: consultationType as ConsultationType,
                duration: duration as ConsultationDuration,
                price: price,
                generalDiscount: specialDiscount > 0 ? specialDiscount : undefined,
                discountDescription: specialDiscount > 0 ? 'تخفیف مناسبتی' : undefined
            });
        });

        bulkCreatePricings(pricingsToSave, {
            onSuccess: () => {
                toast.success('قیمت‌ها با موفقیت ذخیره شدند');
            },
            onError: (error) => {
                toast.error('خطا در ذخیره قیمت‌ها');
                console.error('Error saving prices:', error);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-orange-500" />
                        قیمت گذاری سریع
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Base Price Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4" />
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <FloatingLabel
                                id="mobile"
                                label="قیمت پایه (نیم ساعت حضوری)"
                            >
                                <NumberInput
                                    value={pricingData['MIN_30__IN_PERSON']}
                                    onChange={(value) => handlePriceChange('MIN_30', 'IN_PERSON', value)}
                                    unit="تومان"
                                    className="w-32"
                                    maxLength={7}
                                />
                            </FloatingLabel>
                        </div>
                    </div>

                    {/* Percentage Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-medium mb-3 block">
                            نسبت قیمت سایر مشاوره ها نسبت به مشاوره حضوری
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-600 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    تلفنی
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={globalPercentages.phone}
                                        onChange={(e) => handlePercentageChange('phone', parseInt(e.target.value) || 0)}
                                        className="w-20"
                                        min="0"
                                        max="100"
                                    />
                                    <span className="text-xs">%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-600 flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    ویدئویی
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={globalPercentages.video}
                                        onChange={(e) => handlePercentageChange('video', parseInt(e.target.value) || 0)}
                                        className="w-20"
                                        min="0"
                                        max="100"
                                    />
                                    <span className="text-xs">%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-600 flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    چت متنی
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={globalPercentages.textChat}
                                        onChange={(e) => handlePercentageChange('textChat', parseInt(e.target.value) || 0)}
                                        className="w-20"
                                        min="0"
                                        max="100"
                                    />
                                    <span className="text-xs">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Discount Sections */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                تخفیف‌ها
                            </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    تخفیف زمانی بیش از نیم ساعت
                                </label>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gray-500"/>
                                    <Input
                                        type="number"
                                        value={timeDiscount}
                                        onChange={(e) => handleTimeDiscountChange(parseInt(e.target.value) || 0)}
                                        className="w-24"
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                    />
                                    <span className="text-xs">%</span>
                                    <span className="text-[10px]"> به ازای هر نیم ساعت رزو بیشتر</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-600 flex items-center gap-1">
                                    <Settings className="w-3 h-3" />
                                    تخفیف مناسبتی
                                </label>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                    <Input
                                        type="number"
                                        value={specialDiscount}
                                        onChange={(e) => handleSpecialDiscountChange(parseInt(e.target.value) || 0)}
                                        className="w-24"
                                        min="1"
                                        max="100"
                                        placeholder="0"
                                    />
                                    <span className="text-xs">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Apply Button */}
                    <div className="flex justify-center">
                        <Button onClick={applyGlobalPercentages} className="bg-orange-500 hover:bg-orange-600">
                            محاسبه قیمتها با تخفیف
                        </Button>
                    </div>
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="">
                            <p className="text-sm">
                                بعد از محاسبه قیمتها، اگر نیاز است می توانید قیمت ها را مستقلا تغییر داده و ذخیره کنید.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Pricing Grid */}
                    <div className="space-y-4">
                        {pricingOptions.map(option => {
                            const currentPricings = consultationTypes.map(type => {
                                const key = `${option.duration}__${type.id.toUpperCase()}`;
                                const price = pricingData[key] || 0;

                                return {
                                    type,
                                    price
                                };
                            });

                            return (
                                <div key={option.duration} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-gray-500" />
                                            <span className="font-medium">{option.name}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {currentPricings.map(({ type, price }) => (
                                            <div key={type.id} className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <type.icon className="w-4 h-4" />
                                                    {type.name}
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <FloatingLabel id="mobile" label="">
                                                        <NumberInput
                                                            value={price}
                                                            onChange={(value) => handlePriceChange(option.duration, type.id.toUpperCase() as ConsultationType, value)}
                                                            unit="تومان"
                                                            className="w-full"
                                                            maxLength={7}
                                                        />
                                                    </FloatingLabel>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={saveAllPrices}
                            className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            ذخیره تغییرات
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}