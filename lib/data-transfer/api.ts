// src/lib/data-transfer/api.ts

import { publicApiRequest, apiRequest } from "@/lib/api/apiRequest";
import {
    ApiResponse,
    RegisterStep1Dto,
    VerifyOtpDto,
    CompleteRegistrationDto,
    LoginDto,
    RefreshTokenDto,
    User,
    LawyerProfile,
    Tokens,
    LawyerInfoDto,
    UserInfoDto,
    DashboardResponseDto,
    TimeSlot,
    WeeklyTemplate,
    Pricing,
    Consultation,
    ServiceRequest,
    LawyerClient,
    CreateTimeSlotDto,
    UpdateTimeSlotDto,
    CreatePricingDto,
    UpdatePricingDto,
    CreateConsultationDto,
    CreateConsultationByLawyerDto,
    ServiceRequestDto,
    UpdateServiceRequestDto,
    TimeSlotsResponse,
    UpdateServiceDto,
    CreateServiceDto,
    CreateOrderDto,
    UpdateOrderDto,
    UpdateClientDto, SearchLawyersDto, ClientFilterDto, BookConsultationForClientDto, InviteClientDto, CreateClientDto
} from "./types";
import {
    ClientSource,
    ConsultationDuration,
    ConsultationType,
    ServiceType
} from "@/lib/data-transfer/data-types";

export const authApi = {
    // ثبت‌نام مرحله 1: ارسال کد تایید
    registerStep1: async (data: RegisterStep1Dto): Promise<{ message: string; expiresIn: number }> => {
        return publicApiRequest("/auth/register/step1", {
            method: "POST",
            data,
        });
    },

    // ثبت‌نام مرحله 2: تایید کد
    registerStep2: async (data: VerifyOtpDto): Promise<{ message: string; registrationToken: string; mobile: string }> => {
        return publicApiRequest("/auth/register/step2", {
            method: "POST",
            data,
        });
    },

    // ثبت‌نام مرحله 3: تکمیل ثبت‌نام
    registerStep3: async (registrationToken: string, data: CompleteRegistrationDto): Promise<ApiResponse<{ message: string; user: User; tokens: Tokens }>> => {
        return publicApiRequest("/auth/register/step3", {
            method: "POST",
            data,
            headers: {
                'x-registration-token': registrationToken
            }
        });
    },

    // بررسی در دسترس بودن نام کاربری
    checkUsernameAvailability: async (username: string, accountSlug?: string) => {
        return publicApiRequest("/auth/register/check-username", {
            method: "POST",
            data: { username, accountSlug },
        });
    },

    // ارسال مجدد کد تایید
    resendCode: async (mobile: string): Promise<ApiResponse<{ message: string; expiresIn: number }>> => {
        return publicApiRequest("/auth/register/resend", {
            method: "POST",
            data: { mobile },
        });
    },

    // ورود به سیستم
    login: async (data: LoginDto): Promise<DashboardResponseDto> => {
        return publicApiRequest("/auth/login", {
            method: "POST",
            data,
        });
    },

    // تازه‌سازی توکن
    refreshToken: async (data: RefreshTokenDto): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
        return publicApiRequest("/auth/refresh", {
            method: "POST",
            data,
        });
    },

    // خروج از سیستم
    logout: async (): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest("/auth/logout", {
            method: "POST",
        });
    },

    // دریافت اطلاعات پنل کاربر
    getPanelData: async (): Promise<DashboardResponseDto> => {
        return apiRequest("/auth/me", {
            method: "GET",
        });
    },

    // دریافت پروفایل کاربر
    getProfile: async (): Promise<ApiResponse<User>> => {
        return apiRequest("/auth/me", {
            method: "GET",
        });
    },

    // دریافت پروفایل وکیل
    getLawyerProfile: async (): Promise<ApiResponse<LawyerProfile>> => {
        return apiRequest("/lawyers/profile", {
            method: "GET",
        });
    },

    // بروزرسانی پروفایل وکیل
    updateLawyerProfile: async (data: Partial<LawyerInfoDto>): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest("/lawyers/profile", {
            method: "PATCH",
            data,
        });
    },

    // تغییر رمز عبور
    changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest("/auth/change-password", {
            method: "POST",
            data,
        });
    },

    // فراموشی رمز عبور
    forgotPassword: async (mobile: string): Promise<ApiResponse<{ message: string }>> => {
        return publicApiRequest("/auth/forgot-password", {
            method: "POST",
            data: { mobile },
        });
    },

    // بازنشانی رمز عبور
    resetPassword: async (data: { mobile: string; code: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> => {
        return publicApiRequest("/auth/reset-password", {
            method: "POST",
            data,
        });
    },
};

// APIهای مربوط به داشبورد
export const dashboardApi = {
    // دریافت اطلاعات داشبورد کاربر عادی
    getUserDashboard: async (): Promise<any> => {
        return apiRequest("/dashboard/client", {
            method: "GET",
        });
    },

    // دریافت اطلاعات داشبورد وکیل
    getLawyerDashboard: async (): Promise<any> => {
        return apiRequest("/dashboard/lawyer", {
            method: "GET",
        });
    },
};

// APIهای مربوط به مدیریت زمان
export const timeManagementApi = {
    // دریافت زمان‌های مشاوره
    getTimeSlots: async (params?: {
        date?: string;
        startDate?: string;
        endDate?: string;
        isAvailable?: boolean;
        duration?: string;
        consultationType?: string;
    }): Promise<TimeSlotsResponse> => { // ✅ تغییر تایپ بازگشتی
        const queryParams = new URLSearchParams();

        if (params?.date) queryParams.append('date', params.date);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        if (params?.isAvailable !== undefined)
            queryParams.append('isAvailable', params.isAvailable.toString());
        if (params?.duration) queryParams.append('duration', params.duration);
        if (params?.consultationType) queryParams.append('consultationType', params.consultationType);

        const queryString = queryParams.toString();
        return apiRequest(`/time-management/time-slots${queryString ? `?${queryString}` : ''}`, {
            method: "GET",
        });
    },

    getUserWorkingHoursCount: async (): Promise<{ hasWorkingHours: number }> => {
        return apiRequest('/time-management/getUserWorkingHoursCount', {
            method: "GET",
        });
    },

    // APIهای جدید
    getThisWeekTimeSlots: async (filters?: any): Promise<TimeSlotsResponse> => {
        return apiRequest('/time-management/time-slots/week', {
            method: "GET",
            params: filters
        });
    },

    getTodayTimeSlots: async (): Promise<TimeSlotsResponse> => {
        return apiRequest('/time-management/time-slots/today', {
            method: "GET"
        });
    },

    getAvailableTimeSlots: async (): Promise<TimeSlotsResponse> => {
        return apiRequest('/time-management/time-slots/available', {
            method: "GET"
        });
    },

    // ایجاد زمان مشاوره جدید
    createTimeSlot: async (data: CreateTimeSlotDto): Promise<TimeSlot> => {
        const formattedData = {
            ...data,
            date: new Date(data.date).toISOString().split('T')[0],
        };

        return apiRequest('/time-management/time-slots', {
            method: "POST",
            data: formattedData,
        });
    },

    // به‌روزرسانی زمان مشاوره
    updateTimeSlot: async (timeSlotId: string, data: UpdateTimeSlotDto): Promise<TimeSlot> => {
        return apiRequest(`/time-management/time-slots/${timeSlotId}`, {
            method: "PUT",
            data,
        });
    },

    // حذف زمان مشاوره
    deleteTimeSlot: async (timeSlotId: string): Promise<void> => {
        return apiRequest(`/time-management/time-slots/${timeSlotId}`, {
            method: "DELETE",
        });
    },

    // ایجاد دسته‌ای زمان‌ها
    createTimeSlotsBatch: async (slots: CreateTimeSlotDto[]): Promise<TimeSlot[]> => {
        return apiRequest('/time-management/time-slots/batch', {
            method: "POST",
            data: slots,
        });
    },

    // دریافت قالب هفتگی
    getWeeklyTemplate: async (): Promise<WeeklyTemplate> => {
        return apiRequest('/time-management/weekly-template', {
            method: "GET",
        });
    },

    // ذخیره قالب هفتگی
    saveWeeklyTemplate: async (template: Record<string, any>): Promise<WeeklyTemplate> => {
        return apiRequest('/time-management/weekly-template', {
            method: "POST",
            data: { template },
        });
    },

    // اعمال قالب به بازه زمانی
    applyTemplateToRange: async (startDate: string, endDate: string, overwrite?: boolean): Promise<any> => {
        return apiRequest('/time-management/apply-template', {
            method: "POST",
            data: { startDate, endDate, overwrite },
        });
    },

    // بررسی وضعیت دسترسی
    checkAvailability: async (date: string): Promise<any> => {
        return apiRequest(`/time-management/availability?date=${date}`, {
            method: "GET",
        });
    },
};


// APIهای مربوط به قیمت‌گذاری
export const pricingApi = {

    getUserPricingCount: async (): Promise<{ hasPricing: number }> => {
        return apiRequest('/pricing/getUserPricingCount', {
            method: "GET",
        });
    },
    // دریافت همه قیمت‌های وکیل
    getPricings: async (): Promise<Pricing[]> => {
        return apiRequest('/pricing', {
            method: "GET",
        });
    },

    // دریافت قیمت خاص
    getPricing: async (consultationType: ConsultationType, duration: ConsultationDuration): Promise<Pricing> => {
        return apiRequest(`/pricing/search?consultationType=${consultationType}&duration=${duration}`, {
            method: "GET",
        });
    },

    // ایجاد قیمت جدید
    createPricing: async (data: CreatePricingDto): Promise<Pricing> => {
        return apiRequest('/pricing', {
            method: "POST",
            data,
        });
    },

    // ایجاد دسته‌ای قیمت‌ها
    bulkCreatePricings: async (pricings: CreatePricingDto[]): Promise<Pricing[]> => {
        return apiRequest('/pricing/bulk', {
            method: "POST",
            data: { pricings },
        });
    },

    // به‌روزرسانی قیمت
    updatePricing: async (consultationType: ConsultationType, duration: ConsultationDuration, data: UpdatePricingDto): Promise<Pricing> => {
        return apiRequest(`/pricing?consultationType=${consultationType}&duration=${duration}`, {
            method: "PUT",
            data,
        });
    },

    // حذف قیمت
    deletePricing: async (consultationType: ConsultationType, duration: ConsultationDuration): Promise<void> => {
        return apiRequest(`/pricing?consultationType=${consultationType}&duration=${duration}`, {
            method: "DELETE",
        });
    },

    // محاسبه قیمت نهایی با تخفیف
    calculatePrice: async (consultationType: ConsultationType, duration: ConsultationDuration): Promise<any> => {
        return apiRequest(`/pricing/calculate?consultationType=${consultationType}&duration=${duration}`, {
            method: "GET",
        });
    },
    
};

// APIهای مربوط به مشاوره‌ها
export const consultationsApi = {
    // دریافت مشاوره‌های کاربر
    getUserConsultations: async (params?: { status?: string; lawyerId?: string }): Promise<Consultation[]> => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.lawyerId) queryParams.append('lawyerId', params.lawyerId);

        return apiRequest(`/consultations/user${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
            method: "GET",
        });
    },

    // دریافت مشاوره‌های وکیل
    getLawyerConsultations: async (params?: { status?: string; date?: string }): Promise<Consultation[]> => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.date) queryParams.append('date', params.date);

        return apiRequest(`/consultations/lawyer${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
            method: "GET",
        });
    },

    // ایجاد مشاوره جدید
    createConsultation: async (data: CreateConsultationDto): Promise<Consultation> => {
        return apiRequest('/consultations', {
            method: "POST",
            data,
        });
    },

    // ایجاد مشاوره توسط وکیل برای مشتری
    createConsultationByLawyer: async (data: CreateConsultationByLawyerDto): Promise<Consultation> => {
        return apiRequest('/consultations/lawyer-booking', {
            method: "POST",
            data,
        });
    },

    // دریافت جزئیات مشاوره
    getConsultationDetails: async (id: string): Promise<Consultation> => {
        return apiRequest(`/consultations/details/${id}`, {
            method: "GET",
        });
    },

    // لغو مشاوره
    cancelConsultation: async (id: string): Promise<Consultation> => {
        return apiRequest(`/consultations/${id}/cancel`, {
            method: "PUT",
        });
    },

    // تکمیل مشاوره
    completeConsultation: async (id: string): Promise<Consultation> => {
        return apiRequest(`/consultations/${id}/complete`, {
            method: "PUT",
        });
    },
};

// APIهای مربوط به خدمات
// src/lib/data-transfer/api.ts


export const servicesApi = {
    // ==================== مدیریت خدمات وکیل (Products) ====================

    // دریافت خدمات فعال وکیل
    getLawyerProducts: async (isActive?: boolean): Promise<any[]> => {
        const queryParams = new URLSearchParams();
        if (isActive !== undefined) queryParams.append('isActive', isActive.toString());

        return apiRequest(`/services/lawyer/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
            method: "GET",
        });
    },

    // دریافت همه خدمات وکیل
    getAllLawyerProducts: async (): Promise<any[]> => {
        return apiRequest(`/services/lawyer/products?showAll=true`, {
            method: "GET",
        });
    },

    // ایجاد خدمت جدید
    createProduct: async (data: CreateServiceDto): Promise<any> => {
        return apiRequest(`/services/lawyer/products`, {
            method: "POST",
            data,
        });
    },

    // بروزرسانی خدمت
    updateProduct: async (serviceId: string, data: UpdateServiceDto): Promise<any> => {
        return apiRequest(`/services/lawyer/products/${serviceId}`, {
            method: "PUT",
            data,
        });
    },

    // حذف خدمت
    deleteProduct: async (serviceId: string): Promise<any> => {
        return apiRequest(`/services/lawyer/products/${serviceId}`, {
            method: "DELETE",
        });
    },

    // فعال کردن خدمت
    activateProduct: async (serviceId: string): Promise<any> => {
        return apiRequest(`/services/lawyer/products/${serviceId}/activate`, {
            method: "PUT",
        });
    },

    // غیرفعال کردن خدمت
    deactivateProduct: async (serviceId: string): Promise<any> => {
        return apiRequest(`/services/lawyer/products/${serviceId}/deactivate`, {
            method: "PUT",
        });
    },

    // ایجاد/بروزرسانی دسته‌ای خدمات
    bulkUpsertProducts: async (services: any[]): Promise<any> => {
        return apiRequest(`/services/lawyer/products/bulk`, {
            method: "POST",
            data: { services },
        });
    },

    // دریافت تعداد خدمات فعال
    getActiveProductsCount: async (): Promise<{ count: number }> => {
        return apiRequest(`/services/lawyer/products/active/count`, {
            method: "GET",
        });
    },

    // دریافت وضعیت خدمت
    getProductStatus: async (serviceId: string): Promise<any> => {
        return apiRequest(`/services/lawyer/products/${serviceId}/status`, {
            method: "GET",
        });
    },

    // ==================== سفارشات کاربر (Buy - خریدها) ====================

    // دریافت سفارشات من (خریدها)
    getClientOrders: async (params?: { status?: string; lawyerId?: string }): Promise<any[]> => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.lawyerId) queryParams.append('lawyerId', params.lawyerId);

        return apiRequest(`/services/client/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
            method: "GET",
        });
    },

    // ایجاد سفارش جدید (خرید خدمت)
    createOrder: async (data: CreateOrderDto): Promise<any> => {
        return apiRequest('/services/client/orders', {
            method: "POST",
            data,
        });
    },

    // بروزرسانی سفارش من
    updateClientOrder: async (orderId: string, data: UpdateOrderDto): Promise<any> => {
        return apiRequest(`/services/client/orders/${orderId}`, {
            method: "PUT",
            data,
        });
    },

    // دریافت جزئیات سفارش
    getOrderDetails: async (orderId: string): Promise<any> => {
        return apiRequest(`/services/client/orders/${orderId}`, {
            method: "GET",
        });
    },

    // آمار سفارشات من
    getClientOrdersStats: async (): Promise<any> => {
        return apiRequest(`/services/client/orders/stats`, {
            method: "GET",
        });
    },

    // ==================== سفارشات وکیل (Sell - فروشها) ====================

    // دریافت سفارشات وکیل (فروشها)
    getLawyerSales: async (params?: { status?: string; clientId?: string }): Promise<any[]> => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.clientId) queryParams.append('clientId', params.clientId);

        return apiRequest(`/services/lawyer/sales${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
            method: "GET",
        });
    },

    // بروزرسانی سفارش (فروش)
    updateLawyerSale: async (orderId: string, data: UpdateOrderDto): Promise<any> => {
        return apiRequest(`/services/lawyer/sales/${orderId}`, {
            method: "PUT",
            data,
        });
    },

    // دریافت جزئیات سفارش (فروش)
    getSaleDetails: async (orderId: string): Promise<any> => {
        return apiRequest(`/services/lawyer/sales/${orderId}`, {
            method: "GET",
        });
    },

    // آمار فروشهای وکیل
    getLawyerSalesStats: async (): Promise<any> => {
        return apiRequest(`/services/lawyer/sales/stats`, {
            method: "GET",
        });
    },
};

// APIهای مربوط به کاربران
export const usersApi = {
    // دریافت پروفایل کاربر
    getUserProfile: async (): Promise<User> => {
        return apiRequest('/users/profile', {
            method: "GET",
        });
    },

    // به‌روزرسانی پروفایل کاربر
    updateUserProfile: async (data: any): Promise<User> => {
        return apiRequest('/users/profile', {
            method: "PUT",
            data,
        });
    },

    // بررسی در دسترس بودن نام کاربری
    checkUsernameAvailability: async (username: string, userId?: string): Promise<{ available: boolean }> => {
        const queryParams = new URLSearchParams();
        queryParams.append('username', username);
        if (userId) queryParams.append('userId', userId);

        return apiRequest(`/users/check-username?${queryParams.toString()}`, {
            method: "GET",
        });
    },

    // آپلود عکس پروفایل
    uploadProfileImage: async (file: File): Promise<{ profileImage: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        return apiRequest('/users/upload-profile-image', {
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

// APIهای مربوط به مدیریت مشتریان (CRM)

export const crmApi = {
    // دریافت لیست مشتریان
    getClients: async (lawyerId: string, filters?: ClientFilterDto) => {
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append('search', filters.search);
        if (filters?.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
        if (filters?.isVerified !== undefined) queryParams.append('isVerified', filters.isVerified.toString());
        if (filters?.tags && filters.tags.length > 0) {
            filters.tags.forEach(tag => queryParams.append('tags', tag));
        }

        const queryString = queryParams.toString();
        return apiRequest(`/crm/clients${queryString ? `?${queryString}` : ''}`, {
            method: "GET",
        });
    },

    // جستجوی مشتریان
    searchClients: async (lawyerId: string, query: string) => {
        return apiRequest(`/crm/clients/search?q=${query}`, {
            method: "GET",
        });
    },

    // دریافت مشتریان با مشاوره‌های آینده
    getClientsWithUpcomingConsultations: async (lawyerId: string) => {
        return apiRequest('/crm/clients/upcoming', {
            method: "GET",
        });
    },

    // دریافت آمار مشتریان
    getClientStats: async (lawyerId: string) => {
        return apiRequest('/crm/clients/stats', {
            method: "GET",
        });
    },

    // دریافت جزئیات مشتری
    getClientDetails: async (relationId: string, lawyerId: string) => {
        return apiRequest(`/crm/clients/${relationId}`, {
            method: "GET",
        });
    },

    // افزودن مشتری موجود
    addExistingClient: async (lawyerId: string, clientId: string, notes?: string) => {
        return apiRequest(`/crm/clients/existing/${clientId}`, {
            method: "POST",
            data: { notes },
        });
    },

    // ثبت‌نام مشتری جدید
    registerNewClient: async (lawyerId: string, data: CreateClientDto) => {
        return apiRequest('/crm/clients/register', {
            method: "POST",
            data,
        });
    },

    // ایجاد لینک دعوت
    createInvitationLink: async (lawyerId: string, data: InviteClientDto) => {
        return apiRequest('/crm/clients/invite', {
            method: "POST",
            data,
        });
    },

    // رزرو مشاوره برای مشتری
    bookConsultationForClient: async (lawyerId: string, data: BookConsultationForClientDto) => {
        return apiRequest('/crm/clients/book-consultation', {
            method: "POST",
            data,
        });
    },

    // بروزرسانی مشتری
    updateClient: async (relationId: string, lawyerId: string, data: UpdateClientDto) => {
        return apiRequest(`/crm/clients/${relationId}`, {
            method: "PUT",
            data,
        });
    },

    // حذف مشتری
    removeClient: async (relationId: string, lawyerId: string) => {
        return apiRequest(`/crm/clients/${relationId}`, {
            method: "DELETE",
        });
    },
};


// افزودن APIهای جستجوی وکلا

export const lawyersApi = {

     searchLawyers: async (dto: SearchLawyersDto) => {
            const queryParams = new URLSearchParams();

            if (dto.search) queryParams.append('search', dto.search);
            if (dto.province) queryParams.append('province', dto.province);
            // فیلتر city حذف شده است
            // فقط از cities استفاده می‌کنیم - حتی برای یک شهر
            if (dto.cities && dto.cities.length > 0) {
                dto.cities.forEach(city => queryParams.append('city', city));
            }
            if (dto.specialties && dto.specialties.length > 0) {
                dto.specialties.forEach(specialty => queryParams.append('specialties', specialty));
            }
            if (dto.skills && dto.skills.length > 0) {
                dto.skills.forEach(skill => queryParams.append('skills', skill));
            }
            if (dto.services && dto.services.length > 0) {
                dto.services.forEach(service => queryParams.append('services', service));
            }
            if (dto.consultationTypes && dto.consultationTypes.length > 0) {
                dto.consultationTypes.forEach(type => queryParams.append('consultationTypes', type));
            }
            if (dto.onlineOnly !== undefined) queryParams.append('onlineOnly', dto.onlineOnly.toString());
            if (dto.vipOnly !== undefined) queryParams.append('vipOnly', dto.vipOnly.toString());
            if (dto.hasPricing !== undefined) queryParams.append('hasPricing', dto.hasPricing.toString());
            if (dto.hasServices !== undefined) queryParams.append('hasServices', dto.hasServices.toString());
            if (dto.minExperience !== undefined) queryParams.append('minExperience', dto.minExperience.toString());
            if (dto.minRating !== undefined) queryParams.append('minRating', dto.minRating.toString());
            if (dto.minReviews !== undefined) queryParams.append('minReviews', dto.minReviews.toString());
            if (dto.minSuccessfulCases !== undefined) queryParams.append('minSuccessfulCases', dto.minSuccessfulCases.toString());
            if (dto.minPrice !== undefined) queryParams.append('minPrice', dto.minPrice.toString());
            if (dto.maxPrice !== undefined) queryParams.append('maxPrice', dto.maxPrice.toString());
            if (dto.sortBy) queryParams.append('sortBy', dto.sortBy);
            if (dto.sortOrder) queryParams.append('sortOrder', dto.sortOrder);
            if (dto.page !== undefined) queryParams.append('page', dto.page.toString());
            if (dto.limit !== undefined) queryParams.append('limit', dto.limit.toString());

            const queryString = queryParams.toString();
            const res=apiRequest(`/lawyers/search${queryString ? `?${queryString}` : ''}`, {
                method: "GET",
            });

            return res;
        },

        // دریافت جزئیات وکیل
        getLawyerDetails: async (accountSlug: string) => {
            return apiRequest(`/lawyers/${accountSlug}`, {
                method: "GET",
            });
        },
};