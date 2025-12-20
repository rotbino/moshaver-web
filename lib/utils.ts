// lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {TimeSlot} from "@/lib/api/types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function getSmallFIlePath(fileName: string) {
    return "http://localhost:3011/images/"+fileName;
}

// Format date for display
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return dateString;
        }

        const defaultOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return new Intl.DateTimeFormat('fa-IR', options || defaultOptions).format(date);
    } catch (error) {
        console.error('Error formatting date:', error, dateString);
        return dateString;
    }
};

// Get day name in Persian
export const getPersianDayName = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return "نامشخص";
        }

        const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
        return new Intl.DateTimeFormat('fa-IR', options).format(date);
    } catch (error) {
        console.error('Error getting day name:', error, dateString);
        return "نامشخص";
    }
};

// Get day name in English (for template matching)
export const getDayName = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            //console.error('Invalid date:', dateString);
            return "sunday";
        }

        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        return days[date.getDay()];
    } catch (error) {
        console.error('Error getting day name:', error, dateString);
        return "sunday";
    }
};

// Generate time slots from hours
export const generateTimeSlots = (date: string, hours: number[]): TimeSlot[] => {
    return hours.map(hour => ({
        id: `${date}-${hour}`,
        date,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        isBooked: false
    }));
};

// Get dates in range
export const getDatesInRange = (startDate: Date, endDate: Date): string[] => {
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};