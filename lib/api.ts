// lib/api.ts
import {
    TimeSlot,
    WeeklyTemplate,
    LawyerList as LawyerType,
    Province,
    UserPreferences
} from './api/types';
import {lawyersData, provinces, specialties} from "@/lib/api/mockData";

// Keys for localStorage
const STORAGE_KEYS = {
    LAWYERS: 'lawyers',
    PROVINCES: 'provinces',
    SPECIALTIES: 'specialties',
    USER_PREFERENCES: 'userPreferences',
    TIME_SLOTS: (lawyerId: string) => `timeSlots_${lawyerId}`,
    WEEKLY_TEMPLATE: (lawyerId: string) => `weeklyTemplate_${lawyerId}`,
};

// Helper functions for localStorage
const getStorageData = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;

    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error getting data from localStorage for key ${key}:`, error);
        return defaultValue;
    }
};

const setStorageData = <T,>(key: string, data: T): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error setting data to localStorage for key ${key}:`, error);
    }
};

// API Functions for Lawyers
export const lawyersApi = {
    getAll: async (): Promise<LawyerType[]> => {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

        const storedLawyers = getStorageData<LawyerType[]>(STORAGE_KEYS.LAWYERS, null);
        if (!storedLawyers) {
            setStorageData(STORAGE_KEYS.LAWYERS, lawyersData);
            return lawyersData;
        }
        return storedLawyers;
    },

    getById: async (id: string): Promise<LawyerType | null> => {
        await new Promise(resolve => setTimeout(resolve, 200));

        const lawyers = await lawyersApi.getAll();
        return lawyers.find(lawyer => lawyer.id === id) || null;
    }
};

// API Functions for Provinces
export const provincesApi = {
    getAll: async (): Promise<Province[]> => {
        await new Promise(resolve => setTimeout(resolve, 200));

        const storedProvinces = getStorageData<Province[]>(STORAGE_KEYS.PROVINCES, null);
        if (!storedProvinces) {
            setStorageData(STORAGE_KEYS.PROVINCES, provinces);
            return provinces;
        }
        return storedProvinces;
    }
};

// API Functions for Specialties
export const specialtiesApi = {
    getAll: async (): Promise<string[]> => {
        await new Promise(resolve => setTimeout(resolve, 200));

        const storedSpecialties = getStorageData<string[]>(STORAGE_KEYS.SPECIALTIES, null);
        if (!storedSpecialties) {
            setStorageData(STORAGE_KEYS.SPECIALTIES, specialties);
            return specialties;
        }
        return storedSpecialties;
    }
};

// API Functions for User Preferences
export const userPreferencesApi = {
    get: async (key: string): Promise<string | null> => {
        await new Promise(resolve => setTimeout(resolve, 100));

        const preferences = getStorageData<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {});
        return preferences[key] || null;
    },

    set: async (key: string, value: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 100));

        const preferences = getStorageData<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {});
        preferences[key] = value;
        setStorageData(STORAGE_KEYS.USER_PREFERENCES, preferences);
    }
};

// API Functions for Time Slots
export const timeSlotsApi = {
    getByLawyerId: async (lawyerId: string): Promise<TimeSlot[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        const key = STORAGE_KEYS.TIME_SLOTS(lawyerId);
        return getStorageData<TimeSlot[]>(key, []);
    },

    saveForLawyer: async (lawyerId: string, slots: TimeSlot[]): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        const key = STORAGE_KEYS.TIME_SLOTS(lawyerId);
        setStorageData(key, slots);
    },

    applyTemplateToRange: async (
        lawyerId: string,
        startDate: string,
        endDate: string
    ): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const template = await weeklyTemplateApi.getByLawyerId(lawyerId);
        const existingSlots = await timeSlotsApi.getByLawyerId(lawyerId);

        const start = new Date(startDate);
        const end = new Date(endDate);
        const dates = getDatesInRange(start, end);

        let updatedSlots = [...existingSlots];

        dates.forEach(date => {
            const dayName = getDayName(date);
            const dayTemplate = template[dayName];

            if (dayTemplate && !dayTemplate.isHoliday) {
                // Remove existing slots for this date
                updatedSlots = updatedSlots.filter(slot => slot.date !== date);

                // Add new slots based on template
                const newSlots = generateTimeSlots(date, dayTemplate.hours);
                updatedSlots = [...updatedSlots, ...newSlots];
            }
        });

        await timeSlotsApi.saveForLawyer(lawyerId, updatedSlots);
    }
};

// API Functions for Weekly Template
export const weeklyTemplateApi = {
    getByLawyerId: async (lawyerId: string): Promise<WeeklyTemplate> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        const key = STORAGE_KEYS.WEEKLY_TEMPLATE(lawyerId);
        return getStorageData<WeeklyTemplate>(key, {});
    },

    saveForLawyer: async (lawyerId: string, template: WeeklyTemplate): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        const key = STORAGE_KEYS.WEEKLY_TEMPLATE(lawyerId);
        setStorageData(key, template);
    }
};

// Helper functions (these are not API functions but utilities used by API functions)
const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[date.getDay()];
};

const generateTimeSlots = (date: string, hours: number[]): TimeSlot[] => {
    return hours.map(hour => ({
        id: `${date}-${hour}`,
        date,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        isBooked: false
    }));
};

const getDatesInRange = (startDate: Date, endDate: Date): string[] => {
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};