// src/lib/api/apiRequest.ts

import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ApiError } from "@/lib/api/apiError";
import { store } from "@/lib/store/store";
import { setAccessToken, setRefreshToken, setSessionExpired } from "@/lib/store/slices/authSlice";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3011/";

// متغیر توکن سریع
let authToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

// ست کردن توکن در متغیر و redux persist
export const setAuthToken = (token: string | null) => {
    if (token) {
        authToken = token;
        store.dispatch(setAccessToken(token));
    }
};

export const getAuthToken = (): string | null => {
    authToken = authToken || store.getState().auth.accessToken;
    return authToken;
};

export const setRefreshTokenValue = (token: string | null) => {
    if (token) {
        refreshToken = token;
        store.dispatch(setRefreshToken(token));
    }
};

export const getRefreshTokenValue = (): string | null => {
    refreshToken = refreshToken || store.getState().auth.refreshToken;
    return refreshToken;
};

// پردازش صف درخواست‌های ناموفق
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// تابع رفرش توکن
const refreshAccessToken = async (): Promise<string> => {
    try {
        const currentRefreshToken = getRefreshTokenValue();
        if (!currentRefreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken: currentRefreshToken
        });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        // ذخیره توکن‌های جدید
        setAuthToken(accessToken);
        setRefreshTokenValue(newRefreshToken);
        return accessToken;
    } catch (error) {
        // اگر رفرش توکن هم منقضی شده، کاربر را به صفحه لاگین هدایت کن
        store.dispatch(setSessionExpired(true));
        throw error;
    }
};

// axios instance برای درخواست‌های عمومی (بدون interceptor)
const publicApi = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// axios instance برای درخواست‌های نیاز به احراز هویت
const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// تابع کمکی برای استخراج خطا از پاسخ سرور
const extractError = (error: any): ApiError => {
    // اگر خطا از نوع ApiError باشد، همان را برگردان
    if (error instanceof ApiError) {
        return error;
    }

    // اگر سرور پاسخ داده
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // مدیریت خطاهای NestJS با ساختار استاندارد
        if (data && typeof data === 'object' && data.statusCode && data.message) {
            // اگر خطای 401 یا 403 بود، جلسه را منقضی کن
            if (data.statusCode === 401 || data.statusCode === 403) {
                store.dispatch(setSessionExpired(true));
            }

            // اگر message آرایه است، آن را به صورت رشته ترکیب کن
            let message = data.message;
            if (Array.isArray(data.message)) {
                message = data.message.join(', ');
            }

            // حفظ تمام اطلاعات خطا از سمت سرور
            return new ApiError(data.statusCode, message, {
                ...data,
                originalMessage: data.message // پیام اصلی را هم نگه می‌داریم
            });
        }

        // خطاهای HTTP استاندارد بدون ساختار NestJS
        if (status) {
            // اگر پاسخ دارای message است، از آن استفاده کن
            let message = data?.message || error.message || "خطای سرور";

            // اگر خطای 401 یا 403 بود، جلسه را منقضی کن
            if (status === 401 || status === 403) {
                store.dispatch(setSessionExpired(true));
            }

            return new ApiError(status, message, data);
        }

        // اگر هیچ‌کدام از موارد بالا نبود، از وضعیت HTTP استفاده کن
        return new ApiError(status || 0, error.message || "خطای نامعلوم", data);
    }

    // خطای ناشناخته
    return new ApiError(0, error.message || "خطای نامعلوم");
};

// افزودن interceptor برای درخواست‌های نیاز به احراز هویت
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = getAuthToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// افزودن interceptor برای پاسخ‌های درخواست‌های نیاز به احراز هویت
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // اگر خطای 401 بود و قبلاً در حال رفرش توکن نبودیم
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // اگر در حال رفرش توکن هستیم، درخواست را در صف قرار بده
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newAccessToken = await refreshAccessToken();

                // تنظیم توکن جدید در هدر درخواست اصلی
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// متد عمومی برای درخواست‌های بدون نیاز به توکن
export const publicApiRequest = async <T = any>(
    url: string,
    options?: AxiosRequestConfig
): Promise<T> => {
    try {
        const response: AxiosResponse<T> = await publicApi({
            url,
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            }
        });
        return response.data;
    } catch (err: any) {
        console.error("Public API Error:", err);
        const extractErr = extractError(err);
        console.error("extractErr:", extractErr);
        throw extractErr;
    }
};

// متد اصلی برای درخواست‌ها با توکن
export const apiRequest = async <T = any>(
    url: string,
    options?: AxiosRequestConfig
): Promise<T> => {
    try {
        const response: AxiosResponse<T> = await api({
            url,
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            }
        });
        return response.data;
    } catch (err: any) {
        console.error("API Error:", err);
        throw extractError(err);
    }
};

// متد برای آپلود فایل
export const apiFileRequest = async <T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
): Promise<T> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new ApiError(401, "توکن احراز هویت وجود ندارد");
        }

        const fullUrl = `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;

        const defaultConfig: AxiosRequestConfig = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        };

        const finalConfig = {
            ...defaultConfig,
            ...config,
            headers: {
                ...defaultConfig.headers,
                ...config?.headers,
            }
        };

        const response = await axios.post(fullUrl, formData, finalConfig);
        return response.data;
    } catch (err: any) {
        console.error("File Upload Error:", err);
        throw extractError(err);
    }
};

export default api;