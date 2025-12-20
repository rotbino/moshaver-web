// src/app/lawyer-dashboard/schedule/page.tsx

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Calendar, Clock, Settings, CheckCircle, Users, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/data-transfer/api-hooks";
import { useTimeManagement } from "@/lib/data-transfer/api-hooks";
import { Button } from '@/components/radix/button';
import WeeklyTemplateManager from "./WeeklyTemplateManager";
import TimeSlotManager from "@/app/lawyer-dashboard/schedule/TimeSlotManager";

interface TimeSlot {
    id: string;
    accountId: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    allowedTypes: string[];
    status: string;
    reservedUntil?: string;
    reservedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export default function SchedulePage() {
    const { useCurrentUser } = useAuth();
    const currentUser = useCurrentUser();
    const { useTimeSlots, useCreateTimeSlotsBatch } = useTimeManagement();
    // دریافت زمان‌های مشاوره
    const { data: timeSlotsResponse, isLoading, refetch } = useTimeSlots();

    // mutation برای ذخیره زمان‌ها
    const createTimeSlotsBatchMutation = useCreateTimeSlotsBatch();

    const handleRefresh = () => {
        refetch();
    };

    const handleTimeSlotsChange = async (newTimeSlots: TimeSlot[]) => {
        try {
            await createTimeSlotsBatchMutation.mutateAsync(newTimeSlots);
            refetch();
        } catch (error) {
            console.error('Error saving time slots:', error);
        }
    };

    // اگر کاربر احراز هویت نشده باشد
    if (!currentUser || currentUser.role !== "LAWYER") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    // اطمینان از اینکه timeSlotsResponse وجود دارد و timeSlots یک آرایه است
    const timeSlots = timeSlotsResponse?.timeSlots || [];

    // فیلتر کردن زمان‌های مشاوره برای نمایش فقط از امروز به بعد
    const filteredTimeSlots = timeSlots.filter(slot => {
        const slotDate = new Date(slot.date.split('T')[0]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return slotDate >= today;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            {/*<Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#ca2a30]" />
                        مدیریت زمان‌های مشاوره
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="bg-orange-600 hover:bg-[#b02529]"
                        >
                            رفرش زمان‌ها
                        </Button>
                    </div>
                </CardContent>
            </Card>*/}




            {/* نمایش زمان‌های مشاوره فقط وقتی وجود دارند */}
            {filteredTimeSlots.length > 0 ? (
                    <TimeSlotManager
                        onTimeSlotsChange={handleTimeSlotsChange}
                        timeSlots={filteredTimeSlots}
                    />
            ) : (
              <WeeklyTemplateManager />
            )}
        </div>
    );
}