// app/lawyers/LawyersList.tsx - با فیلترهای آنلاین و ویژه اضافه شده

'use client';

import React, { useState, useMemo } from 'react';
import LawyerCard from '@/app/lawyers/LawyerCard';
import { Checkbox } from '@/components/radix/checkbox';
import {Wifi, Star, Search, Filter, Wine, BatteryWarning, BeanOff, Bean, Activity} from 'lucide-react';
import { Input } from '@/components/radix/input';
import { Button } from '@/components/radix/button';
import { toast } from '@/lib/hooks/app-toast';
import {LawyerSortBy, SortOrder} from "@/lib/data-transfer/data-types";

interface LawyersListProps {
    title?: string;
    lawyersData?: any; // نوع داده را از API دریافت می‌کند
    showSearch?: boolean;
    showOnlineFilter?: boolean;
    showVIPFilter?: boolean;
    filters?: any;
    sortBy?: LawyerSortBy;
    sortOrder?: SortOrder;
    onFiltersChange?: (filters: any) => void;
}

export default function LawyersList({
                                        title = "لیست وکلا",
                                        lawyersData,
                                        showSearch = false,
                                        showOnlineFilter = true,
                                        showVIPFilter = true,
                                        filters,
                                        sortBy = LawyerSortBy.RATING,
                                        sortOrder = SortOrder.DESC,
                                        onFiltersChange,
                                    }: LawyersListProps) {
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [showVIPOnly, setShowVIPOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // فقط داده‌های دریافتی را نمایش می‌دهد - هیچ fetching logic ندارد
    const lawyers = lawyersData?.items || [];
    // Calculate filtered lawyers based on search term and filters
    const filteredLawyers = useMemo(() => {
        let result = lawyers;


        // Apply search filter
        if (searchTerm) {
            result = result.filter(lawyer =>
                lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lawyer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lawyer.specialty.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply online filter
        if (showOnlineOnly) {
            result = result.filter(lawyer => lawyer.isOnline);
        }

        // Apply VIP filter
        if (showVIPOnly) {
            result = result.filter(lawyer => lawyer.isVIP);
        }

        return result;
    }, [lawyers, searchTerm, showOnlineOnly, showVIPOnly]);

    // Handle search
    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Handle online filter
    const handleOnlineFilter = () => {
        setShowOnlineOnly(!showOnlineOnly);
    };

    // Handle VIP filter
    const handleVIPFilter = () => {
        setShowVIPOnly(!showVIPOnly);
    };

    // Display loading state
    if (!lawyersData && !lawyersData?.items) {
        return (
            <div className="my-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
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
        );
    }

    return (
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

                <div className="flex items-center gap-4">


                    <div className="flex items-center gap-2">
                        {showOnlineFilter && (
                            <>
                                <Checkbox
                                    id="online-filter"
                                    checked={showOnlineOnly}
                                    onCheckedChange={(checked) => setShowOnlineOnly(checked as boolean)}
                                    className="data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700"
                                />
                                <label
                                    htmlFor="online-filter"
                                    className="flex ml-2 items-center gap-1 text-sm font-medium cursor-pointer text-gray-700 "
                                >
                                    <Wifi className="w-4 h-4 text-green-500 " />
                                    آنلاین‌ها
                                </label>
                            </>
                            )}

                        {showVIPFilter && (
                            <>
                                <Checkbox
                                    id="vip-filter"
                                    checked={showVIPOnly}
                                    onCheckedChange={(checked) => handleVIPFilter()}
                                    className="data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700"
                                />
                                <label
                                    htmlFor="vip-filter"
                                    className="flex items-center gap-1 text-sm font-medium cursor-pointer text-gray-700"
                                >
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    وکلای ویژه
                                </label>
                            </>
                            )}
                    </div>
                </div>
            </div>

            {/* Lawyers Grid */}
            {filteredLawyers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLawyers.map(lawyer => (
                        <LawyerCard key={lawyer.id} lawyer={lawyer} />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <Activity className="w-16 h-16 text-green-500 " />
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                        {showOnlineOnly ? "وکیل آنلاینی یافت نشد" :
                            showVIPOnly ? "وکیل ویژه‌ای یافت نشد" : "وکیلی یافت نشد"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {showOnlineOnly
                            ? "در حال حاضر هیچ وکیلی آنلاین نیست. لطفاً بعداً دوباره بررسی کنید یا فیلتر آنلاین را غیرفعال کنید."
                            : showVIPOnly
                                ? "در حال حاضر هیچ وکیل ویژه‌ای یافت نشد."
                                : searchTerm || Object.values(filters || {}).some(f => f && (Array.isArray(f) ? f.length > 0 : true))
                                    ? "با عبارت جستجوی دیگری دوباره تلاش کنید"
                                    : "با تغییر فیلترها دوباره تلاش کنید"
                        }
                    </p>
                    <div className="flex justify-center gap-3">
                        {showOnlineOnly && (
                            <button
                                onClick={() => setShowOnlineOnly(false)}
                                className="mt-4 px-4 py-2 bg-[#ca2a30] text-white rounded-md hover:bg-[#b02529] transition-colors"
                            >
                                نمایش همه وکلا
                            </button>
                        )}

                        {showVIPOnly && (
                            <button
                                onClick={() => setShowVIPOnly(false)}
                                className="mt-4 px-4 py-2 bg-[#ca2a30] text-white rounded-md hover:bg-[#b02529] transition-colors"
                            >
                                نمایش همه وکلا
                            </button>
                        )}

                        {(searchTerm || Object.values(filters || {}).some(f => f && (Array.isArray(f) ? f.length > 0 : true))) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    if (onFiltersChange) {
                                        onFiltersChange({
                                            province: '',
                                            city: '',
                                            specialty: undefined,
                                            skills: undefined,
                                            searchQuery: '',
                                            onlineOnly: false,
                                            includeVIP: false,
                                            consultationType: undefined,
                                            duration: undefined
                                        });
                                    }
                                }}
                                className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                حذف فیلترها
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}