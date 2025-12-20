// app/vip-lawyers/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { Crown, Star, MapPin, Briefcase, Eye, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LawyerList } from '@/lib/api/types';
import { useLawyers } from "@/lib/api/useApi";

export default function VIPLawyersPage() {
    const { data: lawyers, isLoading, error } = useLawyers();

    // فیلتر وکلاهای وی آی پی
    const vipLawyers = lawyers?.filter(lawyer =>
        lawyer.isVIP &&
        lawyer.vipExpiryDate &&
        new Date(lawyer.vipExpiryDate) > new Date()
    ) || [];

    // مرتب‌سازی بر اساس رتبه
    const sortedVIPLawyers = [...vipLawyers].sort((a, b) => (b.rank || 0) - (a.rank || 0));

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca2a30] mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <div className="text-red-500 mb-4">
                            <Filter className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">خطا در بارگذاری</h3>
                        <p className="text-gray-600 mb-4">
                            خطا در بارگذاری لیست وکلا. لطفاً صفحه را رفرش کنید.
                        </p>
                        <Button onClick={() => window.location.reload()} className="bg-[#ca2a30] hover:bg-[#b02529]">
                            تلاش مجدد
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">وکلای ویژه</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        وکلای برتر و ویژه ما که با سابقه درخشان و تخصص بالا، خدمات حقوقی با کیفیت را ارائه می‌دهند
                    </p>
                </div>

                {/* VIP Lawyers Grid */}
                {sortedVIPLawyers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedVIPLawyers.map(lawyer => (
                            <Link key={lawyer.id} href={`/${lawyer.id}`}>
                                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-2 border-yellow-400 hover:border-yellow-500 h-full">
                                    <CardContent className="p-4">
                                        {/* Profile section */}
                                        <div className="flex flex-col items-center mb-3">
                                            <div className="relative mb-2">
                                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-400 shadow-md">
                                                    <Image
                                                        src={lawyer.profileImage}
                                                        alt={`${lawyer.name} ${lawyer.lastName}`}
                                                        width={100}
                                                        height={100}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {/* VIP Badge */}
                                                <div className="absolute -top-1 -right-1">
                                                    <Badge className="bg-yellow-500 text-white text-xs shadow-sm rounded-full px-2 flex items-center gap-1">
                                                        <Crown className="w-3 h-3" />
                                                        VIP
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Lawyer name */}
                                            <h3 className="font-bold text-lg text-gray-900 text-center">
                                                {lawyer.name} {lawyer.lastName}
                                            </h3>
                                        </div>

                                        {/* Lawyer info */}
                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 ml-2 flex-shrink-0" />
                                                <span>{lawyer.city}, {lawyer.province}</span>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-600">
                                                <Briefcase className="w-4 h-4 ml-2 flex-shrink-0" />
                                                <span>{lawyer.experience} سال سابقه</span>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-600">
                                                <Star className="w-4 h-4 ml-2 flex-shrink-0 text-yellow-500" />
                                                <span>امتیاز: {lawyer.rating}</span>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-600">
                                                <Crown className="w-4 h-4 ml-2 flex-shrink-0 text-yellow-500" />
                                                <span>رتبه: {lawyer.rank}</span>
                                            </div>
                                        </div>

                                        {/* Stats and fee */}
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Eye className="w-4 h-4 ml-1" />
                                                <span>{lawyer.views.toLocaleString()} بازدید</span>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {lawyer.consultationFee.toLocaleString()} تومان
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="text-gray-400 mb-4">
                                <Crown className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">هیچ وکیل ویژه‌ای فعلاً وجود ندارد</h3>
                            <p className="text-gray-600 mb-4">
                                به زودی وکلای ویژه به پلتفرم ما اضافه خواهند شد
                            </p>
                            <Link href="/">
                                <Button className="bg-[#ca2a30] hover:bg-[#b02529]">
                                    بازگشت به صفحه اصلی
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}