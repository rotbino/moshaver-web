// lib/data-service/api-service.ts

import {
    Lawyer,
    LawyerListItem,
    LawyerDetail,
    User,
    LoginCredentials,
    LoginResponse,
    LawyersFilter,
    LawyerSortBy,
    SortOrder,
    GetLawyersParams,
    PaginatedResponse,
    ApiResponse,
    RegistrationData,
    ProvinceData,
    BaseService,
    ConsultationType,
    ConsultationDuration,
    RegistrationStep1Data,
    RegistrationStep2Data,
    RegistrationStep3Data,
    UserRole,
    ApiError,
    Specialty,
    Skill,
    LicenseType,
    Province
} from './types';

import {
    lawyersData,
    usersData,
    lawyerDetailsData,
    lawyerListItemsData,
    provincesData,
    baseServices,
    sampleRegistrationData, specialtyTitles, skillTitles, skillCategories, skillsWithCategories
} from './mockData';

// Helper functions for localStorage
export const getStorageData = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error getting data from localStorage for key ${key}:`, error);
        return defaultValue;
    }
};

export const setStorageData = <T,>(key: string, data: T): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error setting data to localStorage for key ${key}:`, error);
    }
};

// Mock API functions
export const apiService = {
    // ==================== Auth API ====================
    auth: {
        login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
            await new Promise(resolve => setTimeout(resolve, 500));

            // پیدا کردن کاربر در لیست کاربران
            const user = usersData.find(u => u.mobile === credentials.mobile);

            if (user && credentials.password === '111111') {
                // اگر کاربر وکیل است، اطلاعات کامل وکیل را برگردان
                if (user.role === UserRole.LAWYER) {
                    const lawyer = lawyersData.find(l => l.id === user.id);
                    if (lawyer) {
                        return {
                            user: lawyer, // برگرداندن اطلاعات کامل وکیل
                            token: 'mock-jwt-token'
                        };
                    }
                }

                // برای کاربران عادی، اطلاعات کاربر عادی را برگردان
                return {
                    user,
                    token: 'mock-jwt-token'
                };
            }

            // پرتاب خطا با ساختار مشخص
            const error: ApiError = {
                code: 401,
                key: 'AUTH_INVALID_CREDENTIALS',
                message: 'شماره همراه یا رمز عبور اشتباه است'
            };
            throw error;
        },

        logout: async (): Promise<boolean> => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return true;
        },

    },
    forgotPassword: {
        // مرحله 1: ارسال کد تایید به موبایل
        sendResetCode: async (mobile: string): Promise<{ success: boolean; message: string }> => {
            await new Promise(resolve => setTimeout(resolve, 500));

            // شبیه‌سازی ارسال کد تایید
            console.log(`Sending reset code to ${mobile}`);

            return {
                success: true,
                message: `کد تایید به شماره ${mobile} ارسال شد`
            };
        },

        // مرحله 2: تایید کد ارسال شده
        verifyResetCode: async (mobile: string, code: string): Promise<{ success: boolean; verified: boolean }> => {
            await new Promise(resolve => setTimeout(resolve, 500));

            // در محیط توسعه، کد 12345 همیشه معتبر است
            const isValid = code === '12345';

            if (isValid) {
                return {
                    success: true,
                    verified: true
                };
            }

            const error: ApiError = {
                code: 400,
                key: 'INVALID_VERIFICATION_CODE',
                message: 'کد تایید معتبر نیست'
            };
            throw error;
        },

        // مرحله 3: تغییر رمز عبور
        resetPassword: async (mobile: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
            await new Promise(resolve => setTimeout(resolve, 500));

            // شبیه‌سازی تغییر رمز عبور
            // در واقعیت اینجا رمز عبور کاربر در دیتابیس آپدیت می‌شود
            console.log(`Resetting password for ${mobile}`);

            return {
                success: true,
                message: "رمز عبور شما با موفقیت تغییر کرد"
            };
        }
    },
    // ==================== Registration API ====================
    registration: {
        // مرحله 1: ارسال کد تایید
        sendVerificationCode: async (mobile: string): Promise<{ success: boolean; message: string }> => {
            await new Promise(resolve => setTimeout(resolve, 500));

            // شبیه‌سازی ارسال کد تایید
            console.log(`Sending verification code to ${mobile}`);

            return {
                success: true,
                message: `کد تایید به شماره ${mobile} ارسال شد`
            };
        },

        // مرحله 2: تایید کد ارسال شده
        verifyCode: async (mobile: string, code: string): Promise<{ success: boolean; verified: boolean }> => {
            await new Promise(resolve => setTimeout(resolve, 500));

            // در محیط توسعه، کد 12345 همیشه معتبر است
            const isValid = code === '12345';

            if (isValid) {
                return {
                    success: true,
                    verified: true
                };
            }

            const error: ApiError = {
                code: 400,
                key: 'INVALID_VERIFICATION_CODE',
                message: 'کد تایید معتبر نیست'
            };
            throw error;
        },

        // مرحله 3: ثبت نام نهایی
        register: async (data: RegistrationData): Promise<User> => {
            await new Promise(resolve => setTimeout(resolve, 1000));

            // ایجاد کاربر جدید
            const newUser: User = {
                id: `user_${Date.now()}`,
                username: data.step3.name.toLowerCase().replace(/\s+/g, '_'),
                name: data.step3.name,
                lastName: data.step3.lastName,
                mobile: data.step1.mobile,
                email: data.step3.email,
                role: data.step3.role,
                isActive: true,
                isVerified: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // ذخیره کاربر جدید
            const users = getStorageData<User[]>('users', []);
            const updatedUsers = [...users, newUser];
            setStorageData('users', updatedUsers);

            // اگر کاربر وکیل است، اطلاعات اضافی را هم ذخیره می‌کنیم
            if (data.step3.role === UserRole.LAWYER) {
                // اینجا می‌توان اطلاعات اضافی وکیل را هم ذخیره کرد
                // در حال حاضر فقط کاربر پایه را ایجاد می‌کنیم
            }

            return newUser;
        }
    },
    profile: {
        // دریافت اطلاعات پروفایل کاربر
        getProfile: async (userId: string): Promise<User | Lawyer> => {
            await new Promise(resolve => setTimeout(resolve, 500));

            // پیدا کردن کاربر در لیست کاربران
            const user = usersData.find(u => u.id === userId);
            if (!user) {
                const error: ApiError = {
                    code: 404,
                    key: 'USER_NOT_FOUND',
                    message: 'کاربر یافت نشد'
                };
                throw error;
            }

            // اگر کاربر وکیل است، اطلاعات کامل وکیل را برگردان
            if (user.role === UserRole.LAWYER) {
                const lawyer = lawyersData.find(l => l.id === userId);
                if (lawyer) {
                    return lawyer;
                }
            }

            // برای کاربران عادی، اطلاعات کاربر عادی را برگردان
            return user;
        },

        // آپلود تصویر پروفایل
        uploadProfileImage: async (userId: string, file: File): Promise<{ fileId: string; downloadUrl: string }> => {
            await new Promise(resolve => setTimeout(resolve, 1000));

            // شبیه‌سازی آپلود فایل و دریافت fileId
            const fileId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const downloadUrl = `https://randomuser.me/api/portraits/${userId.includes('1') ? 'men' : 'women'}/${Math.floor(Math.random() * 70) + 1}.jpg`;

            return {
                fileId,
                downloadUrl
            };
        },

        // به‌روزرسانی اطلاعات پروفایل کاربر عادی
        updateUserProfile: async (userId: string, userData: Partial<User>): Promise<User> => {
            await new Promise(resolve => setTimeout(resolve, 500));

            // پیدا کردن و به‌روزرسانی کاربر
            const userIndex = usersData.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                const error: ApiError = {
                    code: 404,
                    key: 'USER_NOT_FOUND',
                    message: 'کاربر یافت نشد'
                };
                throw error;
            }

            const updatedUser = { ...usersData[userIndex], ...userData };
            usersData[userIndex] = updatedUser;

            return updatedUser;
        },

        // به‌روزرسانی اطلاعات پروفایل وکیل
        updateLawyerProfile: async (userId: string, lawyerData: Partial<Lawyer>): Promise<Lawyer> => {
            await new Promise(resolve => setTimeout(resolve, 500));

            // پیدا کردن و به‌روزرسانی وکیل
            const lawyerIndex = lawyersData.findIndex(l => l.id === userId);
            if (lawyerIndex === -1) {
                const error: ApiError = {
                    code: 404,
                    key: 'LAWYER_NOT_FOUND',
                    message: 'وکیل یافت نشد'
                };
                throw error;
            }

            const updatedLawyer = { ...lawyersData[lawyerIndex], ...lawyerData };
            lawyersData[lawyerIndex] = updatedLawyer;

            return updatedLawyer;
        }
    },
    // ==================== Lawyers API ====================
    lawyers: {
        // دریافت لیست وکلا با فیلتر و سورت
        getAll: async (params: GetLawyersParams): Promise<PaginatedResponse<LawyerListItem>> => {
            await new Promise(resolve => setTimeout(resolve, 300));

            let mockLawyers = getStorageData<LawyerListItem[]>('lawyerListItems', lawyerListItemsData);
            let filteredLawyers = [...mockLawyers];

            // اعمال فیلترها
            if (params.filters) {
                const { filters } = params;

                // فیلتر استان
                if (filters.province) {
                    filteredLawyers = filteredLawyers.filter(lawyer =>
                        lawyer.province === filters.province
                    );
                }
                if (filters.city && Array.isArray(filters.city) && filters.city.length > 0) {
                    filteredLawyers = filteredLawyers.filter(lawyer =>
                        filters.city?.includes(lawyer.city)
                    );
                } else if (filters.city && typeof filters.city === 'string') {
                    filteredLawyers = filteredLawyers.filter(lawyer =>
                        lawyer.city === filters.city
                    );
                }
                // فیلتر تخصص (چند تخصصی) - اصلاح شده
                if (filters.specialty && Array.isArray(filters.specialty) && filters.specialty.length > 0) {
                    filteredLawyers = filteredLawyers.filter(lawyer => {
                        // بررسی تخصص اصلی وکیل
                        if (lawyer.specialty && filters.specialty.includes(lawyer.specialty)) {
                            return true;
                        }

                        // بررسی آرایه تخصص‌های وکیل
                        if (lawyer.specialties && Array.isArray(lawyer.specialties) && lawyer.specialties.length > 0) {
                            return lawyer.specialties.some(specialty => filters.specialty?.includes(specialty));
                        }

                        return false;
                    });
                }

                // فیلتر مهارت (چند مهارتی) - اصلاح شده
                if (filters.skills && Array.isArray(filters.skills) && filters.skills.length > 0) {
                    filteredLawyers = filteredLawyers.filter(lawyer =>
                        lawyer.skills && Array.isArray(lawyer.skills) &&
                        filters.skills.some(skill => lawyer.skills.includes(skill))
                    );
                }

                // فیلتر فقط آنلاین‌ها
                if (filters.onlineOnly) {
                    filteredLawyers = filteredLawyers.filter(lawyer => lawyer.isOnline);
                }

                // فیلتر جستجو
                if (filters.searchQuery) {
                    const query = filters.searchQuery.toLowerCase();
                    filteredLawyers = filteredLawyers.filter(lawyer =>
                        lawyer.fullName.toLowerCase().includes(query) ||
                        lawyer.specialties.some(s => s.toString().toLowerCase().includes(query)) ||
                        lawyer.username.toLowerCase().includes(query)
                    );
                }
            }

            // اعمال سورت
            if (params.sort) {
                const { sortBy, sortOrder } = params.sort;
                filteredLawyers.sort((a, b) => {
                    let valueA: number | string;
                    let valueB: number | string;

                    switch (sortBy) {
                        case LawyerSortBy.COMMENTS_COUNT:
                            valueA = a.commentsCount || 0;
                            valueB = b.commentsCount || 0;
                            break;
                        case LawyerSortBy.RATING:
                            valueA = a.rating;
                            valueB = b.rating;
                            break;
                        case LawyerSortBy.EXPERIENCE:
                            valueA = a.experienceYears;
                            valueB = b.experienceYears;
                            break;
                        case LawyerSortBy.PRICE_LOW:
                        case LawyerSortBy.PRICE_HIGH:
                            valueA = a.minConsultationPrice;
                            valueB = b.minConsultationPrice;
                            break;
                        case LawyerSortBy.SUCCESSFUL_CASES:
                            valueA = a.successfulCases;
                            valueB = b.successfulCases;
                            break;
                        case LawyerSortBy.VIEWS:
                            valueA = a.views;
                            valueB = b.views;
                            break;
                        default:
                            valueA = a.id;
                            valueB = b.id;
                    }

                    if (typeof valueA === 'string' && typeof valueB === 'string') {
                        return sortOrder === SortOrder.ASC
                            ? valueA.localeCompare(valueB)
                            : valueB.localeCompare(valueA);
                    }

                    return sortOrder === SortOrder.ASC
                        ? (valueA as number) - (valueB as number)
                        : (valueB as number) - (valueA as number);
                });
            }

            // صفحه‌بندی
            const page = params.pagination?.page || 1;
            const pageSize = params.pagination?.pageSize || 12;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedLawyers = filteredLawyers.slice(startIndex, endIndex);

            return {
                items: paginatedLawyers,
                total: filteredLawyers.length,
                page,
                pageSize
            };
        },

        // دریافت جزئیات وکیل
        getById: async (id: string): Promise<LawyerDetail> => {
            await new Promise(resolve => setTimeout(resolve, 200));

            const lawyer = lawyerDetailsData.find(l => l.id === id);

            if (!lawyer) {
                const error: ApiError = {
                    code: 404,
                    key: 'LAWYER_NOT_FOUND',
                    message: 'وکیل مورد نظر یافت نشد'
                };
                throw error;
            }

            return lawyer;
        },

        // دریافت وکیل بر اساس نام کاربری
        getByUsername: async (username: string): Promise<LawyerDetail> => {
            await new Promise(resolve => setTimeout(resolve, 200));

            const lawyer = lawyerDetailsData.find(l => l.username === username);

            if (!lawyer) {
                const error: ApiError = {
                    code: 404,
                    key: 'LAWYER_NOT_FOUND',
                    message: 'وکیل مورد نظر یافت نشد'
                };
                throw error;
            }

            return lawyer;
        }
    },

    // ==================== Static Data API ====================
    staticData: {
        // دریافت استان‌ها
        getProvinces: async (): Promise<ProvinceData[]> => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return provincesData;
        },

        // دریافت خدمات پایه
        getBaseServices: async (): Promise<BaseService[]> => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return baseServices;
        },

        // دریافت تخصص‌ها
        getSpecialties: async (): Promise<{ id: string; title: string }[]> => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return specialtyTitles; // استفاده از specialtyTitles تعریف شده در mockData
        },

        // دریافت مهارت‌ها
        getSkills: async (): Promise<{ id: string; title: string }[]> => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return skillTitles; // استفاده از skillTitles تعریف شده در mockData
        },
        getSkillsWithCategories: async () => {
            await new Promise(resolve => setTimeout(resolve, 100));

            // ساختار داده‌ها برای دسته‌بندی مهارت‌ها
            const categories = skillCategories.map(category => ({
                id: category.id,
                name: category.title,
                skills: skillsWithCategories
                    .filter(skill => skill.category === category.id)
                    .map(skill => ({
                        id: skill.id,
                        name: skill.title
                    }))
            }));

            return categories;
        },
        // دریافت انواع پروانه وکالت
        getLicenseTypes: async (): Promise<{ id: string; title: string }[]> => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return Object.values(LicenseType).map(value => ({
                id: value,
                title: value // در واقعیت باید یک مپ برای تبدیل enum به عنوان داشته باشیم
            }));
        }
    },

    // ==================== Utility Functions ====================
    utils: {
        // شبیه‌سازی تاخیر شبکه
        delay: (ms: number = 300): Promise<void> => {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        // شبیه‌سازی خطا
        simulateError: (message: string = 'خطای شبیه‌سازی شده'): Promise<never> => {
            return Promise.reject(new Error(message));
        }
    }
};