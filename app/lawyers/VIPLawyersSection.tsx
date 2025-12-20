// app/home/VIPLawyersSection.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { Crown, Star, MapPin, Briefcase, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LawyerList } from '@/lib/api/types';

interface VIPLawyersSectionProps {
    lawyers: LawyerList[];
}

export default function VIPLawyersSection({ lawyers }: VIPLawyersSectionProps) {
    // فیلتر وکلاهای وی آی پی
    const vipLawyers = lawyers.filter(lawyer =>
        lawyer.isVIP &&
        lawyer.vipExpiryDate &&
        new Date(lawyer.vipExpiryDate) > new Date()
    );

    // مرتب‌سازی بر اساس رتبه
    const sortedVIPLawyers = [...vipLawyers].sort((a, b) => (b.rank || 0) - (a.rank || 0));

    if (vipLawyers.length === 0) {
        return null;
    }

    return (
        <Card className="my-8 overflow-hidden border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    وکلای ویژه
                    <Badge className="bg-yellow-500 text-white">VIP</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedVIPLawyers.slice(0, 3).map(lawyer => (
                        <Link key={lawyer.id} href={`/${lawyer.id}`}>
                            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-yellow-200 hover:border-yellow-300 h-full">
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

                {/* View all VIP lawyers button */}
                <div className="text-center mt-4">
                    <Link href="/vip-lawyers">
                        <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-50">
                            مشاهده همه وکلای ویژه
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}