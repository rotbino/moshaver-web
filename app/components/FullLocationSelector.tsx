// components/profile/FullLocationSelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DropSelector } from '@/components/common/DropSelector';
import {IranProvinces} from "@/lib/local-data/Iran-provice";


interface FullLocationSelectorProps {
    provinceCode: string;
    cityCode: string;
    onProvinceChange: (code: string, label: string) => void;
    onCityChange: (code: string, label: string) => void;
    error?: string;
}

export function FullLocationSelector({
                                     provinceCode,
                                     cityCode,
                                     onProvinceChange,
                                     onCityChange,
                                     error,
                                 }: FullLocationSelectorProps) {
    const [cities, setCities] = useState<{ value: string; label: string }[]>([]);

    // تبدیل دیتای استان‌ها به فرمت DropSelector
    const provinceOptions = IranProvinces.map((p) => ({
        value: p.id,
        label: p.label,
    }));

    // پیدا کردن استان انتخاب شده
    const selectedProvince = IranProvinces.find(p => p.id === provinceCode);

    // به‌روزرسانی لیست شهرها وقتی استان تغییر می‌کند
    useEffect(() => {
        if (provinceCode) {
            const province = IranProvinces.find(p => p.id === provinceCode);
            const cityOptions = (province?.children || []).map((c) => ({
                value: c.id,
                label: c.label,
            }));
            setCities(cityOptions);
        } else {
            setCities([]);
        }
    }, [provinceCode]);

    const handleProvinceChange = (value: string) => {
        const province = IranProvinces.find(p => p.id === value);
        onProvinceChange(value, province?.label || '');
        // ریست کردن شهر
        if (cityCode) {
            onCityChange('', '');
        }
    };

    const handleCityChange = (value: string) => {
        const province = IranProvinces.find(p => p.id === provinceCode);
        const city = (province?.children || []).find(c => c.id === value);
        onCityChange(value, city?.label || '');
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {/* استان */}
                <DropSelector
                    label="استان"
                    value={provinceCode}
                    options={provinceOptions}
                    placeholder="انتخاب استان..."
                    onChange={(value) => handleProvinceChange(value)}
                    required={true}
                    error={error && !provinceCode ? error : ''}
                />

                {/* شهر */}
                <DropSelector
                    label="شهر"
                    value={cityCode}
                    options={cities}
                    placeholder={provinceCode ? "انتخاب شهر..." : "ابتدا استان را انتخاب کنید"}
                    onChange={(value) => handleCityChange(value)}
                    disabled={!provinceCode}
                    required={true}
                    error={error && provinceCode && !cityCode ? error : ''}
                />
            </div>
        </div>
    );
}