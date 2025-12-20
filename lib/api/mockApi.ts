// lib/api/mockApi.ts
import {
    Answer,
    ConsultationPricing,
    LawyerList,
    LegalQuestion,
    TimeSlot,
    UserProfile,
    WeeklyTemplate
} from '@/lib/api/types';
import {
    consultationOptions,
    lawyersData, legalQuestionsData,
    provinces,
    specialties,
    subscriptionPlansData,
    usersData
} from "@/lib/api/mockData";
import { getDayName } from "@/lib/utils";

// Helper functions for localStorage
export  const getStorageData = <T,>(key: string, defaultValue: T): T => {
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
export const mockApi = {
    // Fixed data APIs
    provinces: {
        getAll: async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return getStorageData('provinces', provinces);
        }
    },

    specialties: {
        getAll: async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return getStorageData('specialties', specialties);
        }
    },

    // lib/api/mockApi.ts

// در تابع consultationOptions، تغییر برای استفاده از قیمت‌های تنظیم شده
    consultationOptions: {
        getAll: async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            const options = [
                { id: "15min", name: "15 دقیقه", price: 150000 },
                { id: "30min", name: "30 دقیقه", price: 250000 },
                { id: "45min", name: "45 دقیقه", price: 350000 },
                { id: "60min", name: "60 دقیقه", price: 450000 },
                { id: "90min", name: "1.5 ساعت", price: 600000 },
                { id: "120min", name: "2 ساعت", price: 750000 }
            ];

            // اگر کاربر وارد سیستم باشد، از قیمت‌های تنظیم شده استفاده کن
            if (typeof window !== 'undefined') {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user?.id) {
                    const pricing = getStorageData(`consultationPricing_${user.id}`, []);
                    if (pricing.length > 0) {
                        return pricing
                            .filter(p => p.isActive)
                            .map(p => ({
                                id: p.duration,
                                name: p.duration === '15min' ? '15 دقیقه' :
                                    p.duration === '30min' ? '30 دقیقه' :
                                        p.duration === '45min' ? '45 دقیقه' :
                                            p.duration === '60min' ? '60 دقیقه' :
                                                p.duration === '90min' ? '1.5 ساعت' : '2 ساعت',
                                price: p.price
                            }));
                    }
                }
            }

            return options;
        },
        // lib/api/mockApi.ts

// در تابع getForLawyer
        getForLawyer: async (lawyerId: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));

            // دریافت قیمت‌های تنظیم شده توسط وکیل
            const pricing = getStorageData(`consultationPricing_${lawyerId}`, []);

            // اگر قیمت‌های تنظیم شده وجود داشته باشد، از آنها استفاده کن
            if (pricing.length > 0) {
                const activePricing = pricing.filter(p => p.isActive);
                if (activePricing.length > 0) {
                    return activePricing.map(p => ({
                        id: p.duration,
                        name: p.duration === '15min' ? '15 دقیقه' :
                            p.duration === '30min' ? '30 دقیقه' :
                                p.duration === '45min' ? '45 دقیقه' :
                                    p.duration === '60min' ? '60 دقیقه' :
                                        p.duration === '90min' ? '1.5 ساعت' : '2 ساعت',
                        inPersonPrice: p.inPersonPrice,
                        phonePrice: p.phonePrice,
                        videoPrice: p.videoPrice
                    }));
                }
            }

            // اگر قیمت‌های تنظیم شده وجود نداشت، از قیمت‌های پیش‌فرض استفاده کن
            return [
                { id: "15min", name: "15 دقیقه", inPersonPrice: 150000, phonePrice: 120000, videoPrice: 135000 },
                { id: "30min", name: "30 دقیقه", inPersonPrice: 250000, phonePrice: 200000, videoPrice: 225000 },
                { id: "45min", name: "45 دقیقه", inPersonPrice: 350000, phonePrice: 280000, videoPrice: 315000 },
                { id: "60min", name: "1 ساعت", inPersonPrice: 450000, phonePrice: 360000, videoPrice: 405000 },
                { id: "90min", name: "1.5 ساعت", inPersonPrice: 600000, phonePrice: 480000, videoPrice: 540000 },
                { id: "120min", name: "2 ساعت", inPersonPrice: 750000, phonePrice: 600000, videoPrice: 675000 }
            ];
        },
    },

    // تابع جدید برای دریافت قیمت‌ها با پشتیبانی از قیمت‌های پیش‌فرض

    // Lawyers API
    lawyers: {
        // در تابع getAll
        getAll: async (filters?: {
            specialty?: string;
            province?: string;
            city?: string;
            includeVIP?: boolean;
        }): Promise<LawyerList[]> => {
            await new Promise(resolve => setTimeout(resolve, 300));
            let lawyers = getStorageData('lawyers', lawyersData);

            // دریافت اطلاعات کاربران برای بررسی وضعیت VIP
            const users: UserProfile[] = getStorageData('users', usersData);

            // به‌روزرسانی وضعیت VIP وکلا بر اساس اشتراکشان
            lawyers = lawyers.map(lawyer => {
                const user = users.find(u => u.id === lawyer.id);
                if (user?.subscription) {
                    const expiryDate = new Date(user.subscription.expiryDate);
                    const now = new Date();

                    if (expiryDate > now) {
                        return {
                            ...lawyer,
                            isVIP: user.subscription.isVIP,
                            vipExpiryDate: user.subscription.expiryDate,
                            rank: user.subscription.steps // استفاده از تعداد پله‌ها به عنوان رتبه
                        };
                    }
                }
                return lawyer;
            });

            // سورت کردن وکلا: آنلاین‌ها اول، سپس بر اساس امتیاز
            lawyers.sort((a, b) => {
                // اگر وکیل A آنلاین و وکیل B آفلاین باشد، A اول می‌آید
                if (a.isOnline && !b.isOnline) return -1;
                // اگر وکیل A آفلاین و وکیل B آنلاین باشد، B اول می‌آید
                if (!a.isOnline && b.isOnline) return 1;
                // اگر هر دو آنلاین یا هر دو آفلاین هستند، بر اساس امتیاز سورت می‌شوند
                return (b.rank || 0) - (a.rank || 0);
            });

            if (filters) {
                lawyers = lawyers.filter(lawyer => {
                    // فقط اگر پارامتر وجود داشته باشد و خالی نباشد، فیلتر را اعمال کن
                    if (filters.specialty && lawyer.specialty !== filters.specialty) return false;
                    if (filters.province && lawyer.province !== filters.province) return false;
                    if (filters.city && lawyer.city !== filters.city) return false;

                    // اگر includeVIP false باشد، وکلای VIP را فیلتر کن
                    if (filters.includeVIP === false && lawyer.isVIP) return false;

                    return true;
                });
            }

            return lawyers;
        },

        getById: async (id: string): Promise<LawyerList | null> => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const lawyers = getStorageData('lawyers', lawyersData);
            return lawyers.find(lawyer => lawyer.id === id) || null;
        },

        getByUsername: async (username: string): Promise<LawyerList | null> => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const lawyers = getStorageData('lawyers', lawyersData);
            return lawyers.find(lawyer => lawyer.username === username) || null;
        },

        search: async (searchTerm: string): Promise<LawyerList[]> => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const lawyers = getStorageData('lawyers', lawyersData);
            const term = searchTerm.toLowerCase();

            return lawyers.filter(lawyer =>
                lawyer.name.toLowerCase().includes(term) ||
                lawyer.lastName.toLowerCase().includes(term) ||
                lawyer.specialty.toLowerCase().includes(term) ||
                lawyer.province.toLowerCase().includes(term) ||
                lawyer.city.toLowerCase().includes(term)
            );
        }
    },

    // Users API
    users: {
        getById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const users: UserProfile[] = getStorageData('users', usersData);
            return users.find(user => user.id === id) || null;
        },

        update: async (id: string, userData: Partial<UserProfile>) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const users: UserProfile[] = getStorageData('users', usersData);
            const index = users.findIndex(user => user.id === id);

            if (index !== -1) {
                users[index] = { ...users[index], ...userData };
                setStorageData('users', users);
                return users[index];
            }

            throw new Error('User not found');
        },

        updateOfferedServices: async (userId: string, services: Array<{ id: string; name: string; price: number }>) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const users: UserProfile[] = getStorageData('users', usersData);
            const index = users.findIndex(user => user.id === userId);

            if (index !== -1) {
                users[index] = {
                    ...users[index],
                    offeredServices: services
                };
                setStorageData('users', users);
                return users[index];
            }

            throw new Error('User not found');
        },

        // دریافت گزارش مالی وکیل
        getFinancialReport: async (userId: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const users: UserProfile[] = getStorageData('users', usersData);
            const user = users.find(u => u.id === userId);

            if (!user) {
                throw new Error('User not found');
            }

            const transactions = user.transactions || [];
            const completedTransactions = transactions.filter(t => t.status === 'completed');
            const pendingTransactions = transactions.filter(t => t.status === 'pending');

            const totalIncome = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
            const pendingIncome = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);

            // گروه‌بندی درآمد بر اساس ماه
            const monthlyIncome: { [key: string]: number } = {};
            completedTransactions.forEach(t => {
                const month = new Date(t.createdAt).toISOString().slice(0, 7); // YYYY-MM
                monthlyIncome[month] = (monthlyIncome[month] || 0) + t.amount;
            });

            // گروه‌بندی درآمد بر اساس نوع
            const incomeByType = {
                consultation: completedTransactions.filter(t => t.type === 'consultation').reduce((sum, t) => sum + t.amount, 0),
                service: completedTransactions.filter(t => t.type === 'service').reduce((sum, t) => sum + t.amount, 0)
            };

            return {
                totalIncome,
                pendingIncome,
                monthlyIncome,
                incomeByType,
                transactions: completedTransactions
            };
        }
    },

    // Favorites API
    favorites: {
        getByUserId: async (userId: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const users: UserProfile[] = getStorageData('users', usersData);
            const user = users.find(u => u.id === userId);
            return user?.favorites || [];
        },

        add: async (userId: string, lawyerId: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const users: UserProfile[] = getStorageData('users', usersData);
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex !== -1) {
                const lawyers = getStorageData('lawyers', lawyersData);
                const lawyer = lawyers.find(l => l.id === lawyerId);

                if (lawyer) {
                    const newFavorite = {
                        id: `fav_${Date.now()}`,
                        lawyerId: lawyer.id,
                        lawyerName: `${lawyer.name} ${lawyer.lastName}`,
                        lawyerSpecialty: lawyer.specialty,
                        createdAt: new Date().toISOString()
                    };

                    if (!users[userIndex].favorites) {
                        users[userIndex].favorites = [];
                    }

                    users[userIndex].favorites!.push(newFavorite);
                    setStorageData('users', users);
                    return newFavorite;
                }
            }

            throw new Error('Failed to add favorite');
        },

        remove: async (userId: string, favoriteId: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const users: UserProfile[] = getStorageData('users', usersData);
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex !== -1 && users[userIndex].favorites) {
                users[userIndex].favorites = users[userIndex].favorites!.filter(
                    fav => fav.id !== favoriteId
                );
                setStorageData('users', users);
                return true;
            }

            throw new Error('Failed to remove favorite');
        }
    },

    // Time Slots API
    timeSlots: {
        getByLawyerId: async (lawyerId: string): Promise<TimeSlot[]> => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const key = `timeSlots_${lawyerId}`;
            const slots: TimeSlot[] = getStorageData(key, []);

            if (slots.length > 0) {
                return slots;
            }

            const template = await mockApi.weeklyTemplate.getByLawyerId(lawyerId);
            if (Object.keys(template).length > 0) {
                const today = new Date();

                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayName = getDayName(dateStr);

                    if (template[dayName] && !template[dayName].isHoliday) {
                        template[dayName].hours.forEach(hour => {
                            const startTime = `${hour.toString().padStart(2, '0')}:00`;
                            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

                            slots.push({
                                id: `${dateStr}-${startTime}`,
                                date: dateStr,
                                startTime,
                                endTime,
                                isBooked: false
                            });
                        });
                    }
                }

                setStorageData(key, slots);
                return slots;
            }

            return slots;
        },

        saveForLawyer: async (lawyerId: string, slots: TimeSlot[]): Promise<void> => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const key = `timeSlots_${lawyerId}`;
            setStorageData(key, slots);

            const users: UserProfile[] = getStorageData('users', usersData);
            const userIndex = users.findIndex(u => u.id === lawyerId);

            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    timeSlots: slots
                };
                setStorageData('users', users);
            }
        },
    },

    // Weekly Template API
    weeklyTemplate: {
        getByLawyerId: async (lawyerId: string): Promise<WeeklyTemplate> => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const key = `weeklyTemplate_${lawyerId}`;
            const template: WeeklyTemplate = getStorageData(key, {});

            if (Object.keys(template).length === 0) {
                const defaultTemplate: WeeklyTemplate = {
                    saturday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                    sunday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                    monday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                    tuesday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                    wednesday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                    thursday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
                    friday: { hours: [], isHoliday: true }
                };

                setStorageData(key, defaultTemplate);
                return defaultTemplate;
            }

            return template;
        },

        saveForLawyer: async (lawyerId: string, template: WeeklyTemplate): Promise<void> => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const key = `weeklyTemplate_${lawyerId}`;
            setStorageData(key, template);

            const users: UserProfile[] = getStorageData('users', usersData);
            const userIndex = users.findIndex(u => u.id === lawyerId);

            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    weeklyTemplate: template
                };
                setStorageData('users', users);
            }
        },
    },

    // Apply Template API
    applyTemplateToRange: {
        applyTemplateToRange: async ({
                                         lawyerId,
                                         startDate,
                                         endDate
                                     }: {
            lawyerId: string;
            startDate: string;
            endDate: string;
        }) => {
            await new Promise(resolve => setTimeout(resolve, 500));

            const template = await mockApi.weeklyTemplate.getByLawyerId(lawyerId);
            const key = `timeSlots_${lawyerId}`;
            const existingSlots: TimeSlot[] = getStorageData(key, []);

            // حذف زمان‌های موجود در محدوده
            const filteredSlots: TimeSlot[] = existingSlots.filter(slot =>
                slot.date < startDate || slot.date > endDate
            );

            // ایجاد زمان‌های جدید بر اساس قالب
            const start = new Date(startDate);
            const end = new Date(endDate);
            const newSlots: TimeSlot[] = [...filteredSlots];

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const dayName = getDayName(dateStr);

                if (template[dayName] && !template[dayName].isHoliday) {
                    template[dayName].hours.forEach(hour => {
                        const startTime = `${hour.toString().padStart(2, '0')}:00`;
                        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

                        newSlots.push({
                            id: `${dateStr}-${startTime}`,
                            date: dateStr,
                            startTime,
                            endTime,
                            isBooked: false
                        });
                    });
                }
            }

            // ذخیره زمان‌های جدید
            setStorageData(key, newSlots);

            // به‌روزرسانی state کاربر
            const users: UserProfile[] = getStorageData('users', usersData);
            const userIndex = users.findIndex(u => u.id === lawyerId);

            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    timeSlots: newSlots
                };
                setStorageData('users', users);
            }

            return true;
        },
    },

    // Auth API
    auth: {
        login: async (credentials: { mobile: string; password: string }) => {
            await new Promise(resolve => setTimeout(resolve, 500));

            const users: UserProfile[] = getStorageData('users', usersData);
            console.log('Users from localStorage:', users);
            console.log('Login attempt with mobile:', credentials.mobile);

            const user = users.find((u: UserProfile) => u.mobile === credentials.mobile);
            console.log('Found user:', user);

            if (user && credentials.password === '1111') {
                console.log('Login successful');
                return {
                    user: user,
                    token: 'mock-jwt-token',
                };
            }

            console.log('Login failed - invalid credentials');
            throw new Error('شماره همراه یا رمز عبور اشتباه است');
        },

        logout: async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return true;
        },
    },
    subscriptionPlans: {
        getAll: async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return getStorageData('subscriptionPlans', subscriptionPlansData);
        },

        purchase: async (userId: string, planId: string, steps: number) => {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const plans = getStorageData('subscriptionPlans', subscriptionPlansData);
            const plan = plans.find(p => p.id === planId);

            if (!plan) {
                throw new Error('پلن مورد نظر یافت نشد');
            }

            if (steps < 1 || steps > plan.maxSteps) {
                throw new Error(`تعداد پله‌ها باید بین 1 تا ${plan.maxSteps} باشد`);
            }

            // محاسبه قیمت با تخفیف
            const basePrice = plan.basePrice * steps * plan.duration;
            const discountAmount = basePrice * (plan.discount / 100);
            const finalPrice = basePrice - discountAmount;

            // شبیه‌سازی پرداخت موفق
            const transaction = {
                id: `trans_${Date.now()}`,
                amount: finalPrice,
                type: "subscription" as const,
                description: `خرید پلن ${plan.name} با ${steps} پله`,
                status: "completed" as const,
                createdAt: new Date().toISOString(),
                invoiceNumber: `INV-${Date.now()}`
            };

            // به‌روزرسانی اطلاعات کاربر
            const users: UserProfile[] = getStorageData('users', usersData);
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex !== -1) {
                // محاسبه تاریخ انقضا
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + plan.duration);

                // به‌روزرسانی یا ایجاد اطلاعات اشتراک
                users[userIndex] = {
                    ...users[userIndex],
                    subscription: {
                        planId: plan.id,
                        planName: plan.name,
                        steps: steps,
                        expiryDate: expiryDate.toISOString(),
                        isVIP: plan.duration >= 6, // برای پلن‌های 6 ماهه و 1 ساله
                        purchasedAt: new Date().toISOString()
                    },
                    transactions: [
                        ...(users[userIndex].transactions || []),
                        transaction
                    ]
                };

                setStorageData('users', users);
            }

            return {
                success: true,
                transaction,
                plan,
                steps
            };
        }
    },
    // اضافه کردن توابع جدید به mockApi
    reviews: {
        getByLawyerId: async (lawyerId: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const lawyers = getStorageData('lawyers', lawyersData);
            const lawyer = lawyers.find(l => l.id === lawyerId);
            return lawyer?.reviews || [];
        }
    },

    qaPairs: {
        getByLawyerId: async (lawyerId: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const lawyers = getStorageData('lawyers', lawyersData);
            const lawyer = lawyers.find(l => l.id === lawyerId);
            return lawyer?.qaPairs || [];
        }
    },

    // برای سوالات حقوقی

    legalQuestions: {
        getAll: async (filters?: {
            category?: string;
            userId?: string;
            answered?: boolean;
        }) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const questions: LegalQuestion[] = getStorageData('legalQuestions', legalQuestionsData);

            if (filters) {
                return questions.filter(q => {
                    if (filters.category && q.category !== filters.category) return false;
                    if (filters.userId && q.userId !== filters.userId) return false;
                    if (filters.answered !== undefined && q.isAnswered !== filters.answered) return false;
                    return true;
                });
            }

            return questions;
        },

        getById: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const questions: LegalQuestion[] = getStorageData('legalQuestions', legalQuestionsData);
            return questions.find(q => q.id === id) || null;
        },

        create: async (question: Omit<LegalQuestion, 'id' | 'createdAt' | 'updatedAt' | 'answers' | 'isAnswered' | 'viewCount'>) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            const questions: LegalQuestion[] = getStorageData('legalQuestions', legalQuestionsData);

            const newQuestion: LegalQuestion = {
                ...question,
                id: `q_${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                answers: [],
                isAnswered: false,
                viewCount: 0
            };

            questions.unshift(newQuestion);
            setStorageData('legalQuestions', questions);

            return newQuestion;
        },

        addAnswer: async (answer: Omit<Answer, 'id' | 'createdAt' | 'likes'>) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            const questions: LegalQuestion[] = getStorageData('legalQuestions', legalQuestionsData);
            const questionIndex = questions.findIndex(q => q.id === answer.questionId);

            if (questionIndex !== -1) {
                const newAnswer: Answer = {
                    ...answer,
                    id: `a_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    likes: 0
                };

                questions[questionIndex].answers.push(newAnswer);
                questions[questionIndex].isAnswered = true;
                questions[questionIndex].updatedAt = new Date().toISOString();

                setStorageData('legalQuestions', questions);
                return newAnswer;
            }

            throw new Error('Question not found');
        },

        getUserQuestionStats: async (userId: string) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const questions: LegalQuestion[] = getStorageData('legalQuestions', legalQuestionsData);
            const userQuestions = questions.filter(q => q.userId === userId);

            // در اینجا باید منطق پیچیده‌تری برای تشخیص پاسخ‌های خوانده نشده پیاده‌سازی شود
            // برای سادگی، فرض می‌کنیم که هر پاسخی که در 24 ساعت گذشته ایجاد شده، خوانده نشده است
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            let newAnswersCount = 0;
            userQuestions.forEach(q => {
                q.answers.forEach(a => {
                    if (new Date(a.createdAt) > oneDayAgo) {
                        newAnswersCount++;
                    }
                });
            });

            return {
                totalQuestions: userQuestions.length,
                unansweredQuestions: userQuestions.filter(q => !q.isAnswered).length,
                newAnswersCount
            };
        },
        getForLawyer: async (filters?: {
            status?: 'answered' | 'pending';
            lawyerId?: string;
        }) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const questions: LegalQuestion[] = getStorageData('legalQuestions', legalQuestionsData);

            if (filters) {
                return questions.filter(q => {
                    if (filters.status === 'answered' && !q.isAnswered) return false;
                    if (filters.status === 'pending' && q.isAnswered) return false;
                    return true;
                });
            }

            return questions;
        },

        answerQuestion: async ({ questionId, content, lawyerId }: {
            questionId: string;
            content: string;
            lawyerId: string;
        }) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            const questions: LegalQuestion[] = getStorageData('legalQuestions', legalQuestionsData);
            const questionIndex = questions.findIndex(q => q.id === questionId);

            if (questionIndex !== -1) {
                const users: UserProfile[] = getStorageData('users', usersData);
                const lawyer = users.find(u => u.id === lawyerId);

                if (!lawyer) {
                    throw new Error('Lawyer not found');
                }

                const newAnswer: Answer = {
                    id: `a_${Date.now()}`,
                    questionId,
                    lawyerId,
                    lawyerName: `${lawyer.name} ${lawyer.lastName}`,
                    content,
                    createdAt: new Date().toISOString(),
                    isAccepted: false,
                    likes: 0
                };

                questions[questionIndex].answers.push(newAnswer);
                questions[questionIndex].isAnswered = true;
                questions[questionIndex].updatedAt = new Date().toISOString();

                // افزایش امتیاز وکیل
                lawyer.questionPoints = (lawyer.questionPoints || 0) + 10;

                setStorageData('legalQuestions', questions);
                setStorageData('users', users);

                return newAnswer;
            }

            throw new Error('Question not found');
        },

        rejectQuestion: async ({ questionId, lawyerId }: {
            questionId: string;
            lawyerId: string;
        }) => {
            await new Promise(resolve => setTimeout(resolve, 300));

            // در اینجا باید منطق رد کردن سوال پیاده‌سازی شود
            // برای سادگی، فقط یک لاگ ثبت می‌کنیم
            console.log(`Question ${questionId} rejected by lawyer ${lawyerId}`);

            return true;
        },
        // lib/api/mockApi.ts

// اضافه کردن این تابع به انتهای فایل
        legalQuestions: {
            // ... توابع قبلی

            createDirectQuestion: async ({
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
            }) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                const questions: LegalQuestion[] = getStorageData('legalQuestions', legalQuestionsData);

                const newQuestion: LegalQuestion = {
                    id: `q_${Date.now()}`,
                    userId,
                    userName,
                    title,
                    content,
                    category,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    answers: [],
                    isAnswered: false,
                    viewCount: 0,
                    // فیلد جدید برای مشخص کردن اینکه این سوال مستقیماً به وکیل ارسال شده
                    directToLawyer: lawyerId
                };

                questions.unshift(newQuestion);
                setStorageData('legalQuestions', questions);

                return newQuestion;
            }
        },

    },
// lib/api/mockApi.ts

    consultationPricing: {
        getByLawyerId: async (lawyerId: string) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const pricing: ConsultationPricing[] = getStorageData(`consultationPricing_${lawyerId}`, []);
            return pricing;
        },

        update: async (lawyerId: string, pricing: ConsultationPricing[]) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            setStorageData(`consultationPricing_${lawyerId}`, pricing);

            // به‌روزرسانی اطلاعات کاربر
            const users: UserProfile[] = getStorageData('users', usersData);
            const userIndex = users.findIndex(u => u.id === lawyerId);

            if (userIndex !== -1) {
                users[userIndex] = {
                    ...users[userIndex],
                    consultationPricing: pricing
                };
                setStorageData('users', users);
            }
        },

        // دریافت قیمت پیش‌فرض بر اساس مدت زمان
        getDefaultPrice: (duration: string) => {
            const defaultPrices = {
                "15min": 150000,
                "30min": 250000,
                "45min": 350000,
                "60min": 450000,
                "90min": 600000,
                "120min": 750000
            };
            return defaultPrices[duration as keyof typeof defaultPrices] || 0;
        }
    }


};

