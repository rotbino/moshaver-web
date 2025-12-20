// app/lawyers/LawyerCard.tsx - اصلاح شده

"use client";

import React from 'react';
import { Card, CardContent } from '@/components/radix/card';
import { Badge } from '@/components/radix/badge';
import { Button } from '@/components/radix/button';
import { Star, MapPin, Eye, Crown, Briefcase, FileQuestion, Wifi, WifiOff, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { LawyerListItem } from '@/lib/data-service/types';
import {getSmallFIlePath} from "@/lib/utils";
import {SPECIALTY_NAMES} from "@/lib/data-transfer/data-types";

interface LawyerCardProps {
    lawyer: LawyerListItem;
}

export default function LawyerCard({ lawyer }: LawyerCardProps) {
    // تابع برای بررسی اینکه آیا اشتراک وکیل منقضی شده است یا نه
    const isSubscriptionActive = lawyer.subscription ?
        new Date(lawyer.subscription.expiryDate) > new Date() : false;

    // تابع برای رندر کردن نوار تاج‌ها
    const renderCrownBar = () => {
        const steps = lawyer.subscription?.steps || 0;
        const totalCrowns = 5;

        return (
            <div className="flex gap-1 justify-between">
                <div className={"flex gap-1"}>
                    {Array.from({ length: totalCrowns }).map((_, index) => (
                        <Crown
                            key={index}
                            className={`w-4 h-4 ${
                                index < steps
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                            }`}
                        />
                    ))}
                </div>

                {/* نمایش نشان وکیل ویژه برای پلن یکساله */}
                {isSubscriptionActive && lawyer.subscription?.isVIP && (
                    <Badge className="bg-yellow-500 text-white text-xs font-medium py-0.5 px-2 rounded-full">
                        وکیل ویژه
                    </Badge>
                )}
            </div>
        );
    };

    return (
        <Card className="mb-4 overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex flex-col">
                {/* Crown bar at the top */}
                {isSubscriptionActive && (
                    <div className="px-2 pt-3 mb-1 p-3">
                        {renderCrownBar()}
                    </div>
                )}

                <div className="flex">
                    {/* Image section */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                        <Link href={`/${lawyer.username}`} >
                            <Image
                                src={getSmallFIlePath(lawyer.profileImage)}
                                alt={`${lawyer.fullName}`}
                                width={112}
                                height={112}
                                className="w-full h-full object-cover rounded m-2"
                            />
                        </Link>

                        {/* Online status indicator - added here */}
                        <div className="absolute top-1 right-1">
                            {lawyer.isOnline ? (
                                <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                                    <Wifi className="w-3 h-3 text-white" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-6 h-6 bg-gray-400 rounded-full">
                                    <WifiOff className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    <CardContent className="flex-1 p-4">
                        <div className="flex flex-col h-full">
                            {/* Header with name and specialty */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight">
                                        {lawyer.fullName}
                                    </h3>
                                </div>
                                <div className={"flex flex-col gap-1"}>
                                    {lawyer.specialties.map(s =>
                                        <Badge
                                            className="bg-red-100 text-red-800 text-xs font-medium py-1 px-2 rounded-md">
                                            {SPECIALTY_NAMES[s]}
                                        </Badge>
                                    )}
                                </div>


                                </div>

                                {/* Stats row */}
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current"/>
                                        <span className="text-sm font-medium">{lawyer.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-4 h-4 text-gray-500"/>
                                        <span className="text-sm font-medium">{lawyer.views.toLocaleString()}</span>
                                    </div>
                                </div>

                                {lawyer.questionPoints && lawyer.questionPoints > 0 && (
                                    <div className="flex items-center gap-1 mb-2">
                                        <FileQuestion className="w-4 h-4 text-gray-500"/>
                                        <span
                                            className="text-sm font-medium">{lawyer.questionPoints} پاسخ به سوال</span>
                                    </div>
                                )}

                                {/* Location and experience */}
                                <div className="flex items-center gap-4 mb-2 text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4"/>
                                        <span className="text-sm">{lawyer.city}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4"/>
                                        <span className="text-sm">{lawyer.experienceYears} سال</span>
                                    </div>
                                </div>
                            </div>
                    </CardContent>
                </div>

                {/* Fee and buttons */}
                <div className="px-4 flex items-center justify-between pt-3 border-t border-gray-200 my-2">
                    <div>
                        <span className="text-xs text-gray-500 block">هزینه مشاوره</span>
                        <span className="text-red-800 font-bold text-base">
                            {lawyer.price30InPerson?.toLocaleString() || '0'} تومان
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <Link href={`/${lawyer.username}`} className="block">
                            <Button size="sm"
                                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-1.5 px-4 rounded-lg transition-colors duration-300 shadow-sm">
                                مشاهده
                            </Button>
                        </Link>
                        <Link href={`/${lawyer.username}/consultation-options`} className="block">
                            <Button size="sm"
                                    className="bg-red-800 hover:bg-red-900 text-white font-medium py-1.5 px-4 rounded-lg transition-colors duration-300 shadow-sm flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                مشاوره
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Card>
    );
}