// src/app/lawyer-dashboard/schedule/TimeSlotManager.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import {
    Calendar,
    Clock,
    Settings,
    CheckCircle,
    Circle,
    Edit,
    Save,
    Plus,
    Trash2,
    X,
    Check
} from "lucide-react";
import { useTimeManagement } from "@/lib/data-transfer/api-hooks";
import { formatDate, getPersianDayName, getDayName } from "@/lib/utils";
import {
    ConsultationDuration,
    ConsultationType,
    TimeSlotStatus
} from "@/lib/data-transfer/data-types";
import WeeklyTemplateModal from "./WeeklyTemplateModal";
import { toast } from '@/lib/hooks/app-toast';
import moment from 'moment-jalaali';

interface TimeSlot {
    id: string;
    accountId: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: ConsultationDuration;
    allowedTypes: ConsultationType[];
    status: TimeSlotStatus;
    reservedUntil?: string;
    reservedBy?: string;
    createdAt: string;
    updatedAt: string;
}

interface TimeSlotManagerProps {
    onTimeSlotsChange?: (timeSlots: TimeSlot[]) => void;
    initialTimeSlots?: TimeSlot[];
    timeSlots?: TimeSlot[];
    isLoading?: boolean;
}

export default function TimeSlotManager({
                                            onTimeSlotsChange,
                                            initialTimeSlots = [],
                                            timeSlots = [],
                                            isLoading = false
                                        }: TimeSlotManagerProps) {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'weekly-template' | 'this-week'>('this-week');
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // Time slots hook - using the hook that returns time slots
    const { useTimeSlots, useCreateTimeSlotsBatch } = useTimeManagement();
    // دریافت زمان‌های مشاوره
    const { data: timeSlotsResponse, isLoading: apiLoading, refetch } = useTimeSlots();

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

    // Show success message using toast
    const showSuccess = (message: string) => {
        toast.success(message);
    };

    // Show minimum type message using toast
    const showMinTypeAlert = () => {
        toast.error("حداقل یک نوع مشاوره باید انتخاب شود");
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

    // Toggle time slot (creates or deletes 30-min slots)
    const toggleTimeSlot = async (hour: number, minute: number) => {
        if (!selectedDate) return;

        const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slot = timeSlots.find(slot => {
            const slotDateOnly = slot.date.split('T')[0];
            return slotDateOnly === selectedDate &&
                slot.startTime === timeKey;
        });

        if (slot) {
            // Delete the time slot
            try {
                await deleteTimeSlotMutation.mutateAsync(slot.id);
                refetch();
            } catch (error) {
                console.error('Error deleting time slot:', error);
            }
        } else {
            // Create a new time slot with correct end time
            const endTime = calculateEndTime(hour, minute);
            const newSlot = {
                date: `${selectedDate}T00:00:00.000Z`,
                startTime: timeKey,
                endTime: endTime,
                duration: ConsultationDuration.MIN_30,
                allowedTypes: [ConsultationType.IN_PERSON, ConsultationType.VIDEO, ConsultationType.PHONE, ConsultationType.TEXT_CHAT]
            };

            try {
                await createTimeSlotMutation.mutateAsync(newSlot);
                refetch();
            } catch (error) {
                console.error('Error creating time slot:', error);
            }
        }
    };

    // Calculate correct end time (handles hour rollover)
    const calculateEndTime = (startHour: number, startMinute: number): string => {
        const totalMinutes = startHour * 60 + startMinute + 30; // Add 30 minutes
        const endHour = Math.floor(totalMinutes / 60);
        const endMinute = totalMinutes % 60;

        return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    };

    // Update consultation types for a specific time slot
    const updateSlotAllowedTypes = async (hour: number, minute: number, types: ConsultationType[]) => {
        if (!selectedDate) return;

        // Ensure at least one type is selected
        if (types.length === 0) {
            showMinTypeAlert();
            return;
        }

        const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slot = timeSlots.find(slot => {
            const slotDateOnly = slot.date.split('T')[0];
            return slotDateOnly === selectedDate &&
                slot.startTime === timeKey;
        });

        if (slot) {
            // Update existing slot
            try {
                await updateTimeSlotMutation.mutateAsync({
                    timeSlotId: slot.id,
                    data: {
                        allowedTypes: types
                    }
                });
                refetch();
            } catch (error) {
                console.error('Error updating time slot:', error);
            }
        }
    };

    // Get consultation types for a specific time slot
    const getSlotAllowedTypes = (hour: number, minute: number) => {
        if (!selectedDate) return [];
        const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // 1. ابتدا در timeSlots جستجو می‌کنیم
        const slot = timeSlots.find(slot => {
            const slotDateOnly = slot.date.split('T')[0];
            return slotDateOnly === selectedDate &&
                slot.startTime === timeKey;
        });

        if (slot) {
            return slot.allowedTypes;
        }

        // 2. اگر در timeSlots پیدا نشد، به قالب هفتگی نگاه می‌کنیم
        const templateDay = weeklyTemplateBackend?.template?.[getDayName(selectedDate)];
        if (templateDay && templateDay.hours) {
            const templateSlot = templateDay.hours.find(slot => slot.startTime === timeKey);
            if (templateSlot) {
                return templateSlot.allowedTypes;
            }
        }

        // 3. در نهایت به صورت پیش‌فرض
        return [ConsultationType.IN_PERSON, ConsultationType.VIDEO, ConsultationType.PHONE, ConsultationType.TEXT_CHAT];
    };

    // Check if a time slot exists for the selected date
    const isTimeSlotAvailable = (timeKey: string) => {
        if (!selectedDate) return false;
        const selectedDateOnly = selectedDate.split('T')[0];
        return timeSlots.some(slot => {
            const slotDateOnly = slot.date.split('T')[0];
            return slotDateOnly === selectedDateOnly &&
                slot.startTime === timeKey;
        });
    };

    // Check if a time slot is disabled (exists in template but not in user's slots)
    const isTimeSlotDisabled = (timeKey: string) => {
        if (!selectedDate) return false;
        const selectedDateOnly = selectedDate.split('T')[0];

        // Check if slot exists in template
        const templateDay = weeklyTemplateBackend?.template?.[getDayName(selectedDate)];
        if (!templateDay || !templateDay.hours) return false;

        const templateSlot = templateDay.hours.find(slot => slot.startTime === timeKey);
        if (!templateSlot) return false;

        // Check if slot doesn't exist in user's slots
        return !timeSlots.some(slot => {
            const slotDateOnly = slot.date.split('T')[0];
            return slotDateOnly === selectedDateOnly &&
                slot.startTime === timeKey;
        });
    };

    // Delete a specific time slot
    const deleteTimeSlot = async (slotId: string) => {
        try {
            await deleteTimeSlotMutation.mutateAsync(slotId);
            refetch();
        } catch (error) {
            console.error('Error deleting time slot:', error);
        }
    };

    // Toggle holiday status for a specific date
    const toggleDateHolidayStatus = async (dateString: string) => {
        if (isHolidayFromTemplate(dateString)) {
            const dayName = getDayName(dateString);
            const templateDay = weeklyTemplateBackend?.template?.[dayName];

            if (templateDay && !templateDay.isHoliday) {
                // Delete all existing slots for this date
                const slotsToDelete = timeSlots.filter(slot => {
                    const slotDateOnly = slot.date.split('T')[0];
                    return slotDateOnly === dateString;
                });

                try {
                    await Promise.all(
                        slotsToDelete.map(slot => deleteTimeSlotMutation.mutateAsync(slot.id))
                    );

                    // Create new slots based on template
                    const newSlots = await Promise.all(
                        templateDay.hours.map(slot =>
                            createTimeSlotMutation.mutateAsync({
                                date: `${dateString}T00:00:00.000Z`,
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                                duration: slot.duration,
                                allowedTypes: slot.allowedTypes
                            })
                        )
                    );

                    refetch();
                } catch (error) {
                    console.error('Error toggling date holiday status:', error);
                }
            }
        } else {
            // Delete all slots to make it a holiday
            const slotsToDelete = timeSlots.filter(slot => {
                const slotDateOnly = slot.date.split('T')[0];
                return slotDateOnly === dateString;
            });

            try {
                await Promise.all(
                    slotsToDelete.map(slot => deleteTimeSlotMutation.mutateAsync(slot.id))
                );

                refetch();
            } catch (error) {
                console.error('Error toggling date holiday status:', error);
            }
        }
    };



    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 23; hour++) {  // Changed from 24 to 23
            for (let minute = 0; minute < 60; minute += 30) {
                slots.push({ hour, minute });
            }
        }
        // Add the last slot (23:30)
        slots.push({ hour: 23, minute: 0 });
        return slots;
    };

    // Format time for display (handles hour rollover)
    const formatTimeForDisplay = (hour: number, minute: number) => {
        const totalMinutes = hour * 60 + minute;
        const endHour = Math.floor((totalMinutes + 30) / 60); // Add 30 minutes and calculate end hour
        const endMinute = (totalMinutes + 30) % 60; // Calculate end minute

        return {
            start: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            end: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
        };
    };

    const timeSlotsList = generateTimeSlots();
    const isMutationLoading = saveWeeklyTemplateMutation.isPending ||
        applyTemplateMutation.isPending ||
        createTimeSlotMutation.isPending ||
        deleteTimeSlotMutation.isPending ||
        updateTimeSlotMutation.isPending;


    // Initialize next 7 days from today - با ترتیب صحیح و زمان ایران
    useEffect(() => {
        // ایجاد تاریخ فعلی با توجه به زمان محلی ایران
        const now = new Date();

        // اضافه کردن 3.5 ساعت برای تبدیل به زمان ایران (GMT+3:30)
        const iranTime = new Date(now.getTime() + (3.5 * 60 * 60 * 1000));

        const days = [];

        // 7 روز آینده از امروز را اضافه می‌کنیم
        for (let i = 0; i < 30; i++) {
            const date = new Date(iranTime);
            date.setDate(iranTime.getDate() + i);
            days.push(date.toISOString().split('T')[0]);
        }

        setNext7Days(days);
        if (days.length > 0) {
            setSelectedDate(days[0]); // پیش‌فرض روی امروز تنظیم می‌شود
        }
    }, []);

    const [next7Days, setNext7Days] = useState<string[]>([]);



    const handleTimeSlotsChange = (newTimeSlots: TimeSlot[]) => {
        if (onTimeSlotsChange) {
            onTimeSlotsChange(newTimeSlots);
        }
    };

    // تابع برای تبدیل تاریخ میلادی به شمسی و نمایش formatted
    const getPersianFormattedDate = (dateString: string) => {
        const date = new Date(dateString);
        const jDate = moment(date).format('jYYYY/jMM/jDD');
        const parts = jDate.split('/');
        const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

        return {
            day: parseInt(parts[2]),
            month: months[parseInt(parts[1]) - 1],
            fullDate: dateString
        };
    };

    return (
        <div className="space-y-6">
            {/* Tab Content */}
            {activeTab === 'this-week' && (
                <div className="space-y-6">
                    {/* Check if there are any time slots */}
                    {timeSlots.length > 0 ? (
                        <>
                            {/* Date Selector */}
                            <Card>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-center">
                                            <div className="text-lg font-bold">
                                                {selectedDate && getPersianDayName(selectedDate)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {selectedDate && formatDate(selectedDate)}
                                            </div>

                                            {isHoliday(selectedDate) && (
                                                <Badge className="mt-2 bg-red-100 text-red-800">
                                                    روز تعطیل
                                                </Badge>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => setShowTemplateModal(true)}
                                            variant="outline"
                                            className="flex items-center gap-2"
                                            disabled={isTemplateFetching}
                                        >
                                            <Settings className="w-4 h-4"/>
                                            تنظیمات قالب هفتگی
                                        </Button>
                                    </div>

                                    <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                                        {next7Days.map((date, index) => {
                                            const persianDate = getPersianFormattedDate(date);
                                            const today = new Date();
                                            const currentDate = new Date(date);
                                            const isToday = today.toDateString() === currentDate.toDateString();
                                            const isTomorrow = new Date(today);
                                            isTomorrow.setDate(today.getDate() + 1);
                                            const isTomorrowDate = isTomorrow.toDateString() === currentDate.toDateString();

                                            let buttonClass = `flex-shrink-0 px-4 py-3 rounded-lg text-center min-w-[120px] `;

                                            if (selectedDate === date) {
                                                buttonClass += "bg-[#ca2a30] text-white";
                                            } else if (isHoliday(date)) {
                                                buttonClass += "bg-red-100 text-red-800";
                                            } else if (isToday) {
                                                buttonClass += "bg-green-100 text-green-800 border-2 border-green-400"; // استایل سبز برای امروز
                                            } else {
                                                buttonClass += "bg-gray-100 text-gray-700 hover:bg-gray-200";
                                            }

                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={buttonClass}
                                                >
                                                    <div className="font-medium">
                                                        {getPersianDayName(date)}
                                                    </div>
                                                    <div className="text-sm">
                                                        {isToday ? `امروز: ${persianDate.day} ${persianDate.month}` :
                                                            `${persianDate.day} ${persianDate.month}`}
                                                    </div>
                                                    {isHoliday(date) && (
                                                        <div className="text-xs mt-1">تعطیل</div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Time Slots Grid */}
                            {selectedDate && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-[#ca2a30]"/>
                                                ساعات مشاوره - {getPersianDayName(selectedDate)}
                                            </CardTitle>
                                            {isHolidayFromTemplate(selectedDate) && (
                                                <Button
                                                    onClick={() => toggleDateHolidayStatus(selectedDate)}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isMutationLoading}
                                                    className="text-[#ca2a30] border-[#ca2a30] hover:bg-[#fef2f2]"
                                                >
                                                    {isManuallyNonHoliday(selectedDate) ? "تبدیل به روز تعطیل" : "تبدیل به روز مشاوره"}
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                    {!isHoliday(selectedDate) ? (
                                            <>
                                                <div
                                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                                    {timeSlotsList.map(({ hour, minute }) => {
                                                        const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                                        const isAvailable = isTimeSlotAvailable(timeKey);
                                                        const isDisabled = isTimeSlotDisabled(timeKey);
                                                        const currentTypes = getSlotAllowedTypes(hour, minute);

                                                        // Format time correctly with hour rollover
                                                        const timeRange = formatTimeForDisplay(hour, minute);
                                                        const timeRangeDisplay = `${timeRange.start} - ${timeRange.end}`;

                                                        return (
                                                            <div key={`${hour}-${minute}`} className="relative">
                                                                <div
                                                                    className={`w-full p-3 border rounded-lg transition-colors text-center ${
                                                                        isAvailable
                                                                            ? "bg-green-50 border-green-200"
                                                                            : isDisabled
                                                                                ? "bg-gray-50 border-gray-200 opacity-50"
                                                                                : "bg-gray-50 border-gray-200"
                                                                    }`}
                                                                >
                                                                    <button
                                                                        onClick={() => toggleTimeSlot(hour, minute)}
                                                                        disabled={isMutationLoading || isDisabled}
                                                                        className={`w-full flex items-center justify-between gap-3 py-2 px-4 mb-2 rounded-lg border-2 transition-colors ${
                                                                            isAvailable
                                                                                ? 'bg-green-600 text-white border-green-600'
                                                                                : isDisabled
                                                                                    ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                                                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className="w-5 h-5 border-2 border-current rounded flex items-center justify-center">
                                                                                {isAvailable && <Check className="w-3 h-3 text-current"/>}
                                                                            </div>
                                                                        </div>
                                                                        <span
                                                                            className="text-sm font-medium flex-1 text-center">
                                                                            {timeRangeDisplay}
                                                                        </span>
                                                                        <div className="w-5"></div>
                                                                        {/* Spacer for alignment */}
                                                                    </button>
                                                                    {/* Consultation types checkboxes below */}
                                                                    {isAvailable && (
                                                                        <div className="flex flex-wrap gap-2 pt-3">
                                                                            {Object.values(ConsultationType).map(type => (
                                                                                <label
                                                                                    key={type}
                                                                                    className="flex items-center gap-1 cursor-pointer pr-2"
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={currentTypes.includes(type)}
                                                                                        onChange={(e) => {
                                                                                            e.stopPropagation();
                                                                                            const newTypes = e.target.checked
                                                                                                ? [...currentTypes, type]
                                                                                                : currentTypes.filter(t => t !== type);
                                                                                            updateSlotAllowedTypes(hour, minute, newTypes);
                                                                                        }}
                                                                                        className="w-4 h-4 text-[#ca2a30] rounded focus:ring-[#ca2a30]"
                                                                                    />
                                                                                    <span className="text-xs">
                                                                                        {type === ConsultationType.IN_PERSON ? 'حضوری' :
                                                                                            type === ConsultationType.PHONE ? 'تلفنی' :
                                                                                                type === ConsultationType.VIDEO ? 'تصویری' : 'متنی'}
                                                                                    </span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                                                <p className="text-gray-500 mb-4">این روز تعطیل است</p>
                                                {isHolidayFromTemplate(selectedDate) && (
                                                    <Button
                                                        onClick={() => toggleDateHolidayStatus(selectedDate)}
                                                        disabled={isMutationLoading}
                                                        className="bg-[#ca2a30] hover:bg-[#b02529]"
                                                    >
                                                        تبدیل به روز مشاوره
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : (
                        // Show empty state when no time slots exist
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">هنوز زمان مشاوره‌ای ثبت نکرده‌اید</h3>
                            <p className="text-gray-500 mb-6">برای شروع، لطفاً قالب هفتگی خود را تنظیم کنید تا ساعات کاری خود را تعریف نمایید.</p>
                            <Button
                                onClick={() => setShowTemplateModal(true)}
                                className="bg-[#ca2a30] hover:bg-[#b02529]"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                تنظیم قالب هفتگی
                            </Button>
                        </div>
                    )}

                    {/* Weekly Template Modal */}
                    <WeeklyTemplateModal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} />

                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>خلاصه زمان‌های مشاوره</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-[#ca2a30]">
                                        {timeSlots.length}
                                    </div>
                                    <div className="text-sm text-gray-600">کل زمان‌های ثبت شده (از امروز به بعد)</div>
                                </div>

                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {timeSlots.filter(slot => slot.status === TimeSlotStatus.AVAILABLE).length}
                                    </div>
                                    <div className="text-sm text-gray-600">زمان‌های آزاد</div>
                                </div>

                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">
                                        {Object.values(weeklyTemplateBackend?.template || {}).filter((day: any) => day.isHoliday).length}
                                    </div>
                                    <div className="text-sm text-gray-600">روزهای تعطیل در هفته</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}