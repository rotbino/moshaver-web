// lib/store/slices/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {UserProfile} from "@/lib/data-transfer/types";




interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    sessionExpired: boolean;
    _persist?: any;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
    refreshToken: null,
    sessionExpired: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserProfile>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.accessToken = null;
            state.refreshToken = null; // ریست کردن refreshToken
            state.sessionExpired = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        // اضافه اکشن برای به‌روزرسانی timeSlots
        updateTimeSlots: (state, action: PayloadAction<{ lawyerId: string; timeSlots: any[] }>) => {
            if (state.user && state.user.id === action.payload.lawyerId) {
                state.user = {
                    ...state.user,
                    timeSlots: action.payload.timeSlots
                };
            }
        },
        // اضافه اکشن برای به‌روزرسانی weeklyTemplate
        updateWeeklyTemplate: (state, action: PayloadAction<{ lawyerId: string; weeklyTemplate: any }>) => {
            if (state.user && state.user.id === action.payload.lawyerId) {
                state.user = {
                    ...state.user,
                    weeklyTemplate: action.payload.weeklyTemplate
                };
            }
        },
        // اضافه اکشن برای تنظیم توکن دسترسی
        setAccessToken: (state, action: PayloadAction<string | null>) => {
            state.accessToken = action.payload;
        },
        // اضافه اکشن برای تنظیم توکن رفرش
        setRefreshToken: (state, action: PayloadAction<string | null>) => {
            state.refreshToken = action.payload;
        },
        // اضافه اکشن برای تنظیم وضعیت انقضای جلسه
        setSessionExpired: (state, action: PayloadAction<boolean>) => {
            state.sessionExpired = action.payload;
        },
        resetPersist: (state) => {
            state._persist = undefined;
        }
    },
});

export const {
    setUser,
    logout,
    setLoading,
    updateTimeSlots,
    updateWeeklyTemplate,
    resetPersist,
    setAccessToken,
    setRefreshToken, // اضافه کردن به export
    setSessionExpired
} = authSlice.actions;
export default authSlice.reducer;