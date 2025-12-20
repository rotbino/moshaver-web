// lib/data-service/hooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from './api-service';
import {
    LawyerListItem,
    LawyerDetail,
    User,
    LoginCredentials,
    LoginResponse,
    RegistrationData,
    GetLawyersParams,
    ProvinceData,
    BaseService,
    LawyersFilter,
    SortOrder,
    RegistrationStep1Data,
    RegistrationStep2Data,
    RegistrationStep3Data,
    LawyerSortBy,
    ApiError,
    PaginatedResponse,
    Lawyer,
    Specialty,
    Skill,
    LicenseType,
    Province
} from './types';
import {useEffect, useState} from "react";
import {logout, setAccessToken, setUser} from "@/lib/store/slices/authSlice";
import {toast} from "@/lib/hooks/app-toast";
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "next/navigation";
import {RootState} from "@/lib/store/store";

// *******************************
// ***** AUTH HOOKS *****
// *******************************

export const useLogin = () => {
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => apiService.auth.login(credentials),
        onSuccess: (data: LoginResponse) => {
            // ذخیره اطلاعات کاربر در استور
            dispatch(setUser(data.user));
            // ذخیره توکن در استور
            dispatch(setAccessToken(data.token));

            // نمایش پیام موفقیت
            toast.success("ورود با موفقیت انجام شد");
        },
        onError: (error: ApiError) => {
            // استخراج اطلاعات خطا از شیء خطا
            const errorMessage = error?.message || 'خطا در ورود به سیستم';
            const errorCode = error?.code || 500;
            const errorKey = error?.key || 'UNKNOWN_ERROR';

            // نمایش پیام خطا با جزئیات بیشتر
            toast.error(`${errorMessage} (کد خطا: ${errorCode})`);

            console.error('Login error:', error);
        }
    });
};

export const useLogout = () => {
    const dispatch = useDispatch();

    return useMutation({
        mutationFn: () => apiService.auth.logout(),
        onSuccess: () => {
            // پاک کردن اطلاعات کاربر از استور
            dispatch(logout());

            // نمایش پیام موفقیت
            toast.success("خروج از سیستم با موفقیت انجام شد");
        },
        onError: (error: ApiError) => {
            // نمایش پیام خطا
            toast.error(error.message || 'خطا در خروج از سیستم');
        }
    });
};

export const useAuth = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const isLoading = useSelector((state: RootState) => state.auth.isLoading);

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // بررسی می‌کنیم که آیا اطلاعات احراز هویت از persist بارگذاری شده است
        setIsInitialized(true);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        toast.success("خروج از سیستم با موفقیت انجام شد");
        router.push('/login');
    };

    return {
        user,
        isAuthenticated,
        accessToken,
        isLoading,
        isInitialized,
        logout: handleLogout
    };
};

// *******************************
// ***** REGISTRATION HOOKS *****
// *******************************

export const useSendVerificationCode = () => {
    return useMutation({
        mutationFn: (mobile: string) => apiService.registration.sendVerificationCode(mobile),
        onSuccess: (data: { success: boolean; message: string }) => {
            toast.success(data.message);
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در ارسال کد تایید');
        }
    });
};

export const useVerifyCode = () => {
    return useMutation({
        mutationFn: ({ mobile, code }: { mobile: string; code: string }) =>
            apiService.registration.verifyCode(mobile, code),
        onSuccess: (data: { success: boolean; verified: boolean }) => {
            toast.success("کد تایید با موفقیت تأیید شد");
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'کد تایید معتبر نیست');
        }
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RegistrationData) => apiService.registration.register(data),
        onSuccess: (data: User) => {
            // به‌روزرسانی کش کاربران
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success("ثبت نام با موفقیت انجام شد");
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در ثبت نام');
        }
    });
};

// *******************************
// ***** FORGOT PASSWORD HOOKS *****
// *******************************

export const useSendResetCode = () => {
    return useMutation({
        mutationFn: (mobile: string) => apiService.forgotPassword.sendResetCode(mobile),
        onSuccess: (data: { success: boolean; message: string }) => {
            toast.success(data.message);
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در ارسال کد بازیابی');
        }
    });
};

export const useVerifyResetCode = () => {
    return useMutation({
        mutationFn: ({ mobile, code }: { mobile: string; code: string }) =>
            apiService.forgotPassword.verifyResetCode(mobile, code),
        onSuccess: (data: { success: boolean; verified: boolean }) => {
            toast.success("کد تایید با موفقیت تأیید شد");
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'کد تایید معتبر نیست');
        }
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ mobile, newPassword }: { mobile: string; newPassword: string }) =>
            apiService.forgotPassword.resetPassword(mobile, newPassword),
        onSuccess: (data: { success: boolean; message: string }) => {
            toast.success(data.message);
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در تغییر رمز عبور');
        }
    });
};


// *******************************
// ***** PROFILE HOOKS *****
// *******************************

export const useProfile = (userId: string) => {
    const { accessToken } = useAuth();
    return useQuery({
        queryKey: ['profile', userId],
        queryFn: () => apiService.profile.getProfile(userId),
        enabled: !!userId && !!accessToken,
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در دریافت اطلاعات پروفایل');
        }
    });
};

export const useUploadProfileImage = () => {
    return useMutation({
        mutationFn: ({ userId, file }: { userId: string; file: File }) =>
            apiService.profile.uploadProfileImage(userId, file),
        onSuccess: (data: { fileId: string; downloadUrl: string }) => {
            toast.success("تصویر پروفایل با موفقیت آپلود شد");
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در آپلود تصویر پروفایل');
        }
    });
};

export const useUpdateUserProfile = () => {
    return useMutation({
        mutationFn: ({ userId, userData }: { userId: string; userData: Partial<User> }) =>
            apiService.profile.updateUserProfile(userId, userData),
        onSuccess: (data: User) => {
            toast.success("پروفایل با موفقیت به‌روزرسانی شد");
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در به‌روزرسانی پروفایل');
        }
    });
};

export const useUpdateLawyerProfile = () => {
    return useMutation({
        mutationFn: ({ userId, lawyerData }: { userId: string; lawyerData: Partial<Lawyer> }) =>
            apiService.profile.updateLawyerProfile(userId, lawyerData),
        onSuccess: (data: Lawyer) => {
            toast.success("پروفایل وکیل با موفقیت به‌روزرسانی شد");
        },
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در به‌روزرسانی پروفایل وکیل');
        }
    });
};

// *******************************
// ***** LAWYERS HOOKS *****
// *******************************

export const useLawyers = (
    params?: GetLawyersParams,
    options?: {
        onSuccess?: (data: PaginatedResponse<LawyerListItem>) => void;
        onError?: (error: ApiError) => void;
        enabled?: boolean;
    }
) => {
    return useQuery<PaginatedResponse<LawyerListItem>, ApiError>({
        queryKey: ['lawyers', params],
        queryFn: () => apiService.lawyers.getAll(params || {}),
        ...options,
        // اطمینان از فعال بودن کوئری به صورت پیش‌فرض
        enabled: options?.enabled !== false
    });
};

export const useLawyer = (id: string) => {
    return useQuery({
        queryKey: ['lawyer', id],
        queryFn: () => apiService.lawyers.getById(id),
        enabled: !!id,
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در دریافت اطلاعات وکیل');
        }
    });
};

export const useLawyerByUsername = (username: string) => {
    return useQuery({
        queryKey: ['lawyer', username],
        queryFn: () => apiService.lawyers.getByUsername(username),
        enabled: !!username,
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در دریافت اطلاعات وکیل');
        }
    });
};

// *******************************
// ***** STATIC DATA HOOKS *****
// *******************************

export const useProvinces = () => {
    return useQuery({
        queryKey: ['provinces'],
        queryFn: () => apiService.staticData.getProvinces(),
        staleTime: Infinity,
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در دریافت لیست استان‌ها');
        }
    });
};

export const useBaseServices = () => {
    return useQuery({
        queryKey: ['baseServices'],
        queryFn: () => apiService.staticData.getBaseServices(),
        staleTime: Infinity,
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در دریافت لیست خدمات');
        }
    });
};

export const useSpecialties = () => {
    return useQuery({
        queryKey: ['specialties'],
        queryFn: () => apiService.staticData.getSpecialties(),
        staleTime: Infinity,
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در دریافت لیست تخصص‌ها');
        }
    });
};

export const useSkills = () => {
    return useQuery({
        queryKey: ['skills'],
        queryFn: () => apiService.staticData.getSkills(),
        staleTime: Infinity,
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در دریافت لیست مهارت‌ها');
        }
    });
};


//هوک برای گرفتن مهارتهای دسته بندی شده

export const useSkillsWithCategories = () => {
    return useQuery({
        queryKey: ['skillsWithCategories'],
        queryFn: () => apiService.staticData.getSkillsWithCategories(),
        staleTime: Infinity,
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در دریافت لیست مهارت‌ها');
        }
    });
};
export const useLicenseTypes = () => {
    return useQuery({
        queryKey: ['licenseTypes'],
        queryFn: () => apiService.staticData.getLicenseTypes(),
        staleTime: Infinity,
        onError: (error: ApiError) => {
            toast.error(error.message || 'خطا در دریافت لیست انواع پروانه وکالت');
        }
    });
};

// *******************************
// ***** FILTER HOOKS *****
// *******************************

export const useLawyersFilter = () => {
    const [filters, setFilters] = useState<LawyersFilter>({});
    const [sort, setSort] = useState({
        sortBy: LawyerSortBy.RATING,
        sortOrder: SortOrder.DESC
    });
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 12
    });

    const { data, isLoading, error } = useLawyers({ filters, sort, pagination });

    return {
        // داده‌ها
        lawyers: data?.items || [],
        total: data?.total || 0,
        isLoading,
        error,

        // فیلترها
        filters,
        setFilters,

        // سورت
        sort,
        setSort,

        // صفحه‌بندی
        pagination,
        setPagination,

        // توابع کمکی
        updateFilter: (key: keyof LawyersFilter, value: any) => {
            setFilters(prev => ({ ...prev, [key]: value }));
            setPagination(prev => ({ ...prev, page: 1 })); // بازگشت به صفحه اول
        },

        clearFilters: () => {
            setFilters({});
            setPagination(prev => ({ ...prev, page: 1 }));
        },

        // تغییر صفحه
        goToPage: (page: number) => {
            setPagination(prev => ({ ...prev, page }));
        }
    };
};