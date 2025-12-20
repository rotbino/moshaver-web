import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {getStorageData, mockApi} from "@/lib/api/mockApi";
import {logout, resetPersist, setUser, updateTimeSlots, updateWeeklyTemplate} from "@/lib/store/slices/authSlice";
import { TimeSlot, WeeklyTemplate } from "@/lib/api/types";
import {usersData} from "@/lib/api/mockData";

// هوک‌های داده‌های ثابت
export const useProvinces = () => {
    return useQuery({
        queryKey: ['provinces'],
        queryFn: mockApi.provinces.getAll,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

export const useSpecialties = () => {
    return useQuery({
        queryKey: ['specialties'],
        queryFn: mockApi.specialties.getAll,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};


// در lib/api/useApi.ts
// lib/api/useApi.ts

export const useConsultationOptions = (lawyerId?: string) => {
    return useQuery({
        queryKey: ['consultationOptions', lawyerId],
        queryFn: () => mockApi.consultationOptions.getForLawyer(lawyerId || ''),
        enabled: !!lawyerId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        // اگر داده‌ای وجود نداشت، از قیمت‌های پیش‌فرض استفاده کن
        placeholderData: [
            { id: "15min", name: "15 دقیقه", inPersonPrice: 150000, phonePrice: 120000, videoPrice: 135000 },
            { id: "30min", name: "30 دقیقه", inPersonPrice: 250000, phonePrice: 200000, videoPrice: 225000 },
            { id: "45min", name: "45 دقیقه", inPersonPrice: 350000, phonePrice: 280000, videoPrice: 315000 },
            { id: "60min", name: "1 ساعت", inPersonPrice: 450000, phonePrice: 360000, videoPrice: 405000 },
            { id: "90min", name: "1.5 ساعت", inPersonPrice: 600000, phonePrice: 480000, videoPrice: 540000 },
            { id: "120min", name: "2 ساعت", inPersonPrice: 750000, phonePrice: 600000, videoPrice: 675000 }
        ]
    });
};

// هوک احراز هویت


export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

    const loginMutation = useMutation({
        mutationFn: mockApi.auth.login,
        onSuccess: (data) => {
            dispatch(setUser(data.user));
        },
        onError: (error) => {
            console.error('Login error:', error);
            throw error;
        }
    });

    const logoutMutation = useMutation({
        mutationFn: mockApi.auth.logout,
        onSuccess: () => {
            dispatch(logout());
            dispatch(resetPersist());
        },
    });

    return {
        user,
        isAuthenticated,
        isLoading,
        login: loginMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        error: loginMutation.error,
        // اضافه توابع برای به‌روزرسانی state
        updateTimeSlots: (lawyerId: string, timeSlots: any[]) => {
            dispatch(updateTimeSlots({ lawyerId, timeSlots }));
        },
        updateWeeklyTemplate: (lawyerId: string, weeklyTemplate: any) => {
            dispatch(updateWeeklyTemplate({ lawyerId, weeklyTemplate }));
        }
    };
};

// هوک‌های رزرو مشاوره
export const useCreateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bookingData: any) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    localStorage.setItem('consultationBooking', JSON.stringify(bookingData));
                    resolve(true);
                }, 500);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
        },
        onError: (error) => {
            console.error('Booking creation error:', error);
            throw error;
        }
    });
};

// هوک‌های وکلا

export const useLawyers = (filters?: {
    specialty?: string;
    province?: string;
    city?: string;
    includeVIP?: boolean;
}) => {
    // حذف مقادیر خالی از فیلترها
    const cleanedFilters = filters ? {
        specialty: filters.specialty?.trim() || undefined,
        province: filters.province?.trim() || undefined,
        city: filters.city?.trim() || undefined,
        includeVIP: filters.includeVIP
    } : undefined;

    return useQuery({
        queryKey: ['lawyers', cleanedFilters],
        queryFn: () => mockApi.lawyers.getAll(cleanedFilters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useLawyer = (id: string) => {
    return useQuery({
        queryKey: ['lawyer', id],
        queryFn: () => mockApi.lawyers.getById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useLawyerByUserName = (username: string) => {
    return useQuery({
        queryKey: ['lawyer', username],
        queryFn: () => mockApi.lawyers.getByUsername(username),
        enabled: !!username,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useSearchLawyers = (searchTerm: string) => {
    return useQuery({
        queryKey: ['lawyers', 'search', searchTerm],
        queryFn: () => mockApi.lawyers.search(searchTerm),
        enabled: searchTerm.length > 2,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// هوک‌های زمان‌ها و قالب‌های هفتگی
// lib/hooks/useApi.ts

export const useTimeSlots = (lawyerId: string) => {
    return useQuery({
        queryKey: ['timeSlots', lawyerId],
        queryFn: () => mockApi.timeSlots.getByLawyerId(lawyerId),
        enabled: !!lawyerId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useWeeklyTemplate = (lawyerId: string) => {
    return useQuery({
        queryKey: ['weeklyTemplate', lawyerId],
        queryFn: () => mockApi.weeklyTemplate.getByLawyerId(lawyerId),
        enabled: !!lawyerId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// lib/hooks/useApi.ts

export const useSaveTimeSlots = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lawyerId, slots }: { lawyerId: string; slots: TimeSlot[] }) =>
            mockApi.timeSlots.saveForLawyer(lawyerId, slots),
        onSuccess: (_, { lawyerId }) => {
            queryClient.invalidateQueries({ queryKey: ['timeSlots', lawyerId] });
            // به‌روزرسانی اطلاعات کاربر
            queryClient.invalidateQueries({ queryKey: ['auth'] });
        },
        onError: (error) => {
            console.error('Time slots saving error:', error);
            throw error;
        }
    });
};

export const useSaveWeeklyTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lawyerId, template }: { lawyerId: string; template: WeeklyTemplate }) =>
            mockApi.weeklyTemplate.saveForLawyer(lawyerId, template),
        onSuccess: (_, { lawyerId }) => {
            queryClient.invalidateQueries({ queryKey: ['weeklyTemplate', lawyerId] });
        },
        onError: (error) => {
            console.error('Weekly template saving error:', error);
            throw error;
        }
    });
};

// lib/hooks/useApi.ts

export const useApplyTemplateToRange = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         lawyerId,
                         startDate,
                         endDate
                     }: {
            lawyerId: string;
            startDate: string;
            endDate: string;
        }) => {
            return mockApi.applyTemplateToRange.applyTemplateToRange({
                lawyerId,
                startDate,
                endDate
            });
        },
        onSuccess: (_, { lawyerId }) => {
            queryClient.invalidateQueries({ queryKey: ['timeSlots', lawyerId] });
            // به‌روزرسانی اطلاعات کاربر
            queryClient.invalidateQueries({ queryKey: ['auth'] });
        },
        onError: (error) => {
            console.error('Template application error:', error);
            throw error;
        }
    });
};

// هوک‌های کاربران
export const useUser = (userId?: string) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => mockApi.users.getById(userId || ''),
        enabled: !!userId,
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, userData }: { userId: string; userData: any }) =>
            mockApi.users.update(userId, userData),
        onSuccess: (data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            queryClient.invalidateQueries({ queryKey: ['auth'] });
        },
        onError: (error) => {
            console.error('User update error:', error);
            throw error;
        }
    });
};

// هوک‌های علاقه‌مندی‌ها
export const useFavorites = (userId?: string) => {
    return useQuery({
        queryKey: ['favorites', userId],
        queryFn: () => mockApi.favorites.getByUserId(userId || ''),
        enabled: !!userId,
    });
};

export const useAddFavorite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, lawyerId }: { userId: string; lawyerId: string }) =>
            mockApi.favorites.add(userId, lawyerId),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
        },
        onError: (error) => {
            console.error('Add favorite error:', error);
            throw error;
        }
    });
};

export const useRemoveFavorite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, favoriteId }: { userId: string; favoriteId: string }) =>
            mockApi.favorites.remove(userId, favoriteId),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
        },
        onError: (error) => {
            console.error('Remove favorite error:', error);
            throw error;
        }
    });
};

// lib/hooks/useApi.ts

// ... هوک‌های قبلی ...

// هوک برای دریافت مشاوره‌های کاربر
export const useUserConsultations = (userId?: string) => {
    return useQuery({
        queryKey: ['userConsultations', userId],
        queryFn: async () => {
            if (!userId) return [];
            // شبیه‌سازی دریافت داده‌ها از API
            await new Promise(resolve => setTimeout(resolve, 300));
            const users = getStorageData('users', usersData);
            const user = users.find(u => u.id === userId);
            return user?.consultations || [];
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// هوک برای دریافت خدمات کاربر
export const useUserServices = (userId?: string) => {
    return useQuery({
        queryKey: ['userServices', userId],
        queryFn: async () => {
            if (!userId) return [];
            // شبیه‌سازی دریافت داده‌ها از API
            await new Promise(resolve => setTimeout(resolve, 300));
            const users = getStorageData('users', usersData);
            const user = users.find(u => u.id === userId);
            return user?.services || [];
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// هوک برای دریافت مشتریان وکیل
export const useLawyerClients = (lawyerId?: string) => {
    return useQuery({
        queryKey: ['lawyerClients', lawyerId],
        queryFn: async () => {
            if (!lawyerId) return [];
            // شبیه‌سازی دریافت داده‌ها از API
            await new Promise(resolve => setTimeout(resolve, 300));
            const users = getStorageData('users', usersData);
            const lawyer = users.find(u => u.id === lawyerId);
            return lawyer?.clients || [];
        },
        enabled: !!lawyerId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// هوک برای دریافت گزارشات مالی وکیل
export const useLawyerReports = (lawyerId?: string) => {
    return useQuery({
        queryKey: ['lawyerReports', lawyerId],
        queryFn: async () => {
            if (!lawyerId) return { totalIncome: 0, monthlyIncome: 0, consultations: [], services: [] };
            // شبیه‌سازی دریافت داده‌ها از API
            await new Promise(resolve => setTimeout(resolve, 300));
            const users = getStorageData('users', usersData);
            const lawyer = users.find(u => u.id === lawyerId);

            if (!lawyer) return { totalIncome: 0, monthlyIncome: 0, consultations: [], services: [] };

            const transactions = lawyer.transactions || [];
            const completedTransactions = transactions.filter(t => t.status === 'completed');
            const totalIncome = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
            const monthlyIncome = completedTransactions
                .filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth())
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                totalIncome,
                monthlyIncome,
                consultations: lawyer.consultations || [],
                services: lawyer.services || []
            };
        },
        enabled: !!lawyerId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};


// اضافه کردن هوک‌های جدید
export const useUpdateOfferedServices = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, services }: { userId: string; services: any[] }) =>
            mockApi.users.updateOfferedServices(userId, services),
        onSuccess: (data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            queryClient.invalidateQueries({ queryKey: ['auth'] });
        },
        onError: (error) => {
            console.error('Update offered services error:', error);
            throw error;
        }
    });
};

export const useFinancialReport = (userId?: string) => {
    return useQuery({
        queryKey: ['financialReport', userId],
        queryFn: () => mockApi.users.getFinancialReport(userId || ''),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// lib/api/useApi.ts

// اضافه کردن به انتهای فایل
export const usePlans = () => {
    return useQuery({
        queryKey: ['subscriptionPlans'],
        queryFn: () => mockApi.subscriptionPlans.getAll(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const usePurchasePlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, planId, steps }: { userId: string; planId: string; steps: number }) =>
            mockApi.subscriptionPlans.purchase(userId, planId, steps),
        onSuccess: () => {
            // به‌روزرسانی کش اطلاعات کاربر
            queryClient.invalidateQueries({ queryKey: ['user'] });
        }
    });
};

// اضافه کردن هوک‌های جدید
export const useReviews = (lawyerId?: string) => {
    return useQuery({
        queryKey: ['reviews', lawyerId],
        queryFn: () => mockApi.reviews.getByLawyerId(lawyerId || ''),
        enabled: !!lawyerId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useQAPairs = (lawyerId?: string) => {
    return useQuery({
        queryKey: ['qaPairs', lawyerId],
        queryFn: () => mockApi.qaPairs.getByLawyerId(lawyerId || ''),
        enabled: !!lawyerId,
        staleTime: 1000 * 60 * 5,
    });
};


// lib/api/useApi.ts

export const useLegalQuestions = (filters?: {
    category?: string;
    userId?: string;
    answered?: boolean;
}) => {
    return useQuery({
        queryKey: ['legalQuestions', filters],
        queryFn: () => mockApi.legalQuestions.getAll(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useLegalQuestion = (id?: string) => {
    return useQuery({
        queryKey: ['legalQuestion', id],
        queryFn: () => mockApi.legalQuestions.getById(id || ''),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCreateLegalQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (question: Omit<LegalQuestion, 'id' | 'createdAt' | 'updatedAt' | 'answers' | 'isAnswered' | 'viewCount'>) =>
            mockApi.legalQuestions.create(question),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['legalQuestions'] });
        },
        onError: (error) => {
            console.error('Create legal question error:', error);
            throw error;
        }
    });
};

export const useAddAnswer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (answer: Omit<Answer, 'id' | 'createdAt' | 'likes'>) =>
            mockApi.legalQuestions.addAnswer(answer),
        onSuccess: (_, { questionId }) => {
            queryClient.invalidateQueries({ queryKey: ['legalQuestions'] });
            queryClient.invalidateQueries({ queryKey: ['legalQuestion', questionId] });
        },
        onError: (error) => {
            console.error('Add answer error:', error);
            throw error;
        }
    });
};

export const useUserQuestionStats = (userId?: string) => {
    return useQuery({
        queryKey: ['userQuestionStats', userId],
        queryFn: () => mockApi.legalQuestions.getUserQuestionStats(userId || ''),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// lib/api/useApi.ts

// اضافه کردن این هوک‌ها به انتهای فایل
export const useLawyerQuestions = (filters?: {
    status?: 'answered' | 'pending';
    lawyerId?: string;
}) => {
    return useQuery({
        queryKey: ['lawyerQuestions', filters],
        queryFn: () => mockApi.legalQuestions.getForLawyer(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useAnswerQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ questionId, content, lawyerId }: {
            questionId: string;
            content: string;
            lawyerId: string;
        }) => mockApi.legalQuestions.answerQuestion({ questionId, content, lawyerId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lawyerQuestions'] });
        },
        onError: (error) => {
            console.error('Answer question error:', error);
            throw error;
        }
    });
};

export const useRejectQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ questionId, lawyerId }: {
            questionId: string;
            lawyerId: string;
        }) => mockApi.legalQuestions.rejectQuestion({ questionId, lawyerId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lawyerQuestions'] });
        },
        onError: (error) => {
            console.error('Reject question error:', error);
            throw error;
        }
    });
};

// lib/api/useApi.ts

// اضافه کردن این هوک‌ها به انتهای فایل
export const useDirectQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         lawyerId,
                         userId,
                         userName,
                         title,
                         content,
                         category
                     }: {
            lawyerId: string;
            userId: string;
            userName: string;
            title: string;
            content: string;
            category: string;
        }) => mockApi.legalQuestions.createDirectQuestion({
            lawyerId,
            userId,
            userName,
            title,
            content,
            category
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['legalQuestions'] });
        },
        onError: (error) => {
            console.error('Direct question error:', error);
            throw error;
        }
    });
};

// lib/api/useApi.ts

export const useConsultationPricing = (lawyerId?: string) => {
    return useQuery({
        queryKey: ['consultationPricing', lawyerId],
        queryFn: () => mockApi.consultationPricing.getByLawyerId(lawyerId || ''),
        enabled: !!lawyerId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUpdateConsultationPricing = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lawyerId, pricing }: { lawyerId: string; pricing: ConsultationPricing[] }) =>
            mockApi.consultationPricing.update(lawyerId, pricing),
        onSuccess: (_, { lawyerId }) => {
            queryClient.invalidateQueries({ queryKey: ['consultationPricing', lawyerId] });
        },
        onError: (error) => {
            console.error('Update consultation pricing error:', error);
            throw error;
        }
    });
};
