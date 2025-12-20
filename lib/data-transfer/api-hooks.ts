// src/lib/data-transfer/api-hooks.ts

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    authApi,
    dashboardApi,
    timeManagementApi,
    pricingApi,
    consultationsApi,
    servicesApi,
    usersApi,
    crmApi, lawyersApi
} from "./api";
import {
    RegisterStep1Dto,
    VerifyOtpDto,
    CompleteRegistrationDto,
    LoginDto,
    RefreshTokenDto,
    User,
    LawyerProfile,
    Tokens,
    UserInfoDto,
    LawyerInfoDto,
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
    CreateServiceDto,
    UpdateServiceDto,
    UpdateOrderDto,
    CreateOrderDto,
    ClientStats,
    ClientDetails,
    UpdateClientDto,
    SearchLawyersDto,
    LawyersResponse,
    ClientFilterDto,
    CreateClientDto,
    InviteClientDto, BookConsultationForClientDto,

} from "./types";
import {
    ClientSource,
    ConsultationDuration,
    ConsultationType,
   Skill, skillTitlesWithCategories, Specialty
} from "@/lib/data-transfer/data-types";
import {useAppSelector} from "@/lib/store/hooks";
import {RootState} from "@/lib/store/store";
import {toast} from "@/lib/hooks/app-toast";
import {IranProvinces} from "@/lib/data-transfer/data/Iran-provice";
import {IranCities} from "@/lib/data-transfer/data/Iran-cities";


export const useAuth = () => {

    const useCurrentUser = () => {
        let data=useAppSelector((state: RootState) => state.auth.user);
        return data?.user
    };
    // ثبت‌نام مرحله 1
    const useRegisterStep1 = () => {
        return useMutation({
            mutationFn: (data: RegisterStep1Dto) => authApi.registerStep1(data),
        });
    };

    // ثبت‌نام مرحله 2
    const useRegisterStep2 = () => {
        return useMutation({
            mutationFn: (data: VerifyOtpDto) => authApi.registerStep2(data),
        });
    };

    // ثبت‌نام مرحله 3
    const useRegisterStep3 = () => {
        return useMutation({
            mutationFn: ({ registrationToken, data }: { registrationToken: string; data: CompleteRegistrationDto }) =>
                authApi.registerStep3(registrationToken, data),
        });
    };

    // بررسی در دسترس بودن نام کاربری
    const useCheckUsername = () => {
        return useMutation({
            mutationFn: ({ username, accountSlug }: { username: string; accountSlug?: string }) =>
                authApi.checkUsernameAvailability(username, accountSlug),
        });
    };

    // ارسال مجدد کد
    const useResendCode = () => {
        return useMutation({
            mutationFn: (mobile: string) => authApi.resendCode(mobile),
        });
    };

    const useLogin = () => {
        return useMutation({
            mutationFn: (data: LoginDto) => authApi.login(data),
        });
    };

    // تازه‌سازی توکن
    const useRefreshToken = () => {
        return useMutation({
            mutationFn: (data: RefreshTokenDto) => authApi.refreshToken(data),
        });
    };

    // خروج
    const useLogout = () => {
        return useMutation({
            mutationFn: () => authApi.logout(),
        });
    };

    // دریافت اطلاعات پنل کاربر
    const usePanelData = () => {
        return useQuery<DashboardResponseDto>({
            queryKey: ["panel-data"],
            queryFn: () => authApi.getPanelData(),
            enabled: false,
        });
    };

    // دریافت پروفایل کاربر
    const useProfile = () => {
        return useQuery<User>({
            queryKey: ["profile"],
            queryFn: () => authApi.getProfile().then(res => res.data),
        });
    };


// دریافت پروفایل وکیل
    const useLawyerProfile = () => {
        return useQuery<LawyerProfile>({
            queryKey: ["lawyer-profile"],
            queryFn: () => {
                return authApi.getLawyerProfile().then(res => {
                    // اگر data وجود نداشت، خطا بده تا React Query آن را مدیریت کند
                    if (!res.data) {
                        throw new Error('Profile data is missing');
                    }
                    return res.data;
                });
            },
        });
    };

    // بروزرسانی پروفایل وکیل
    const useUpdateLawyerProfile = () => {
        return useMutation({
            mutationFn: (data: Partial<LawyerInfoDto>) => authApi.updateLawyerProfile(data),
        });
    };

    // تغییر رمز عبور
    const useChangePassword = () => {
        return useMutation({
            mutationFn: (data: { currentPassword: string; newPassword: string }) =>
                authApi.changePassword(data),
        });
    };

    // فراموشی رمز عبور
    const useForgotPassword = () => {
        return useMutation({
            mutationFn: (mobile: string) => authApi.forgotPassword(mobile),
        });
    };

    // بازنشانی رمز عبور
    const useResetPassword = () => {
        return useMutation({
            mutationFn: (data: { mobile: string; code: string; newPassword: string }) =>
                authApi.resetPassword(data),
        });
    };

    return {
        useRegisterStep1,
        useRegisterStep2,
        useRegisterStep3,
        useCheckUsername,
        useResendCode,
        useLogin,
        useRefreshToken,
        useLogout,
        usePanelData,
        useProfile,
        useLawyerProfile,
        useUpdateLawyerProfile,
        useChangePassword,
        useForgotPassword,
        useResetPassword,
        useCurrentUser,
    };
};

// هوک‌های مربوط به داشبورد
export const useDashboard = () => {
    // دریافت اطلاعات داشبورد کاربر عادی
    const useUserDashboard = () => {
        return useQuery({
            queryKey: ["user-dashboard"],
            queryFn: () => dashboardApi.getUserDashboard(),
        });
    };

    // دریافت اطلاعات داشبورد وکیل
    const useLawyerDashboard = () => {
        return useQuery({
            queryKey: ["lawyer-dashboard"],
            queryFn: () => dashboardApi.getLawyerDashboard(),
        });
    };

    return {
        useUserDashboard,
        useLawyerDashboard,
    };
};

// هوک‌های مربوط به مدیریت زمان
export const useTimeManagement = () => {
// بررسی سریع وضعیت ساعات کاری
    const useGetWorkingHoursCount = () => {
        return useQuery({
            queryKey: ["check-working-hours"],
            queryFn: () => timeManagementApi.getUserWorkingHoursCount(),
        });
    };
    // دریافت زمان‌های مشاوره
    const useTimeSlots = (params?: {
        date?: string;
        startDate?: string;
        endDate?: string;
        isAvailable?: boolean;
    }) => {
        return useQuery<TimeSlotsResponse>({ // ✅ تغییر تایپ
            queryKey: ["time-slots", params],
            queryFn: () => timeManagementApi.getTimeSlots(params),
        });
    };

// ✅ هوک جدید برای استفاده راحت‌تر
    const useTimeSlotsData = (params?: any) => {
        const { data, isLoading, error } = useTimeSlots(params);

        // دسترسی‌های راحت
        const timeSlots = data?.timeSlots || [];
        const groupedByDate = data?.groupedByDate || {};
        const summary = data?.summary;

        // منطق isManuallyNonHoliday اصلاح شده
        const isManuallyNonHoliday = (dateString: string) => {
            return timeSlots.some(slot => {
                const slotDateOnly = new Date(slot.date).toISOString().split('T')[0];
                return slotDateOnly === dateString && slot.status === 'AVAILABLE'; // ✅ مستقیماً string
            });
        };

        return {
            data,           // کل پاسخ
            timeSlots,      // فقط آرایه
            groupedByDate,  // گروه‌بندی شده
            summary,        // آمار
            isManuallyNonHoliday, // تابع کمکی
            isLoading,
            error
        };
    };

    // ایجاد زمان مشاوره جدید
    const useCreateTimeSlot = () => {
        return useMutation({
            mutationFn: (data: CreateTimeSlotDto) => timeManagementApi.createTimeSlot(data),
        });
    };

    // به‌روزرسانی زمان مشاوره
    const useUpdateTimeSlot = () => {
        return useMutation({
            mutationFn: ({ timeSlotId, data }: { timeSlotId: string; data: UpdateTimeSlotDto }) =>
                timeManagementApi.updateTimeSlot(timeSlotId, data),
        });
    };

    // حذف زمان مشاوره
    const useDeleteTimeSlot = () => {
        return useMutation({
            mutationFn: (timeSlotId: string) => timeManagementApi.deleteTimeSlot(timeSlotId),
        });
    };

    // ایجاد دسته‌ای زمان‌ها
    const useCreateTimeSlotsBatch = () => {
        return useMutation({
            mutationFn: (slots: CreateTimeSlotDto[]) => timeManagementApi.createTimeSlotsBatch(slots),
        });
    };

    // دریافت قالب هفتگی
    const useWeeklyTemplate = () => {
        return useQuery<WeeklyTemplate>({
            queryKey: ["weekly-template"],
            queryFn: () => timeManagementApi.getWeeklyTemplate(),
        });
    };

    // ذخیره قالب هفتگی
    const useSaveWeeklyTemplate = () => {
        return useMutation({
            mutationFn: (template: Record<string, any>) => timeManagementApi.saveWeeklyTemplate(template),
        });
    };

    // اعمال قالب به بازه زمانی
    const useApplyTemplateToRange = () => {
        return useMutation({
            mutationFn: ({ startDate, endDate, overwrite }: {
                startDate: string;
                endDate: string;
                overwrite?: boolean
            }) => timeManagementApi.applyTemplateToRange(startDate, endDate, overwrite),
        });
    };

    // بررسی وضعیت دسترسی
    const useCheckAvailability = (date: string) => {
        return useQuery({
            queryKey: ["availability", date],
            queryFn: () => timeManagementApi.checkAvailability(date),
            enabled: !!date,
        });
    };

    return {
        useTimeSlots,
        useCreateTimeSlot,
        useUpdateTimeSlot,
        useDeleteTimeSlot,
        useCreateTimeSlotsBatch,
        useWeeklyTemplate,
        useSaveWeeklyTemplate,
        useApplyTemplateToRange,
        useCheckAvailability,
        useTimeSlotsData,
        useGetWorkingHoursCount,
    };
};

// هوک‌های مربوط به قیمت‌گذاری
// هوک‌های مربوط به قیمت‌گذاری
export const usePricing = () => {
    // بررسی سریع وضعیت قیمت‌گذاری
    const useGetUserPricingCount = () => {
        return useQuery({
            queryKey: ["check-pricing"],
            queryFn: () => pricingApi.getUserPricingCount(),
        });
    };

    // دریافت همه قیمت‌های وکیل
    const usePricings = () => {
        return useQuery<Pricing[]>({
            queryKey: ["pricings"],
            queryFn: () => pricingApi.getPricings(),
        });
    };

    // دریافت قیمت خاص
    const usePricing = (consultationType: ConsultationType, duration: ConsultationDuration) => {
        return useQuery<Pricing>({
            queryKey: ["pricing", consultationType, duration],
            queryFn: () => pricingApi.getPricing(consultationType, duration),
            enabled: !!consultationType && !!duration,
        });
    };

    // ایجاد قیمت جدید
    const useCreatePricing = () => {
        return useMutation({
            mutationFn: (data: CreatePricingDto) => pricingApi.createPricing(data),
        });
    };

    // ایجاد دسته‌ای قیمت‌ها
    const useBulkCreatePricings = () => {
        return useMutation({
            mutationFn: (pricings: CreatePricingDto[]) => pricingApi.bulkCreatePricings(pricings),
        });
    };

    // به‌روزرسانی قیمت
    const useUpdatePricing = () => {
        return useMutation({
            mutationFn: ({ consultationType, duration, data }: {
                consultationType: ConsultationType;
                duration: ConsultationDuration;
                data: UpdatePricingDto
            }) => pricingApi.updatePricing(consultationType, duration, data),
        });
    };

    // حذف قیمت
    const useDeletePricing = () => {
        return useMutation({
            mutationFn: ({ consultationType, duration }: { consultationType: ConsultationType; duration: ConsultationDuration }) =>
                pricingApi.deletePricing(consultationType, duration),
        });
    };

    // محاسبه قیمت نهایی با تخفیف
    const useCalculatePrice = (consultationType: ConsultationType, duration: ConsultationDuration) => {
        return useQuery({
            queryKey: ["calculate-price", consultationType, duration],
            queryFn: () => pricingApi.calculatePrice(consultationType, duration),
            enabled: !!consultationType && !!duration,
        });
    };

    return {
        usePricings,
        usePricing,
        useCreatePricing,
        useBulkCreatePricings,
        useUpdatePricing,
        useDeletePricing,
        useCalculatePrice,
        useGetUserPricingCount,
    };
};

// هوک‌های مربوط به مشاوره‌ها
export const useConsultations = () => {
    // دریافت مشاوره‌های کاربر
    const useUserConsultations = (params?: { status?: string; lawyerId?: string }) => {
        return useQuery<Consultation[]>({
            queryKey: ["user-consultations", params],
            queryFn: () => consultationsApi.getUserConsultations(params),
        });
    };

    // دریافت مشاوره‌های وکیل
    const useLawyerConsultations = (params?: { status?: string; date?: string }) => {
        return useQuery<Consultation[]>({
            queryKey: ["lawyer-consultations", params],
            queryFn: () => consultationsApi.getLawyerConsultations(params),
        });
    };

    // ایجاد مشاوره جدید
    const useCreateConsultation = () => {
        return useMutation({
            mutationFn: (data: CreateConsultationDto) => consultationsApi.createConsultation(data),
        });
    };

    // ایجاد مشاوره توسط وکیل برای مشتری
    const useCreateConsultationByLawyer = () => {
        return useMutation({
            mutationFn: (data: CreateConsultationByLawyerDto) => consultationsApi.createConsultationByLawyer(data),
        });
    };

    // دریافت جزئیات مشاوره
    const useConsultationDetails = (id: string) => {
        return useQuery<Consultation>({
            queryKey: ["consultation-details", id],
            queryFn: () => consultationsApi.getConsultationDetails(id),
            enabled: !!id,
        });
    };

    // لغو مشاوره
    const useCancelConsultation = () => {
        return useMutation({
            mutationFn: (id: string) => consultationsApi.cancelConsultation(id),
        });
    };

    // تکمیل مشاوره
    const useCompleteConsultation = () => {
        return useMutation({
            mutationFn: (id: string) => consultationsApi.completeConsultation(id),
        });
    };

    return {
        useUserConsultations,
        useLawyerConsultations,
        useCreateConsultation,
        useCreateConsultationByLawyer,
        useConsultationDetails,
        useCancelConsultation,
        useCompleteConsultation,
    };
};


//####################city province skills##########################

// هوک برای دریافت لیست استان‌ها و شهرها
export const useProvinces = () => {
    return useQuery({
        queryKey: ['provinces'],
        queryFn: () => Promise.resolve(IranProvinces),
        staleTime: Infinity, // داده‌های استاتیک، نیازی به refresh ندارند
    });
};

// هوک برای دریافت لیست تخصص‌ها (از enum Specialty)
export const useSpecialties = () => {
    return useQuery({
        queryKey: ['specialties'],
        queryFn: () => Promise.resolve(Object.values(Specialty)),
        staleTime: Infinity,
    });
};
// هوک جدید برای دریافت شهرهای یک استان
export const useCitiesProvince = (provinceCode: string) => {
    return useQuery({
        queryKey: ['cities', provinceCode],
        queryFn: () => {
            const province = IranProvinces.find(p => p.id === provinceCode);
            return province ? province.children : [];
        },
        enabled: !!provinceCode,
        staleTime: Infinity,
    });
};
// هوک جدید برای دریافت لیست شهرها
export const useCities = () => {
    return useQuery({
        queryKey: ['cities'],
        queryFn: () => Promise.resolve(IranCities),
        staleTime: Infinity,
    });
};
// هوک برای دریافت لیست مهارت‌ها (از enum Skill)
export const useSkills = () => {
    return useQuery({
        queryKey: ['skills'],
        queryFn: () => Promise.resolve(Object.values(Skill)),
        staleTime: Infinity,
    });
};

// هوک برای دریافت مهارت‌ها با دسته‌بندی (از داده‌های موجود)
export const useSkillsWithCategories = () => {
    return useQuery({
        queryKey: ['skills-with-categories'],
        queryFn: () => Promise.resolve(skillTitlesWithCategories),
        staleTime: Infinity,
    });
};



// ==================== هوک‌های مدیریت خدمات وکیل (Service) ====================

export const useLawyerProducts = (isActive?: boolean) => {
    return useQuery({
        queryKey: ["lawyer-products", isActive],
        queryFn: () => servicesApi.getLawyerProducts(isActive),
    });
};

export const useAllLawyerProducts = () => {
    return useQuery({
        queryKey: ["all-lawyer-products"],
        queryFn: () => servicesApi.getAllLawyerProducts(),
    });
};

export const useCreateProduct = () => {
    return useMutation({
        mutationFn: (data: CreateServiceDto) =>
            servicesApi.createProduct(data),
    });
};

export const useUpdateProduct = () => {
    return useMutation({
        mutationFn: ({ serviceId, data }: { serviceId: string; data: UpdateServiceDto }) =>
            servicesApi.updateProduct(serviceId, data),
    });
};

// در فایل api-hooks.ts

export const useDeactivateProduct = () => {
    return useMutation({
        mutationFn: (serviceId: string) =>
            servicesApi.deactivateProduct(serviceId),
    });
};

export const useActivateProduct = () => {
    return useMutation({
        mutationFn: (serviceId: string) =>
            servicesApi.activateProduct(serviceId),
    });
};

export const useDeleteProduct = () => {
    return useMutation({
        mutationFn: (serviceId: string) =>
            servicesApi.deleteProduct(serviceId),
    });
};

export const useBulkUpsertProducts = () => {
    return useMutation({
        mutationFn: (services: any[]) =>
            servicesApi.bulkUpsertProducts(services),
    });
};

export const useActiveProductsCount = () => {
    return useQuery({
        queryKey: ["active-products-count"],
        queryFn: () => servicesApi.getActiveProductsCount(),
    });
};

export const useProductStatus = (serviceId: string) => {
    return useQuery({
        queryKey: ["product-status", serviceId],
        queryFn: () => servicesApi.getProductStatus(serviceId),
    });
};

// ==================== هوک‌های سفارشات کاربر (Buy - خریدها) ====================

export const useClientOrders = (params?: { status?: string; lawyerId?: string }) => {
    return useQuery({
        queryKey: ["client-orders", params],
        queryFn: () => servicesApi.getClientOrders(params),
    });
};

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: (data: CreateOrderDto) => servicesApi.createOrder(data),
    });
};

export const useUpdateClientOrder = () => {
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
            servicesApi.updateClientOrder(id, data),
    });
};

export const useOrderDetails = (id: string) => {
    return useQuery({
        queryKey: ["order-details", id],
        queryFn: () => servicesApi.getOrderDetails(id),
    });
};

export const useClientOrdersStats = () => {
    return useQuery({
        queryKey: ["client-orders-stats"],
        queryFn: () => servicesApi.getClientOrdersStats(),
    });
};

// ==================== هوک‌های سفارشات وکیل (Sell - فروشها) ====================

export const useLawyerSales = (params?: { status?: string; clientId?: string }) => {
    return useQuery({
        queryKey: ["lawyer-sales", params],
        queryFn: () => servicesApi.getLawyerSales(params),
    });
};

export const useUpdateLawyerSale = () => {
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
            servicesApi.updateLawyerSale(id, data),
    });
};

export const useSaleDetails = (id: string) => {
    return useQuery({
        queryKey: ["sale-details", id],
        queryFn: () => servicesApi.getSaleDetails(id),
    });
};

export const useLawyerSalesStats = () => {
    return useQuery({
        queryKey: ["lawyer-sales-stats"],
        queryFn: () => servicesApi.getLawyerSalesStats(),
    });
};

// هوک‌های مربوط به کاربران
export const useUsers = () => {
    // دریافت پروفایل کاربر
    const useUserProfile = () => {
        return useQuery<User>({
            queryKey: ["user-profile"],
            queryFn: () => usersApi.getUserProfile(),
        });
    };

    // به‌روزرسانی پروفایل کاربر
    const useUpdateUserProfile = () => {
        return useMutation({
            mutationFn: (data: any) => usersApi.updateUserProfile(data),
        });
    };

    // بررسی در دسترس بودن نام کاربری
    const useCheckUsernameAvailability = (username: string, userId?: string) => {
        return useQuery({
            queryKey: ["check-username", username, userId],
            queryFn: () => usersApi.checkUsernameAvailability(username, userId),
            enabled: !!username,
        });
    };

    // آپلود عکس پروفایل
    const useUploadProfileImage = () => {
        return useMutation({
            mutationFn: (file: File) => usersApi.uploadProfileImage(file),
        });
    };

    return {
        useUserProfile,
        useUpdateUserProfile,
        useCheckUsernameAvailability,
        useUploadProfileImage,
    };
};

// هوک‌های مربوط به مدیریت مشتریان (CRM)
export const useCRM = () => {
    // دریافت لیست مشتریان
    const useClients = (filters?: ClientFilterDto) => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useQuery<LawyerClient[]>({
            queryKey: ["lawyer-clients", filters],
            queryFn: () => crmApi.getClients(lawyerProfile?.id || '', filters),
            enabled: !!lawyerProfile?.id,
        });
    };

    // جستجوی مشتریان
    const useSearchClients = (query: string) => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useQuery<LawyerClient[]>({
            queryKey: ["search-clients", query],
            queryFn: () => crmApi.searchClients(lawyerProfile?.id || '', query),
            enabled: !!lawyerProfile?.id && !!query,
        });
    };

    // دریافت مشتریان با مشاوره‌های آینده
    const useClientsWithUpcomingConsultations = () => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useQuery<any[]>({
            queryKey: ["clients-upcoming"],
            queryFn: () => crmApi.getClientsWithUpcomingConsultations(lawyerProfile?.id || ''),
            enabled: !!lawyerProfile?.id,
        });
    };

    // دریافت آمار مشتریان
    const useClientStats = () => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useQuery<ClientStats>({
            queryKey: ["client-stats"],
            queryFn: () => crmApi.getClientStats(lawyerProfile?.id || ''),
            enabled: !!lawyerProfile?.id,
        });
    };

    // دریافت جزئیات مشتری
    const useClientDetails = (relationId: string) => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useQuery<ClientDetails>({
            queryKey: ["client-details", relationId],
            queryFn: () => crmApi.getClientDetails(relationId, lawyerProfile?.id || ''),
            enabled: !!lawyerProfile?.id && !!relationId,
        });
    };

    // افزودن مشتری موجود
    const useAddExistingClient = () => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useMutation({
            mutationFn: ({ clientId, notes }: { clientId: string; notes?: string }) =>
                crmApi.addExistingClient(lawyerProfile?.id || '', clientId, notes),
        });
    };

    // ثبت‌نام مشتری جدید
    const useRegisterNewClient = () => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useMutation({
            mutationFn: (data: CreateClientDto) =>
                crmApi.registerNewClient(lawyerProfile?.id || '', data),
        });
    };

    // ایجاد لینک دعوت
    const useCreateInvitationLink = () => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useMutation({
            mutationFn: (data: InviteClientDto) =>
                crmApi.createInvitationLink(lawyerProfile?.id || '', data),
        });
    };

    // رزرو مشاوره برای مشتری
    const useBookConsultationForClient = () => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useMutation({
            mutationFn: (data: BookConsultationForClientDto) =>
                crmApi.bookConsultationForClient(lawyerProfile?.id || '', data),
        });
    };

    // بروزرسانی مشتری
    const useUpdateClient = () => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useMutation({
            mutationFn: ({ relationId, data }: { relationId: string; data: UpdateClientDto }) =>
                crmApi.updateClient(relationId, lawyerProfile?.id || '', data),
        });
    };

    // حذف مشتری
    const useRemoveClient = () => {
        const { data: lawyerProfile } = useAuth().useLawyerProfile();
        return useMutation({
            mutationFn: (relationId: string) =>
                crmApi.removeClient(relationId, lawyerProfile?.id || ''),
        });
    };

    return {
        useClients,
        useSearchClients,
        useClientsWithUpcomingConsultations,
        useClientStats,
        useClientDetails,
        useAddExistingClient,
        useRegisterNewClient,
        useCreateInvitationLink,
        useBookConsultationForClient,
        useUpdateClient,
        useRemoveClient,
    };
};



// هوک‌های مربوط به جستجوی وکلا


export const useLawyers = (params: SearchLawyersDto, options?: any) => {
    return useQuery<LawyersResponse>({
        queryKey: ["lawyers", params],
        queryFn: () => lawyersApi.searchLawyers(params),
        ...options,
    });
};


export const useLawyerDetails = (accountSlug: string) => {
    return useQuery({
        queryKey: ["lawyer-details", accountSlug],
        queryFn: () => lawyersApi.getLawyerDetails(accountSlug),
        enabled: !!accountSlug,
    });
};