// src/app/lawyer-dashboard/schedule/WeeklyTemplateModal.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/radix/dialog";
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
    Check, ChevronDown, CalendarCheck2, CalendarX2
} from "lucide-react";
import { useTimeManagement } from "@/lib/data-transfer/api-hooks";
import { formatDate, getPersianDayName, getDayName } from "@/lib/utils";
import {
    ConsultationDuration,
    ConsultationType,
    TimeSlotStatus
} from "@/lib/data-transfer/data-types";
import { toast } from '@/lib/hooks/app-toast';

interface WeeklyTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WeeklyTemplateModal({ isOpen, onClose }: WeeklyTemplateModalProps) {
    const [weeklyTemplate, setWeeklyTemplate] = useState<any>(null);
    const [isTemplateLoading, setIsTemplateLoading] = useState(true);
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Time slots hook - using the new hook
    const { useTimeSlotsData } = useTimeManagement();
    const { timeSlots, isLoading, isManuallyNonHoliday } = useTimeSlotsData();

    const {
        useWeeklyTemplate,
        useSaveWeeklyTemplate,
        useApplyTemplateToRange,
        useCreateTimeSlot,
        useDeleteTimeSlot,
        useUpdateTimeSlot,
        useTimeSlots
    } = useTimeManagement();
    const { refetch } = useTimeSlots();

    // mutations
    const saveWeeklyTemplateMutation = useSaveWeeklyTemplate();
    const applyTemplateMutation = useApplyTemplateToRange();
    const createTimeSlotMutation = useCreateTimeSlot();
    const deleteTimeSlotMutation = useDeleteTimeSlot();
    const updateTimeSlotMutation = useUpdateTimeSlot();

    // Fetch weekly template on mount
    const { data: weeklyTemplateBackend, isLoading: isTemplateFetching } = useWeeklyTemplate();

    useEffect(() => {
        setIsTemplateLoading(isTemplateFetching);
        if (weeklyTemplateBackend?.template && !isTemplateFetching) {
            setWeeklyTemplate(weeklyTemplateBackend.template);
        }
    }, [weeklyTemplateBackend, isTemplateFetching]);

    // Save template when data changes
    const handleTemplateChange = useCallback((newTemplate: any) => {
        setWeeklyTemplate(newTemplate);

        // Save the template with debouncing
        let timeout: NodeJS.Timeout;
        const debouncedSave = () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                if (isSaving) return;

                setIsSaving(true);
                try {
                    await saveWeeklyTemplateMutation.mutateAsync(newTemplate);
                    // No toast message - silent save
                } catch (error) {
                    console.error('Error saving weekly template:', error);
                } finally {
                    setIsSaving(false);
                }
            }, 1000); // 1 second debounce
        };

        debouncedSave();

        // Cleanup
        return () => clearTimeout(timeout);
    }, [saveWeeklyTemplateMutation, isSaving]);

    // Show success message
    const showSuccess = (message: string) => {
        setShowSuccessMessage(message);
        setTimeout(() => setShowSuccessMessage(false), 5000);
    };

    // Check if a date is holiday based on template
    const isHolidayFromTemplate = (dateString: string) => {
        const dayName = getDayName(dateString);
        return weeklyTemplate?.[dayName]?.isHoliday || false;
    };

    // Toggle holiday status for a specific date
    const toggleDateHolidayStatus = async (dateString: string) => {
        if (isHolidayFromTemplate(dateString)) {
            const dayName = getDayName(dateString);
            const templateDay = weeklyTemplate?.[dayName];

            if (templateDay && !templateDay.isHoliday) {
                // Delete all existing slots for this date
                const slotsToDelete = timeSlots.filter(slot => {
                    const slotDateOnly = new Date(slot.date).toISOString().split('T')[0];
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
                const slotDateOnly = new Date(slot.date).toISOString().split('T')[0];
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

    // Apply weekly template to next month
    const applyWeeklyTemplateToNextMonth = () => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate());
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30);

        setIsApplyingTemplate(true);

        applyTemplateMutation.mutate({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            overwrite: true
        }, {
            onSuccess: () => {
                showSuccess("قالب هفتگی به روزهای امروز تا 30 روز بعد اعمال شد");
                onClose();
                refetch();
                setIsApplyingTemplate(false);
            },
            onError: (error) => {
                console.error('Error applying template:', error);
                toast.error("خطا در اعمال قالب هفتگی");
                setIsApplyingTemplate(false);
            }
        });
    };

    // Toggle day expansion
    const toggleDayExpansion = (dayKey: string) => {
        setExpandedDays(prev => {
            const newSet = new Set(prev);
            if (newSet.has(dayKey)) {
                newSet.delete(dayKey);
            } else {
                newSet.add(dayKey);
            }
            return newSet;
        });
    };

    // Generate time slots (30-minute intervals from 8:00 to 24:00)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour < 23; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                slots.push({ hour, minute });
            }
        }
        slots.push({ hour: 23, minute: 0 });
        return slots;
    };

    // Format time correctly with hour rollover
    const formatTimeForDisplay = (hour: number, minute: number) => {
        const totalMinutes = hour * 60 + minute;
        const endHour = Math.floor((totalMinutes + 30) / 60);
        const endMinute = (totalMinutes + 30) % 60;

        return {
            start: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            end: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
        };
    };

    const daysOfWeek = [
        "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"
    ];

    const persianDays = [
        "شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full max-h-[95vh] overflow-y-auto -p-4">
                {/* Loading Overlay */}
                {isApplyingTemplate && (
                    <div className="fixed inset-0 top-0 bottom-0-0 left-0 right-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca2a30] mx-auto mb-4"></div>
                            <p className="text-lg font-medium text-gray-800">
                                در حال اعمال قالب به 30 روز آینده
                            </p>
                        </div>
                    </div>
                )}

                {/* Sticky Header */}
                <div className="sticky top-0  border-b border-gray-200 z-10  p-2 bg-gray-700">
                    <DialogHeader>
                        <div className="items-center ">
                            <DialogTitle className="flex items-center gap-2 text-white p-4 ">
                                قالب زمانی هفتگی
                            </DialogTitle>
                            <div className={"flex justify-between "}>
                                <div/>
                                <div className={"flex"}>
                                    <Button
                                        onClick={applyWeeklyTemplateToNextMonth}
                                        disabled={isTemplateLoading || isApplyingTemplate || isSaving}
                                        className="bg-[#ca2a30] hover:bg-[#b02529] mx-2"
                                    >
                                        <Save className="w-4 h-4 mr-2"/>
                                        اعمال به یک ماه آینده
                                    </Button>
                                    <Button
                                        className="mx-2"
                                        onClick={onClose}
                                        variant="outline"
                                    >
                                        بستن
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </DialogHeader>
                </div>

                {isTemplateLoading ? (
                    <div className="flex justify-center items-center h-64 p-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca2a30]"></div>
                    </div>
                ) : (
                    <div className="space-y-4 p-4">
                        {persianDays.map((day, index) => {
                            const dayKey = daysOfWeek[index];
                            const templateDay = weeklyTemplate?.[dayKey] || {isHoliday: false, hours: []};

                            return (
                                <div key={dayKey} className="border rounded-lg">
                                    <div
                                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleDayExpansion(dayKey)}
                                    >
                                        <div className="flex items-center justify-between">
                                           <div className={"flex gap-2"}>
                                               {templateDay.isHoliday?(<CalendarX2 className="w-5 h-5 text-red-700" />):(<CalendarCheck2 className="w-5 h-5" />)}

                                               <h3 className="font-medium">{day}</h3>
                                           </div>
                                            <div className="flex items-center gap-2">
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    {expandedDays.has(dayKey) ? (
                                                        <X className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedDays.has(dayKey) && (
                                        <div className="px-4 pb-4 border-t border-gray-200 ">
                                            <label className="flex items-center gap-2 cursor-pointer py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={templateDay.isHoliday}
                                                    onChange={(e) => {
                                                        const updatedTemplate = {...weeklyTemplate};
                                                        if (!updatedTemplate[dayKey]) {
                                                            updatedTemplate[dayKey] = {isHoliday: false, hours: []};
                                                        }
                                                        updatedTemplate[dayKey].isHoliday = e.target.checked;
                                                        handleTemplateChange(updatedTemplate);
                                                    }}
                                                    disabled={isTemplateLoading || isApplyingTemplate || isSaving}
                                                    className="w-4 h-4 text-[#ca2a30] rounded focus:ring-[#ca2a30]"
                                                />
                                                <span className="text-sm">{day+' ها کار نمی کنم'}.</span>
                                            </label>
                                            {!templateDay.isHoliday && (
                                                <>
                                                    <div
                                                        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-3 pt-3">
                                                        {generateTimeSlots().map(({hour, minute}) => {
                                                            const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                                            const isAvailable = templateDay.hours.some(slot =>
                                                                slot.startTime === timeKey
                                                            );

                                                            // Format time correctly with hour rollover
                                                            const timeRange = formatTimeForDisplay(hour, minute);
                                                            const timeRangeDisplay = `${timeRange.start} - ${timeRange.end}`;

                                                            return (
                                                                <button
                                                                    key={`${hour}-${minute}`}
                                                                    onClick={() => {
                                                                        const updatedTemplate = {...weeklyTemplate};
                                                                        if (!updatedTemplate[dayKey]) {
                                                                            updatedTemplate[dayKey] = {
                                                                                isHoliday: false,
                                                                                hours: []
                                                                            };
                                                                        }

                                                                        const existingSlotIndex = updatedTemplate[dayKey].hours.findIndex(slot =>
                                                                            slot.startTime === timeKey
                                                                        );

                                                                        if (isAvailable) {
                                                                            updatedTemplate[dayKey].hours.splice(existingSlotIndex, 1);
                                                                        } else {
                                                                            updatedTemplate[dayKey].hours.push({
                                                                                startTime: timeKey,
                                                                                endTime: timeRange.end, // Use formatted end time
                                                                                duration: ConsultationDuration.MIN_30,
                                                                                allowedTypes: [ConsultationType.IN_PERSON, ConsultationType.VIDEO, ConsultationType.PHONE, ConsultationType.TEXT_CHAT]
                                                                            });
                                                                        }

                                                                        handleTemplateChange(updatedTemplate);
                                                                    }}
                                                                    className={`w-full p-2 border rounded-lg text-center transition-colors ${
                                                                        isAvailable
                                                                            ? 'bg-[#ca2a30] text-white border-[#ca2a30] hover:bg-[#b02529]'
                                                                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs">
                                                                            {timeRangeDisplay}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Consultation types for selected time slots */}
                                                    {templateDay.hours.length > 0 && (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                            <h4 className="text-sm font-medium mb-2">نوع مشاوره برای
                                                                ساعات انتخاب شده:</h4>
                                                            <div className="space-y-2">
                                                                {templateDay.hours.map((slot: any, index: number) => (
                                                                    <div key={index}
                                                                         className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium">
                                                                            {slot.startTime} - {slot.endTime}
                                                                        </span>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {Object.values(ConsultationType).map(type => (
                                                                                <label key={type}
                                                                                       className="flex items-center gap-1 cursor-pointer pr-2">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={slot.allowedTypes?.includes(type) || false}
                                                                                        onChange={(e) => {
                                                                                            const updatedTemplate = {...weeklyTemplate};
                                                                                            if (!updatedTemplate[dayKey]) {
                                                                                                updatedTemplate[dayKey] = {
                                                                                                    isHoliday: false,
                                                                                                    hours: []
                                                                                                };
                                                                                            }

                                                                                            const slotIndex = updatedTemplate[dayKey].hours.findIndex((s: any) =>
                                                                                                s.startTime === slot.startTime
                                                                                            );

                                                                                            if (slotIndex !== -1) {
                                                                                                const currentTypes = updatedTemplate[dayKey].hours[slotIndex].allowedTypes ||
                                                                                                    [ConsultationType.IN_PERSON, ConsultationType.VIDEO, ConsultationType.PHONE, ConsultationType.TEXT_CHAT];
                                                                                                const newTypes = e.target.checked
                                                                                                    ? [...currentTypes, type]
                                                                                                    : currentTypes.filter((t: any) => t !== type);

                                                                                                // Ensure at least one type is selected
                                                                                                if (newTypes.length === 0) {
                                                                                                    newTypes.push(ConsultationType.IN_PERSON);
                                                                                                }

                                                                                                updatedTemplate[dayKey].hours[slotIndex].allowedTypes = newTypes;
                                                                                                handleTemplateChange(updatedTemplate);
                                                                                            }
                                                                                        }}
                                                                                        disabled={isTemplateLoading || isApplyingTemplate || isSaving}
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
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}


            </DialogContent>
        </Dialog>
    );
}