// app/lawyers/page.tsx - اصلاح شده برای استفاده از city به جای cities

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LawyersFilter,  } from '@/lib/data-transfer/types';
import { useLawyers } from '@/lib/data-transfer/api-hooks';
import LawyersList from "./LawyersList";
import FilterBar from "./FilterBar";
import SortDropdown from "./SortDropdown";
import DesktopNav from '@/app/home/DesktopNav';
import MobileNav from '@/app/home/MobileNav';
import MobileFooter from '@/app/home/MobileFooter';
import {Search} from "lucide-react";
import {
    LawyerSortBy,
    Skill,
    skillTitlesWithCategories,
    Specialty,
    SPECIALTY_NAMES
} from "@/lib/data-transfer/data-types";

export default function LawyersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for filters
    const [filters, setFilters] = useState<LawyersFilter>({
        page: 1,
        limit: 20,
        search: searchParams.get('search') as string || '',
        province: searchParams.get('province') as string || '',
        cities: searchParams.getAll('city') as string[] || [], // از 'city' استفاده می‌کنیم
        specialties: searchParams.get('specialties') ? searchParams.get('specialties')?.split(',') as string[] : [],
        skills: searchParams.get('skills') ? searchParams.get('skills')?.split(',') as string[] : [],
        services: searchParams.get('services') ? searchParams.get('services')?.split(',') as string[] : [],
        consultationTypes: searchParams.get('consultationTypes') ? searchParams.get('consultationTypes')?.split(',') as string[] : [],
        onlineOnly: searchParams.get('onlineOnly') === 'true',
        vipOnly: searchParams.get('vipOnly') === 'true',
        hasPricing: searchParams.get('hasPricing') === 'true',
        hasServices: searchParams.get('hasServices') === 'true',
        minExperience: searchParams.get('minExperience') ? parseInt(searchParams.get('minExperience') as string) : undefined,
        minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating') as string) : undefined,
        minReviews: searchParams.get('minReviews') ? parseInt(searchParams.get('minReviews') as string) : undefined,
        minSuccessfulCases: searchParams.get('minSuccessfulCases') ? parseInt(searchParams.get('minSuccessfulCases') as string) : undefined,
        minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice') as string) : undefined,
        maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice') as string) : undefined,
        sortBy: (searchParams.get('sortBy') as LawyerSortBy) || 'rating',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    });

    const [sortBy, setSortBy] = useState<LawyerSortBy>(filters.sortBy);
    const [sortOrder, setSortOrder] = useState<SortOrder>(filters.sortOrder);

    // Use the hook to fetch lawyers data
    const { data: lawyersData, isLoading, error, refetch } = useLawyers(filters, {
        enabled: true,
        staleTime: 0,
        cacheTime: 0,
    });

    // Update filters when search params change
    useEffect(() => {
        const newFilters: LawyersFilter = {
            page: 1,
            limit: 20,
            search: searchParams.get('search') as string || '',
            province: searchParams.get('province') as string || '',
            city: searchParams.get('city') as string || '', // از 'city' استفاده می‌کنیم
            cities: searchParams.getAll('city') as string[] || [], // از 'city' استفاده می‌کنیم
            specialties: searchParams.get('specialties') ? searchParams.get('specialties')?.split(',') as string[] : [],
            skills: searchParams.get('skills') ? searchParams.get('skills')?.split(',') as string[] : [],
            services: searchParams.get('services') ? searchParams.get('services')?.split(',') as string[] : [],
            consultationTypes: searchParams.get('consultationTypes') ? searchParams.get('consultationTypes')?.split(',') as string[] : [],
            onlineOnly: searchParams.get('onlineOnly') === 'true',
            vipOnly: searchParams.get('vipOnly') === 'true',
            hasPricing: searchParams.get('hasPricing') === 'true',
            hasServices: searchParams.get('hasServices') === 'true',
            minExperience: searchParams.get('minExperience') ? parseInt(searchParams.get('minExperience') as string) : undefined,
            minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating') as string) : undefined,
            minReviews: searchParams.get('minReviews') ? parseInt(searchParams.get('minReviews') as string) : undefined,
            minSuccessfulCases: searchParams.get('minSuccessfulCases') ? parseInt(searchParams.get('minSuccessfulCases') as string) : undefined,
            minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice') as string) : undefined,
            maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice') as string) : undefined,
            sortBy: (searchParams.get('sortBy') as LawyerSortBy) || 'rating',
            sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
        };

        if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
            setFilters(newFilters);
            setSortBy(newFilters.sortBy as LawyerSortBy);
            setSortOrder(newFilters.sortOrder as SortOrder);
        }
    }, [searchParams, filters]);

    // Handle filter changes
    const handleFiltersChange = (newFilters: LawyersFilter) => {
        setFilters(newFilters);

        // Update URL - از 'city' به جای 'cities' استفاده می‌کنیم
        const params = new URLSearchParams();

        if (newFilters.search) params.set('search', newFilters.search);
        if (newFilters.province) params.set('province', newFilters.province);
        if (newFilters.city) params.set('city', newFilters.city);
        if (newFilters.cities && newFilters.cities.length > 0) {
            newFilters.cities.forEach(city => params.append('city', city)); // از 'city' استفاده می‌کنیم
        }
        if (newFilters.specialties && newFilters.specialties.length > 0) {
            params.set('specialties', newFilters.specialties.join(','));
        }
        if (newFilters.skills && newFilters.skills.length > 0) {
            params.set('skills', newFilters.skills.join(','));
        }
        if (newFilters.services && newFilters.services.length > 0) {
            params.set('services', newFilters.services.join(','));
        }
        if (newFilters.consultationTypes && newFilters.consultationTypes.length > 0) {
            params.set('consultationTypes', newFilters.consultationTypes.join(','));
        }
        if (newFilters.onlineOnly) params.set('onlineOnly', 'true');
        if (newFilters.vipOnly) params.set('vipOnly', 'true');
        if (newFilters.hasPricing) params.set('hasPricing', 'true');
        if (newFilters.hasServices) params.set('hasServices', 'true');
        if (newFilters.minExperience) params.set('minExperience', newFilters.minExperience.toString());
        if (newFilters.minRating) params.set('minRating', newFilters.minRating.toString());
        if (newFilters.minReviews) params.set('minReviews', newFilters.minReviews.toString());
        if (newFilters.minSuccessfulCases) params.set('minSuccessfulCases', newFilters.minSuccessfulCases.toString());
        if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
        if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
        if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
        if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder);

        router.push(`/lawyers?${params.toString()}`);
    };

    // Handle sort change
    const handleSortChange = (newSortBy: LawyerSortBy) => {
        const newSortOrder = sortBy === newSortBy ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc';
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);

        const newFilters = {
            ...filters,
            sortBy: newSortBy,
            sortOrder: newSortOrder
        };

        handleFiltersChange(newFilters);
    };

    // Display loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-8">
                <DesktopNav
                    selectedProvince={filters.province}
                    selectedCity={filters.city}
                    onLocationChange={(province, city) => {
                        // این بخش باید با API وکلا هماهنگ شود
                    }}
                />

                {/* Mobile Navigation */}
                <MobileNav
                    selectedProvince={filters.province}
                    selectedCity={filters.city}
                    onLocationChange={(province, city) => {
                        // این بخش باید با API وکلا هماهنگ شود
                    }}
                />
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <div className="my-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">لیست وکلا</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="rounded-full bg-gray-200 h-16 w-16"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Display error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-8">
                <DesktopNav
                    selectedProvince={filters.province}
                    selectedCity={filters.city}
                    onLocationChange={(province, city) => {
                        // این بخش باید با API وکلا هماهنگ شود
                    }}
                />

                {/* Mobile Navigation */}
                <MobileNav
                    selectedProvince={filters.province}
                    selectedCity={filters.city}
                    onLocationChange={(province, city) => {
                        // این بخش باید با API وکلا هماهنگ شود
                    }}
                />
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <div className="my-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">لیست وکلا</h2>
                        </div>
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                            <div className="text-red-500 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm0 0a5.002 5.002 0 019.288 0M15 7v-2m0 2v2m0-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">خطا در بارگذاری</h3>
                            <p className="text-gray-600 mb-4">خطا در بارگذاری لیست وکلا. لطفاً صفحه را رفرش کنید.</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => refetch()}
                                    className="px-4 py-2 bg-[#ca2a30] text-white rounded-md hover:bg-[#b02529] transition-colors"
                                >
                                    تلاش مجدد
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    رفرش صفحه
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-8">
            {/* Desktop Navigation */}
            <DesktopNav
                selectedProvince={filters.province}
                selectedCity={filters.city}
                onLocationChange={(province, city) => {
                    // این بخش باید با API وکلا هماهنگ شود
                }}
            />

            {/* Mobile Navigation */}
            <MobileNav
                selectedProvince={filters.province}
                selectedCity={filters.city}
                onLocationChange={(province, city) => {
                    // این بخش باید با API وکلا هماهنگ شود
                }}
            />

            <div className="max-w-7xl mx-auto px-4 pt-6">
                {/* Mobile Search */}


                {/* Filter Bar */}
                <FilterBar
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                />

                <h2 className="text-sm font-bold text-gray-900 pb-6">
                    {filters.specialties && filters.specialties.length > 0
                        ? `وکلای ${filters.specialties.map(id => SPECIALTY_NAMES[id as Specialty] || id).join(' و ')}`
                        : 'لیست وکلا'}
                    {filters.skills && filters.skills.length > 0 &&
                        ` با مهارت ${filters.skills.map(id => skillTitlesWithCategories[id as Skill] || id).join(' و ')}`}
                    {filters.province && ` در ${filters.province}`}
                    {filters.city && (
                        Array.isArray(filters.city)
                            ? ` - ${filters.city.join(' و ')}`
                            : ` - ${filters.city}`
                    )}
                </h2>

                {/* Lawyers List */}
                <LawyersList
                    title=""
                    lawyersData={lawyersData}
                    showSearch={true}
                    showOnlineFilter={true}
                    filters={filters}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onFiltersChange={handleFiltersChange}
                />

                {/* Mobile Footer */}
                <MobileFooter/>
            </div>
        </div>
    );
}