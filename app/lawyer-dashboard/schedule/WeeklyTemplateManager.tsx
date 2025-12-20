// src/app/lawyer-dashboard/schedule/WeeklyTemplateManager.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import {
    Calendar,
    Settings,
    CheckCircle,
    Circle,
    Edit,
    Save,
    Plus,
    Trash2,
    X,
    Check,
    Clock,
    AlertCircle
} from "lucide-react";
import { useTimeManagement } from "@/lib/data-transfer/api-hooks";
import { formatDate, getPersianDayName, getDayName } from "@/lib/utils";
import {
    ConsultationDuration,
    ConsultationType,
    TimeSlotStatus
} from "@/lib/data-transfer/data-types";
import WeeklyTemplateModal from "./WeeklyTemplateModal";
import TimeSlotManager from "@/app/lawyer-dashboard/schedule/TimeSlotManager";

interface WeeklyTemplateManagerProps {
    onTimeSlotsChange?: (timeSlots: any[]) => void;
    onTemplateApplied?: () => void; // Callback for when template is applied
}

export default function WeeklyTemplateManager({
                                                  onTimeSlotsChange,
                                                  onTemplateApplied
                                              }: WeeklyTemplateManagerProps) {
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showMinTypeMessage, setShowMinTypeMessage] = useState(false);

    // Time slots hook - using the hook that returns time slots
    const { useTimeSlots, useCreateTimeSlotsBatch } = useTimeManagement();
    // دریافت زمان‌های مشاوره
    const { data: timeSlotsResponse, isLoading, refetch } = useTimeSlots();

    const {
        useWeeklyTemplate,
        useSaveWeeklyTemplate,
        useApplyTemplateToRange,
        useCreateTimeSlot,
        useDeleteTimeSlot,
        useUpdateTimeSlot
    } = useTimeManagement();

    // mutations
    const saveWeeklyTemplateMutation = useSaveWeeklyTemplate();
    const applyTemplateMutation = useApplyTemplateToRange();
    const createTimeSlotMutation = useCreateTimeSlot();
    const deleteTimeSlotMutation = useDeleteTimeSlot();
    const updateTimeSlotMutation = useUpdateTimeSlot();

    // Fetch weekly template on mount
    const { data: weeklyTemplateBackend, isLoading: isTemplateFetching } = useWeeklyTemplate();

    // Show success message
    const showSuccess = (message: string) => {
        setShowSuccessMessage(message);
        setTimeout(() => setShowSuccessMessage(false), 5000);
    };

    // Show minimum type message
    const showMinTypeAlert = () => {
        setShowMinTypeMessage(true);
        setTimeout(() => setShowMinTypeAlert(false), 3000);
    };

    // Check if a date is holiday based on template
    const isHolidayFromTemplate = (dateString: string) => {
        const dayName = getDayName(dateString);
        return weeklyTemplateBackend?.template?.[dayName]?.isHoliday || false;
    };

    // Check if a date is manually overridden as non-holiday
    const isManuallyNonHoliday = (dateString: string) => {
        const timeSlots = timeSlotsResponse?.timeSlots || [];
        return timeSlots.some(slot => {
            const slotDateOnly = slot.date.split('T')[0];
            return slotDateOnly === dateString && slot.status === TimeSlotStatus.AVAILABLE;
        });
    };

    // Check if a date is holiday
    const isHoliday = (dateString: string) => {
        if (isManuallyNonHoliday(dateString)) {
            return false;
        }
        return isHolidayFromTemplate(dateString);
    };

    // Apply weekly template to next month
    const applyWeeklyTemplateToNextMonth = () => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 1);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30);

        applyTemplateMutation.mutate({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            overwrite: true
        }, {
            onSuccess: () => {
                showSuccess("قالب هفتگی به روزهای امروز تا 30 روز بعد اعمال شد");
                if (onTemplateApplied) {
                    onTemplateApplied();
                }
            }
        });
    };

    // Generate time slots (30-minute intervals from 8:00 to 22:00)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 22; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                slots.push({ hour, minute });
            }
        }
        return slots;
    };

    const timeSlotsList = generateTimeSlots();
    const isMutationLoading = saveWeeklyTemplateMutation.isPending ||
        applyTemplateMutation.isPending ||
        createTimeSlotMutation.isPending ||
        deleteTimeSlotMutation.isPending ||
        updateTimeSlotMutation.isPending;

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
            {/* Success Message */}
            {showSuccessMessage && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {showSuccessMessage}
                </div>
            )}

            {/* Minimum Type Alert */}
            {showMinTypeMessage && (
                <div className="fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <X className="w-5 h-5" />
                    حداقل یک نوع مشاوره باید انتخاب شود
                </div>
            )}

            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#ca2a30]" />
                        مدیریت قالب هفتگی ساعات کاری
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => setShowTemplateModal(true)}
                            variant="default"
                            className="flex items-center gap-2 bg-[#ca2a30] hover:bg-[#b02529]"
                        >
                            <Settings className="w-4 h-4" />
                            تنظیم قالب هفتگی
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Template Modal */}
            <WeeklyTemplateModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                onTemplateApplied={onTemplateApplied}
            />

            {/* نمایش توضیحات فقط زمانی که هنوز زمان‌های مشاوره‌ای ثبت نشده‌اند */}
            {filteredTimeSlots.length === 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 md:p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">تنظیم ساعات کاری</h3>
                            <p className="text-blue-700 mb-4 text-justify">
                                برای شروع، ابتدا قالب هفته کاری خود را تنظیم کنید. این قالب بصورت پیشفرض همه ساعات از 8 تا 10 شب را در برمی گیرد اما می توانید به دلخواه ویرایش کنید. بعد از تنظیم فقط با یک کلیک می
                                توانید آنرا به 30 روز آینده اعمال کنید.بعد از اعمال قالب، می توانید ساعات کاری را مستقل از قالب هم
                                ویرایش کنید.
                            </p>
                            <p className="text-blue-700 mb-4">
                                زمان کاری در ساعتهای دلخواه شما به بازه های نیم ساعته تقسیم می شود تا کاربران بتوانند هر
                                تعداد اسلات نیم ساعته از نیم تا چند ساعت که برای مشاوره نیاز دارند رزرو کنند.
                            </p>
                            <p className="text-blue-700 mb-4">
                                مشاوره ها به دلخواه شما بصورت حضوری، تلفنی، تصویری، متنی می باشند که در هر اسلات شما می
                                توانید انواع مشاوره ای که در آن ساعت قبول می کنید را مشخص کنید.
                            </p>
                            <p className="text-blue-700 mb-4">
                                هیچ محدودیتی برای ساعات مشاوره وجود ندارد چه ساعت 6 صبح باشد چه 12 شب و ساعت و روزی که بخواهید می توانید ساعت و روز تعطیل برای خود در نظر بگیرید.
                            </p>

                        </div>
                    </div>
                </div>
            )}

            {/* نمایش زمان‌های مشاوره فقط زمانی که وجود دارند */}
            {filteredTimeSlots.length > 0 && (
                <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-800">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">نکته:</span>
                            <span>اکنون می‌توانید زمان‌های مشاوره خود را برای روزهای خاص ویرایش یا حذف کنید.</span>
                        </div>
                    </div>
                    <TimeSlotManager  />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-[#ca2a30]">
                                {weeklyTemplateBackend ? 'تکمیل شده' : 'نامشخص'}
                            </div>
                            <div className="text-sm text-gray-600">وضعیت قالب هفتگی</div>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {Object.values(weeklyTemplateBackend?.template || {}).filter((day: any) => !day.isHoliday).length}
                            </div>
                            <div className="text-sm text-gray-600">روزهای کاری در هفته</div>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {Object.values(weeklyTemplateBackend?.template || {}).filter((day: any) => day.isHoliday).length}
                            </div>
                            <div className="text-sm text-gray-600">روزهای تعطیل در هفته</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}