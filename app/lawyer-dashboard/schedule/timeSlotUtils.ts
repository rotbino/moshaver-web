// src/lib/utils/timeSlotUtils.ts

import { ConsultationDuration, ConsultationType } from '@/lib/data-transfer/data-types';
import { CreateTimeSlotDto } from '@/lib/data-transfer/dto/time-management.dto';

export interface HourlyTemplate {
    hours: number[];
    isHoliday: boolean;
    allowedTypes: Record<number, ConsultationType[]>;
}

export interface WeeklyTemplateUI {
    [day: string]: HourlyTemplate;
}

// تبدیل قالب نیم‌ساعتی بک‌اند به یک‌ساعتی برای UI
// src/lib/utils/timeSlotUtils.ts

// تبدیل قالب نیم‌ساعتی بک‌اند به یک‌ساعتی برای UI
export function convertHalfHourlyToHourly(
    backendTemplate: Record<string, any>
): WeeklyTemplateUI {
    const uiTemplate: WeeklyTemplateUI = {};

    Object.keys(backendTemplate).forEach(day => {
        const dayTemplate = backendTemplate[day];

        if (dayTemplate.isHoliday) {
            uiTemplate[day] = { hours: [], isHoliday: true };
        } else {
            const hoursSet = new Set<number>();
            const allowedTypesMap: Record<number, ConsultationType[]> = {};

            // بررسی اینکه آیا dayTemplate.hours یک آرایه است
            if (Array.isArray(dayTemplate.hours)) {
                dayTemplate.hours.forEach((slot: any) => {
                    const hour = parseInt(slot.startTime.split(':')[0]);
                    hoursSet.add(hour);

                    // استخراج allowedTypes برای این ساعت
                    if (!allowedTypesMap[hour]) {
                        allowedTypesMap[hour] = slot.allowedTypes || [ConsultationType.IN_PERSON, ConsultationType.VIDEO, ConsultationType.PHONE, Consultation
                            .TEXT_CHAT];
                    }
                });
            }

            uiTemplate[day] = {
                hours: Array.from(hoursSet).sort((a, b) => a - b),
                isHoliday: false,
                allowedTypes: allowedTypesMap
            };
        }
    });

    return uiTemplate;
}

// تبدیل قالب یک‌ساعته UI به نیم‌ساعتی برای بک‌اند
// تبدیل قالب یک‌ساعته UI به نیم‌ساعتی برای بک‌اند
// تبدیل قالب یک‌ساعتی UI به نیم‌ساعتی برای بک‌اند
export function convertHourlyToHalfHourly(
    weeklyTemplateUI: WeeklyTemplateUI,
    defaultAllowedTypes: ConsultationType[] = [ConsultationType.IN_PERSON, ConsultationType.VIDEO, ConsultationType.PHONE, ConsultationType.TEXT_CHAT]
): Record<string, any> {
    const backendTemplate: Record<string, any> = {};

    Object.keys(weeklyTemplateUI).forEach(day => {
        const dayTemplate = weeklyTemplateUI[day];

        if (dayTemplate.isHoliday) {
            backendTemplate[day] = { isHoliday: true, hours: [] };
        } else {
            const halfHourSlots: any[] = [];

            dayTemplate.hours.forEach(hour => {
                // استفاده از allowedTypes مخصوص آن ساعت اگر وجود داشته باشد
                const hourAllowedTypes = dayTemplate.allowedTypes?.[hour] || defaultAllowedTypes;

                // ایجاد دو اسلات نیم‌ساعتی برای هر ساعت
                halfHourSlots.push({
                    startTime: `${hour.toString().padStart(2, '0')}:00`,
                    endTime: `${hour.toString().padStart(2, '0')}:30`,
                    duration: ConsultationDuration.MIN_30,
                    allowedTypes: hourAllowedTypes
                });

                halfHourSlots.push({
                    startTime: `${hour.toString().padStart(2, '0')}:30`,
                    endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
                    duration: ConsultationDuration.MIN_30,
                    allowedTypes: hourAllowedTypes
                });
            });

            backendTemplate[day] = {
                isHoliday: false,
                hours: halfHourSlots
            };
        }
    });

    return backendTemplate;
}

// ایجاد اسلات‌های نیم‌ساعتی از ساعت انتخاب شده
export function createHalfHourSlotsFromHour(
    date: string,
    hour: number,
    allowedTypes: ConsultationType[] = [ConsultationType.IN_PERSON, ConsultationType.VIDEO, ConsultationType.PHONE, ConsultationType.TEXT_CHAT]
): CreateTimeSlotDto[] {
    return [
        {
            date,
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${hour.toString().padStart(2, '0')}:30`,
            duration: ConsultationDuration.MIN_30,
            allowedTypes
        },
        {
            date,
            startTime: `${hour.toString().padStart(2, '0')}:30`,
            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
            duration: ConsultationDuration.MIN_30,
            allowedTypes
        }
    ];
}

// بررسی اینکه آیا یک ساعت کاملاً آزاد است (هر دو نیم‌ساعت آزاد باشند)
export function isHourFullyAvailable(
    timeSlots: any[],
    date: string,
    hour: number
): boolean {
    const firstHalf = timeSlots.find(slot =>
        slot.date === date && slot.startTime === `${hour.toString().padStart(2, '0')}:00`
    );
    const secondHalf = timeSlots.find(slot =>
        slot.date === date && slot.startTime === `${hour.toString().padStart(2, '0')}:30`
    );

    return firstHalf?.status === 'AVAILABLE' && secondHalf?.status === 'AVAILABLE';
}

// دریافت وضعیت یک ساعت (ترکیبی از دو نیم‌ساعت)
export function getHourStatus(
    timeSlots: any[],
    date: string,
    hour: number
): 'FULLY_AVAILABLE' | 'PARTIALLY_AVAILABLE' | 'FULLY_BOOKED' {
    const firstHalf = timeSlots.find(slot =>
        slot.date === date && slot.startTime === `${hour.toString().padStart(2, '0')}:00`
    );
    const secondHalf = timeSlots.find(slot =>
        slot.date === date && slot.startTime === `${hour.toString().padStart(2, '0')}:30`
    );

    const firstAvailable = firstHalf?.status === 'AVAILABLE';
    const secondAvailable = secondHalf?.status === 'AVAILABLE';

    if (firstAvailable && secondAvailable) return 'FULLY_AVAILABLE';
    if (firstAvailable || secondAvailable) return 'PARTIALLY_AVAILABLE';
    return 'FULLY_BOOKED';
}