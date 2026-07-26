// app/admin/ads/components/LocationFilter.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DropSelector } from '@/components/common/DropSelector';
import { apiService } from '@/lib/api/apiService';

interface LocationFilterProps {
    armSlug?: string;
    onLocationChange: (countryCode?: string, provinceCode?: string, city?: string) => void;
    onClear: () => void;
    hasFilter: boolean;
}

interface LocationOption {
    id: string;
    title: string;
    provinceCode?: string;
    cityCode?: string;
    children?: LocationOption[];
}

export function LocationFilter({ armSlug, onLocationChange }: LocationFilterProps) {
    const [allCountries, setAllCountries] = useState<any[]>([]);
    const [allProvinces, setAllProvinces] = useState<any[]>([]);
    const [allCities, setAllCities] = useState<any[]>([]);
    const [armTree, setArmTree] = useState<LocationOption[]>([]);

    const [countryId, setCountryId] = useState('');
    const [provinceId, setProvinceId] = useState('');
    const [cityId, setCityId] = useState('');

    // کشورها
    useEffect(() => {
        apiService.admin.locations.getCountries().then(d => {
            setAllCountries(d || []);
            const ir = d?.find((c: any) => c.countryCode === 'IR');
            if (ir && !armSlug) setCountryId(ir.id);
        }).catch(() => {});
    }, []);

    // درخت بازو
    useEffect(() => {
        if (!armSlug) { setArmTree([]); return; }
        apiService.admin.ads.getLocations(armSlug).then(data => {
            setArmTree(data || []);
        }).catch(() => setArmTree([]));
    }, [armSlug]);

    // استان‌ها (غیر بازو)
    useEffect(() => {
        if (armSlug || !countryId) return;
        apiService.admin.locations.getChildren(countryId).then(d => setAllProvinces(d || [])).catch(() => {});
    }, [countryId, armSlug]);

    // شهرها (غیر بازو)
    useEffect(() => {
        if (armSlug || !provinceId) return;
        apiService.admin.locations.getChildren(provinceId).then(d => setAllCities(d || [])).catch(() => {});
    }, [provinceId, armSlug]);

    // handler ها
    const handleCountry = (v: string) => {
        setCountryId(v);
        setProvinceId('');
        setCityId('');
        const c = allCountries.find(x => x.id === v);
        onLocationChange(c?.countryCode, undefined, undefined);
    };

    const handleProvince = (v: string) => {
        setProvinceId(v);
        setCityId('');
        if (armTree.length) {
            const p = armTree.find(x => x.id === v);
            onLocationChange('IR', p?.provinceCode, undefined);
        } else {
            const p = allProvinces.find(x => x.id === v);
            onLocationChange(undefined, p?.provinceCode, undefined);
        }
    };

    const handleCity = (v: string) => {
        setCityId(v);
        if (armTree.length) {
            const province = armTree.find(x => x.id === provinceId);
            const city = province?.children?.find(x => x.id === v);
            onLocationChange('IR', province?.provinceCode, city?.title);
        } else {
            const p = allProvinces.find(x => x.id === provinceId);
            const c = allCities.find(x => x.id === v);
            onLocationChange(undefined, p?.provinceCode, c?.title);
        }
    };

    // آپشن‌ها
    const countries = allCountries.map(c => ({ value: c.id, label: c.title }));
    const provinces = armTree.length
        ? armTree.map(p => ({ value: p.id, label: p.title }))
        : allProvinces.map(p => ({ value: p.id, label: p.title }));
    const cities = armTree.length && provinceId
        ? (armTree.find(x => x.id === provinceId)?.children || []).map(c => ({ value: c.id, label: c.title }))
        : allCities.map(c => ({ value: c.id, label: c.title }));

    const showCountry = !armSlug;
    const showProvince = armSlug ? armTree.length > 0 : !!countryId;
    const showCity = !!provinceId;

    return (
        <div className="flex items-center gap-1.5 flex-shrink-0">
            {showCountry && (
                <div className="w-24">
                    <DropSelector value={countryId} options={countries} placeholder="کشور" onChange={handleCountry} className="h-8 text-xs !rounded-lg" />
                </div>
            )}
            {showProvince && (
                <div className="w-32">
                    <DropSelector value={provinceId} options={provinces} placeholder="استان" onChange={handleProvince} className="h-8 text-xs !rounded-lg" />
                </div>
            )}
            {showCity && (
                <div className="w-32">
                    <DropSelector value={cityId} options={cities} placeholder="شهر" onChange={handleCity} className="h-8 text-xs !rounded-lg" />
                </div>
            )}
        </div>
    );
}