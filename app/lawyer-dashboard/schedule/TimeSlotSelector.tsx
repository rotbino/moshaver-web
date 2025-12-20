// app/lawyer-dashboard/schedule/TimeSlotSelector.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { formatDate, getPersianDayName } from "@/lib/utils";
import { useTimeManagement } from "@/lib/data-transfer/api-hooks";

interface TimeSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

interface TimeSlotSelectorProps {
    timeSlots: TimeSlot[];
    onTimeSlotSelect: (timeSlot: TimeSlot) => void;
    selectedTimeSlot: TimeSlot | null;
    title?: string;
}

export default function TimeSlotSelector({
                                             timeSlots,
                                             onTimeSlotSelect,
                                             selectedTimeSlot,
                                             title = "انتخاب زمان مشاوره"
                                         }: TimeSlotSelectorProps) {
    // گروه‌بندی زمان‌ها بر اساس تاریخ
    const groupedTimeSlots = timeSlots.reduce((acc, slot) => {
        if (!acc[slot.date]) {
            acc[slot.date] = [];
        }
        acc[slot.date].push(slot);
        return acc;
    }, {} as Record<string, TimeSlot[]>);

    // استخراج تاریخ‌ها و مرتب‌سازی آن‌ها
    const dates = Object.keys(groupedTimeSlots).sort((a, b) => a.localeCompare(b));

    // حالت برای تاریخ انتخاب شده
    const [selectedDate, setSelectedDate] = useState<string>(dates.length > 0 ? dates[0] : '');
    const [isMounted, setIsMounted] = useState(false);

    // جلوگیری از خطای Hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // تعیین ایندکس فعلی بر اساس تاریخ انتخاب شده
    const activeIndex = dates.findIndex(date => date === selectedDate);

    const handleSlideChange = (swiper) => {
        const date = dates[swiper.realIndex];
        setSelectedDate(date);
    };

    // اگر هیچ زمانی وجود ندارد
    if (dates.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#ca2a30]" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>هیچ زمانی برای مشاوره ثبت نشده است</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // اگر کامپوننت هنوز mount نشده، چیزی نمایش نده
    if (!isMounted) {
        return (
            <div className="w-full h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ca2a30]"></div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#ca2a30]" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* اسلایدر روزها */}
                <div className="mb-6">
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={16}
                        slidesPerView="auto"
                        centeredSlides
                        onSlideChange={handleSlideChange}
                        initialSlide={activeIndex >= 0 ? activeIndex : 0}
                        className="w-full"
                    >
                        {dates.map((date) => (
                            <SwiperSlide key={date} className="max-w-[140px]">
                                <div
                                    onClick={() => setSelectedDate(date)}
                                    className={`p-4 rounded-lg text-center cursor-pointer transition-colors ${
                                        selectedDate === date
                                            ? "bg-[#ca2a30] text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    <div className="font-medium">
                                        {getPersianDayName(date)}
                                    </div>
                                    <div className="text-lg font-bold">
                                        {new Date(date).getDate()} {new Date(date).toLocaleDateString('fa-IR', { month: 'short' })}
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* نمایش ساعتهای روز انتخاب شده */}
                {selectedDate && (
                    <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {getPersianDayName(selectedDate)} - {formatDate(selectedDate)}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 gap-2">
                            {groupedTimeSlots[selectedDate]
                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                .map((slot) => (
                                    <button
                                        key={slot.id}
                                        onClick={() => onTimeSlotSelect(slot)}
                                        disabled={slot.isBooked}
                                        className={`p-4 border rounded-lg transition-colors text-center ${
                                            selectedTimeSlot?.id === slot.id
                                                ? "border-[#ca2a30] bg-[#fef2f2]"
                                                : slot.isBooked
                                                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            {selectedTimeSlot?.id === slot.id ? (
                                                <CheckCircle className="w-5 h-5 text-[#ca2a30] mb-1" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-gray-400 mb-1" />
                                            )}
                                            <div className="flex">
                                                <span className="text-sm font-medium">
                                                    {slot.startTime}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    - {slot.endTime}
                                                </span>
                                            </div>

                                            {slot.isBooked && (
                                                <Badge className="mt-1 bg-red-100 text-red-800 text-xs">
                                                    رزرو شده
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}