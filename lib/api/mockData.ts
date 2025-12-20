// lib/api/mockData.ts

import {ConsultationPricing, LawyerList, LegalQuestion, UserProfile} from "@/lib/api/types";
import {specialties} from "@/lib/data-service/mockData";

// تابع مقداردهی اولیه localStorage
export const initializeLocalStorage = () => {
    if (typeof window === 'undefined') return;

    // اگر داده‌های وکلا وجود ندارد، آنها را اضافه کن
    if (!localStorage.getItem('lawyers')) {
        localStorage.setItem('lawyers', JSON.stringify(lawyersData));
    }

    // اگر داده‌های کاربران وجود ندارد، آنها را اضافه کن
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(usersData));
    }

    // اگر داده‌های استان‌ها وجود ندارد، آنها را اضافه کن
    if (!localStorage.getItem('provinces')) {
        localStorage.setItem('provinces', JSON.stringify(provinces));
    }

    // اگر داده‌های تخصص‌ها وجود ندارد، آنها را اضافه کن
    if (!localStorage.getItem('specialties')) {
        localStorage.setItem('specialties', JSON.stringify(specialties));
    }

    // اگر داده‌های گزینه‌های مشاوره وجود ندارد، آنها را اضافه کن
    if (!localStorage.getItem('consultationOptions')) {
        localStorage.setItem('consultationOptions', JSON.stringify(consultationOptions));
    }

    if (!localStorage.getItem('legalQuestions')) {
        localStorage.setItem('legalQuestions', JSON.stringify(legalQuestionsData));
    }
};

// تابع پاک کردن و مقداردهی مجدد localStorage
export const clearAndInitializeLocalStorage = () => {
    if (typeof window === 'undefined') return;

    // پاک کردن کل localStorage
    localStorage.clear();

    // مقداردهی مجدد با داده‌های اولیه
    initializeLocalStorage();

    // رفرش صفحه
    window.location.reload();
};


export const lawyersData: LawyerList[] = [
    {
        id: "1",
        username:"ahmad",
        isOnline: true,
        name: "احمد",
        lastName: "محمدی",
        specialty: "حقوقی",
        province: "تهران",
        city: "تهران",
        profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
        about: "وکیل پایه یک دادگستری با بیش از 10 سال سابقه در امور حقوقی، خانواده و کیفری. فارغ‌التحصیل از دانشگاه تهران و عضو کانون وکلای دادگستری مرکز.",
        experience: 12,
        views: 2450,
        phone: "021-12345678",
        mobile: "09146421264",
        address: "تهران، خیابان ولیعصر، پلاک 123",
        rating: 4.8,
        consultationFee: 500000,
        subscription: {
            planId: "12month",
            planName: "پلن یکساله",
            duration: 12,
            durationUnit: "ماه",
            steps: 5,
            expiryDate: "2025-12-31",
            isVIP: true,
            purchasedAt: "2025-01-15"
        }
    },
    {
        id: "2",
        username:"sara",
        isOnline: true,
        name: "سارا",
        lastName: "رضایی",
        specialty: "خانواده",
        province: "اصفهان",
        city: "اصفهان",
        profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
        about: "متخصص در امور خانواده، طلاق، حضانت و مهریه. با سابقه درخشان در پرونده‌های خانوادگی و ارائه مشاوره تخصصی به زوجین.",
        experience: 8,
        views: 1890,
        phone: "031-12345678",
        mobile: "09189001937",
        address: "اصفهان، میدان نقش جهان، خیابان چهارباغ",
        rating: 4.9,
        consultationFee: 450000,
        subscription: {
            planId: "6month",
            planName: "پلن شش ماهه",
            duration: 6,
            durationUnit: "ماه",
            steps: 2,
            expiryDate: "2026-12-31",
            isVIP: false,
            purchasedAt: "2025-06-15"
        }
    },
    {
        id: "3",
        username:"reza",
        isOnline: true,
        name: "رضا",
        lastName: "حسینی",
        specialty: "کیفری",
        province: "فارس",
        city: "شیراز",
        profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
        about: "وکیل متخصص در امور کیفری، جرایم اقتصادی و دیوان عدالت اداری. با تجربه در دفاع از متهمان در پرونده‌های مهم.",
        experience: 15,
        views: 3120,
        phone: "071-12345678",
        mobile: "09144133782",
        address: "شیراز، خیابان زند، پلاک 45",
        rating: 4.7,
        consultationFee: 600000,
        subscription: {
            planId: "2month",
            planName: "پلن دو ماهه",
            duration: 2,
            durationUnit: "ماه",
            steps: 5,
            expiryDate: "2026-12-31",
            isVIP: false,
            purchasedAt: "2025-10-15"
        }
    },
    {
        id: "4",
        username:"maryam",
        isOnline: false,
        name: "مریم",
        lastName: "اکبری",
        specialty: "مالیاتی",
        province: "البرز",
        city: "کرج",
        profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
        about: "کارشناس ارشد مالیاتی و وکیل متخصص در امور مالیاتی، حل اختلافات مالیاتی و ارائه مشاوره به شرکت‌ها و اشخاص.",
        experience: 10,
        views: 1560,
        phone: "026-12345678",
        mobile: "09186074033",
        address: "کرج، میدان آزادگان، خیابان بهار",
        rating: 4.6,
        consultationFee: 550000
    },
    {
        id: "5",
        isOnline: false,
        username:"ali",
        name: "علی",
        lastName: "صالحی",
        specialty: "حقوقی",
        province: "تهران",
        city: "تهران",
        profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
        about: "وکیل پایه یک دادگستری با تخصص در قراردادها، امور شرکت‌ها و حقوق تجارت. با سابقه وکالت در پرونده‌های بزرگ اقتصادی.",
        experience: 18,
        views: 4210,
        phone: "021-87654321",
        mobile: "09188111609",
        address: "تهران، خیابان آزادی، پلاک 789",
        rating: 4.9,
        consultationFee: 700000
    },
    {
        id: "6",
        username:"zahra",
        isOnline: false,
        name: "زهرا",
        lastName: "موسوی",
        specialty: "کار",
        province: "خراسان رضوی",
        city: "مشهد",
        profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
        about: "متخصص در امور کار و تأمین اجتماعی، حل اختلافات کارگر و کارفرما و دعاوی مربوط به قراردادهای کار.",
        experience: 7,
        views: 1320,
        phone: "051-12345678",
        mobile: "09146421264",
        address: "مشهد، بلوار سجاد، پلاک 12",
        rating: 4.5,
        consultationFee: 400000
    },
    // وکلای جدید تهران
    {
        id: "7",
        username:"mohamad",
        isOnline: false,
        name: "محمد",
        lastName: "کریمی",
        specialty: "ملکی",
        province: "تهران",
        city: "تهران",
        profileImage: "https://randomuser.me/api/portraits/men/7.jpg",
        about: "وکیل متخصص در امور ملکی، خرید و فروش، اجاره و رهن املاک. با سابقه درخشان در پرونده‌های ملکی و ارائه مشاوره تخصصی به موکلین.",
        experience: 9,
        views: 1780,
        phone: "021-22334455",
        mobile: "09123456789",
        address: "تهران، خیابان سعدی، پلاک 45",
        rating: 4.6,
        consultationFee: 480000
    },
    {
        id: "8",
        username:"fateme",
        isOnline: false,
        name: "فاطمه",
        lastName: "حسینی",
        specialty: "ثبتی",
        province: "تهران",
        city: "تهران",
        profileImage: "https://randomuser.me/api/portraits/women/8.jpg",
        about: "متخصص در امور ثبتی، ثبت شرکت‌ها، ثبت علائم تجاری و تغییرات ثبتی. با تجربه در پرونده‌های پیچیده ثبتی.",
        experience: 11,
        views: 2150,
        phone: "021-33445566",
        mobile: "09198765432",
        address: "تهران، خیابان انقلاب، پلاک 67",
        rating: 4.7,
        consultationFee: 520000
    },
    {
        id: "9",
        username:"hosein",
        isOnline: false,
        name: "حسین",
        lastName: "صادقی",
        specialty: "شرکت‌ها",
        province: "تهران",
        city: "تهران",
        profileImage: "https://randomuser.me/api/portraits/men/9.jpg",
        about: "وکیل متخصص در امور شرکت‌ها، تأسیس، تغییرات و انحلال شرکت‌ها. با سابقه درخشان در پرونده‌های بزرگ شرکتی.",
        experience: 14,
        views: 2890,
        phone: "021-44556677",
        mobile: "09111223344",
        address: "تهران، خیابان طالقانی، پلاک 89",
        rating: 4.8,
        consultationFee: 650000
    },
    {
        id: "10",
        username:"zeynab",
        isOnline: false,
        name: "زینب",
        lastName: "میرزایی",
        specialty: "تجاری",
        province: "تهران",
        city: "تهران",
        profileImage: "https://randomuser.me/api/portraits/women/10.jpg",
        about: "متخصص در امور تجاری، قراردادهای تجاری بین‌المللی و دعاوی تجاری. با تجربه در پرونده‌های بزرگ تجاری.",
        experience: 12,
        views: 2650,
        phone: "021-55667788",
        mobile: "09155443322",
        address: "تهران، خیابان فاطمی، پلاک 123",
        rating: 4.7,
        consultationFee: 580000
    },
    {
        id: "11",
        username:"mahdi",
        isOnline: false,
        name: "مهدی",
        lastName: "احمدی",
        specialty: "بین‌الملل",
        province: "تهران",
        city: "تهران",
        profileImage: "https://randomuser.me/api/portraits/men/11.jpg",
        about: "وکیل متخصص در امور بین‌الملل، دعاوی تجاری بین‌المللی و حقوق دریاها. با سابقه در پرونده‌های بین‌المللی پیچیده.",
        experience: 16,
        views: 3200,
        phone: "021-66778899",
        mobile: "09166778899",
        address: "تهران، خیابان ولیعصر، پلاک 200",
        rating: 4.9,
        consultationFee: 750000
    },
    {
        id: "12",
        username:"narges",
        isOnline: false,
        name: "سیده نرگس",
        lastName: "موسوی",
        specialty: "خانواده",
        province: "تهران",
        city: "تهران",
        profileImage: "https://randomuser.me/api/portraits/women/12.jpg",
        about: "متخصص در امور خانواده، طلاق، حضانت و مهریه. با سابقه درخشان در پرونده‌های خانوادگی و ارائه مشاوره تخصصی به زوجین.",
        experience: 10,
        views: 1950,
        phone: "021-77889900",
        mobile: "09177889900",
        address: "تهران، خیابان شریعتی، پلاک 150",
        rating: 4.8,
        consultationFee: 470000
    }
];



// اضافه کردن داده‌های برای سوال جواب و ریویو  lawyersData
lawyersData.forEach(lawyer => {
    lawyer.reviews = [
        {
            id: `r_${lawyer.id}_1`,
            userId: "user1",
            userName: "علی احمدی",
            rating: 5,
            comment: "وکیل بسیار خوب و متخصص. مشاوره ایشون خیلی بهم کمک کرد.",
            createdAt: "2023-05-15"
        },
        {
            id: `r_${lawyer.id}_2`,
            userId: "user2",
            userName: "مریم رضایی",
            rating: 4,
            comment: "تجربه خوبی بود، اما کمی تاخیر در جلسه داشتند.",
            createdAt: "2023-06-20"
        }
    ];

    lawyer.qaPairs = [
        {
            id: `qa_${lawyer.id}_1`,
            question: "برای طلاق توافقی چه مدارکی لازمه؟",
            answer: "برای طلاق توافقی نیاز به شناسنامه، کارت ملی، سند ازدواج و 6 عکس پرسنلی دارید.",
            askedBy: "سارا محمدی",
            askedAt: "2023-04-10",
            answeredAt: "2023-04-12"
        },
        {
            id: `qa_${lawyer.id}_2`,
            question: "آیا می‌توانم بدون وکیل در دادگاه حاضر شوم؟",
            answer: "بله، اما توصیه می‌شود برای پیچیدگی‌های حقوقی حتماً از وکیل استفاده کنید.",
            askedBy: "رضا کریمی",
            askedAt: "2023-05-05",
            answeredAt: "2023-05-07"
        }
    ];
});
// داده‌های کاربران با ساختار تو در تو
export const usersData: UserProfile[] = [
    {
        id: "user1",
        username:"ali",
        name: "علی",
        lastName: "احمدی",
        mobile: "09116421264",
        phone: "09116421264",
        role: "user",
        createdAt: "2023-01-15",
        consultations: [
            {
                id: "c1",
                userId: "user1",
                lawyerId: "1",
                lawyerName: "احمد محمدی",
                date: "1402-05-20",
                time: "14:30",
                duration: "30 دقیقه",
                price: 250000,
                status: "completed",
                type: "scheduled",
                subject: "مشاوره در مورد قرارداد اجاره",
                invoiceNumber: "INV-20230520-001"
            },
            {
                id: "c2",
                userId: "user1",
                lawyerId: "2",
                lawyerName: "سارا رضایی",
                date: "1402-05-25",
                time: "10:00",
                duration: "45 دقیقه",
                price: 350000,
                status: "confirmed",
                type: "scheduled",
                subject: "مشاوره طلاق"
            },
            {
                id: "c3",
                userId: "user1",
                lawyerId: "3",
                lawyerName: "رضا حسینی",
                date: "1402-05-15",
                time: "16:00",
                duration: "30 دقیقه",
                price: 300000,
                status: "completed",
                type: "instant",
                invoiceNumber: "INV-20230515-002"
            }
        ],
        services: [
            {
                id: "s1",
                userId: "user1",
                lawyerId: "1",
                lawyerName: "احمد محمدی",
                serviceName: "تنظیم لایحه",
                description: "تنظیم لایحه دفاعیه برای پرونده ملکی",
                price: 1149000,
                status: "completed",
                createdAt: "1402-05-10",
                completedAt: "1402-05-12",
                invoiceNumber: "INV-20230510-003"
            },
            {
                id: "s2",
                userId: "user1",
                lawyerId: "4",
                lawyerName: "مریم اکبری",
                serviceName: "بررسی کامل مدارک",
                description: "بررسی مدارک مالیاتی شرکت",
                price: 615000,
                status: "in-progress",
                createdAt: "1402-05-18"
            }
        ],
        favorites: [
            {
                id: "f1",
                lawyerId: "1",
                lawyerName: "احمد محمدی",
                lawyerSpecialty: "حقوقی",
                createdAt: "2023-04-10"
            },
            {
                id: "f2",
                lawyerId: "2",
                lawyerName: "سارا رضایی",
                lawyerSpecialty: "خانواده",
                createdAt: "2023-04-15"
            }
        ]
    },
    {
        id: "lawyer1",
        name: "احمد",
        username:"ahmad",
        lastName: "محمدی",
        mobile: "09196421264",
        phone: "02112345678",
        role: "lawyer",
        profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
        createdAt: "2022-05-10",
        specialty: "حقوقی",
        province: "تهران",
        city: "تهران",
        about: "وکیل پایه یک دادگستری با بیش از 10 سال سابقه در امور حقوقی، خانواده و کیفری. فارغ‌التحصیل از دانشگاه تهران و عضو کانون وکلای دادگستری مرکز.",
        experience: 12,
        views: 2450,
        address: "تهران، خیابان ولیعصر، پلاک 123",
        rating: 4.8,
        consultationFee: 500000,
        offeredServices: [
            { id: "1", name: "تنظیم لایحه", price: 1149000 },
            { id: "3", name: "تنظیم دادخواست", price: 1459000 },
            { id: "5", name: "بررسی کامل مدارک", price: 615000 }
        ],
        transactions: [
            {
                id: "t1",
                amount: 250000,
                type: "consultation",
                description: "مشاوره حقوقی - علی احمدی",
                status: "completed",
                createdAt: "1402-05-20",
                invoiceNumber: "INV-20230520-001"
            },
            {
                id: "t2",
                amount: 1149000,
                type: "service",
                description: "تنظیم لایحه - علی احمدی",
                status: "completed",
                createdAt: "1402-05-12",
                invoiceNumber: "INV-20230510-003"
            },
            {
                id: "t3",
                amount: 350000,
                type: "consultation",
                description: "مشاوره خانواده - مریم رضایی",
                status: "pending",
                createdAt: "1402-06-01",
                invoiceNumber: "INV-20230601-001"
            }
        ],
        consultations: [
            {
                id: "c1",
                userId: "user1",
                lawyerId: "1",
                lawyerName: "احمد محمدی",
                date: "1402-05-20",
                time: "14:30",
                duration: "30 دقیقه",
                price: 250000,
                status: "completed",
                type: "scheduled",
                subject: "مشاوره در مورد قرارداد اجاره",
                invoiceNumber: "INV-20230520-002"
            }
        ],
        services: [
            {
                id: "s1",
                userId: "user1",
                lawyerId: "1",
                lawyerName: "احمد محمدی",
                serviceName: "تنظیم لایحه",
                description: "تنظیم لایحه دفاعیه برای پرونده ملکی",
                price: 1149000,
                status: "completed",
                createdAt: "1402-05-10",
                completedAt: "1402-05-12",
                invoiceNumber: "INV-20230510-003"
            }
        ],
        timeSlots: [
            {
                id: "ts1",
                date: "1402-05-21",
                startTime: "09:00",
                endTime: "10:00",
                isBooked: false
            },
            {
                id: "ts2",
                date: "1402-05-21",
                startTime: "10:00",
                endTime: "11:00",
                isBooked: true
            },
            {
                id: "ts3",
                date: "1402-05-21",
                startTime: "11:00",
                endTime: "12:00",
                isBooked: false
            }
        ],
        weeklyTemplate: {
            saturday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
            sunday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
            monday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
            tuesday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
            wednesday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
            thursday: { hours: [9, 10, 11, 14, 15, 16, 17], isHoliday: false },
            friday: { hours: [], isHoliday: true }
        },
        clients: [
            {
                id: "client1",
                name: "علی",
                lastName: "احمدی",
                mobile: "09123456789",
                phone: "09123456789",
                totalConsultations: 3,
                totalSpent: 1699000,
                lastConsultation: "1402-05-20"
            }
        ],
        transactions: [
            {
                id: "t1",
                amount: 250000,
                type: "consultation",
                description: "مشاوره حقوقی - علی احمدی",
                status: "completed",
                createdAt: "1402-05-20",
                invoiceNumber: "INV-20230520-001"
            },
            {
                id: "t2",
                amount: 1149000,
                type: "service",
                description: "تنظیم لایحه - علی احمدی",
                status: "completed",
                createdAt: "1402-05-12",
                invoiceNumber: "INV-20230510-003"
            }
        ],
        favorites: [

        ]
    },
    {
        id: "lawyer2",
        name: "سارا",
        username:"sara",
        lastName: "رضایی",
        mobile: "09189001937",
        phone: "03112345678",
        role: "lawyer",
        profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
        createdAt: "2023-06-20",
        specialty: "خانواده",
        province: "اصفهان",
        city: "اصفهان",
        about: "متخصص در امور خانواده، طلاق، حضانت و مهریه. با سابقه درخشان در پرونده‌های خانوادگی و ارائه مشاوره تخصصی به زوجین.",
        experience: 8,
        views: 1890,
        address: "اصفهان، میدان نقش جهان، خیابان چهارباغ",
        rating: 4.9,
        consultationFee: 450000,
        // این وکیل تازه ثبت نام کرده و داده‌های خالی دارد
        consultations: [],
        services: [],
        timeSlots: [],
        clients: [],
        transactions: [],
        favorites: [

        ]
    }
];

// سایر داده‌های ثابت
export const provinces = [
    { id: "tehran", name: "تهران", cities: ["تهران", "شهریار", "اسلامشهر", "پردیس"] },
    { id: "isfahan", name: "اصفهان", cities: ["اصفهان", "کاشان", "خمینی‌شهر", "فلاورجان"] },
    { id: "fars", name: "فارس", cities: ["شیراز", "مرودشت", "جهرم", "فسا"] },
    { id: "alborz", name: "البرز", cities: ["کرج", "هشتگرد", "نظرآباد", "اشتهارد"] },
    { id: "khorasan", name: "خراسان رضوی", cities: ["مشهد", "نیشابور", "سبزوار", "گناباد"] }
];





// در انتهای فایل اضافه کنید
export const consultationOptions = [
    { id: "15min", name: "15 دقیقه", price: 150000 },
    { id: "30min", name: "30 دقیقه", price: 250000 },
    { id: "45min", name: "45 دقیقه", price: 350000 },
    { id: "60min", name: "60 دقیقه", price: 450000 }
];

export const availableServices = [
    { id: "1", name: "تنظیم لایحه", price: 1149000 },
    { id: "2", name: "تنظیم اظهارنامه", price: 749000 },
    { id: "3", name: "تنظیم دادخواست", price: 1459000 },
    { id: "4", name: "تنظیم قرارداد", price: 2449000 },
    { id: "5", name: "بررسی کامل مدارک", price: 615000 },
    { id: "6", name: "بررسی مدارک(تا 3صفحه)", price: 390000 },
    { id: "7", name: "بررسی و تفهیم رای", price: 349000 },
    { id: "8", name: "صلح نامه", price: 2000000 }
];

// lib/api/mockData.ts

// اضافه کردن به انتهای فایل
export const subscriptionPlansData = [
    {
        id: "2month",
        name: "پلن 2 ماهه",
        duration: 2,
        durationUnit: "ماه",
        basePrice: 100000, // قیمت پایه برای هر پله
        maxSteps: 5,
        discount: 10, // 10% تخفیف
        features: [
            "پشتیبانی عادی",
            "گزارشات ماهانه",
            "10 درصد صرفه جویی"
        ],
        popular: false
    },
    {
        id: "6month",
        name: "پلن 6 ماهه",
        duration: 6,
        durationUnit: "ماه",
        basePrice: 100000, // قیمت پایه برای هر پله
        maxSteps: 5,
        discount: 30, // 30% تخفیف
        features: [
            "نشان ویژه رایگان",
            "پشتیبانی ویژه",
            "گزارشات هفتگی",
            "30 درصد صرفه جویی"
        ],
        popular: true
    },
    {
        id: "12month",
        name: "پلن یکساله",
        duration: 12,
        durationUnit: "ماه",
        basePrice: 100000, // قیمت پایه برای هر پله
        maxSteps: 5,
        discount: 40, // 40% تخفیف
        features: [
            "نشان وکیل ویژه",
            "نشان ویژه رایگان",
            "پشتیبانی اختصاصی",
            "گزارشات روزانه",
            "اولویت ویژه در نمایش",
            "40 درصد صرفه جویی"
        ],
        popular: false
    }
];

// lib/api/mockData.ts

export const legalQuestionsData: LegalQuestion[] = [
    {
        id: "q1",
        userId: "user1",
        userName: "علی احمدی",
        title: "شرایط طلاق توافقی چیست؟",
        content: "می‌خواستم بدانم شرایط طلاق توافقی چیست و چه مدارکی نیاز داریم؟",
        category: "خانواده",
        createdAt: "2023-05-10T10:30:00",
        updatedAt: "2023-05-12T14:45:00",
        isAnswered: true,
        viewCount: 125,
        answers: [
            {
                id: "a1",
                questionId: "q1",
                lawyerId: "lawyer2",
                lawyerName: "سارا رضایی",
                content: "برای طلاق توافقی، زوجین باید به توافق برسند و در مورد مهریه، حضانت فرزندان و نفقه تصمیم بگیرند. مدارک مورد نیاز شامل شناسنامه، کارت ملی، سند ازدواج و 6 عکس پرسنلی است.",
                createdAt: "2023-05-12T14:45:00",
                isAccepted: true,
                likes: 15
            },
            {
                id: "a2",
                questionId: "q1",
                lawyerId: "lawyer1",
                lawyerName: "احمد محمدی",
                content: "علاوه بر مدارکی که دوست اشاره کردند، نیاز به حضور در دفترخانه اسناد رسمی و ثبت در سامانه ثبتی دارید. همچنین اگر زوجین دارای فرزند باشند، باید در مورد حضانت توافق کنند.",
                createdAt: "2023-05-12T16:20:00",
                isAccepted: false,
                likes: 8
            }
        ]
    },
    {
        id: "q3",
        userId: "user2",
        userName: "مریم رضایی",
        title: "شرایط دریافت حضانت فرزند بعد از طلاق چیست؟",
        content: "من در حال طلاق از همسرم هستم و یک فرزند 7 ساله دارم. می‌خواستم بدانم شرایط دریافت حضانت فرزند بعد از طلاق چیست و آیا من می‌توانم حضانت را به دست بیاورم؟",
        category: "خانواده",
        createdAt: "2023-06-15T09:30:00",
        updatedAt: "2023-06-15T09:30:00",
        isAnswered: false,
        viewCount: 45,
        answers: []
    },
    {
        id: "q4",
        userId: "user3",
        userName: "رضا کریمی",
        title: "نحوه شکایت از کارفرما برای عدم پرداخت حقوق",
        content: "سه ماه است که کارفرما حقوق من را پرداخت نکرده و قرارداد کاری هم دارم. می‌خواستم بدانم چگونه می‌توانم از کارفرما شکایت کنم و چه مدارکی نیاز دارم؟",
        category: "کار",
        createdAt: "2023-06-18T14:20:00",
        updatedAt: "2023-06-18T14:20:00",
        isAnswered: false,
        viewCount: 32,
        answers: []
    },
    {
        id: "q5",
        userId: "user4",
        userName: "سارا محمدی",
        title: "تفاوت ملک شخصی و مشاع در قانون مدنی",
        content: "می‌خواستم تفاوت ملک شخصی و مشاع را در قانون مدنی ایران بدانم و آیا می‌توانم سهم خود را از ملک مشاع جدا کنم؟",
        category: "ملکی",
        createdAt: "2023-06-20T11:45:00",
        updatedAt: "2023-06-20T11:45:00",
        isAnswered: false,
        viewCount: 28,
        answers: []
    },
    {
        id: "q6",
        userId: "user5",
        userName: "علی اکبری",
        title: "شرایط آزادی مشروط زندانیان",
        content: "برادرم به جرم کلاهبرداری به 5 سال حبس محکوم شده و 2 سال از محکومیتش را گذرانده. می‌خواستم بدانم آیا شرایط آزادی مشروط برای او فراهم است و چه مراحلی باید طی کند؟",
        category: "کیفری",
        createdAt: "2023-06-22T16:10:00",
        updatedAt: "2023-06-22T16:10:00",
        isAnswered: false,
        viewCount: 51,
        answers: []
    }
];

// در lib/api/mockData.ts
export const consultationPricingData: ConsultationPricing[] = [
    {
        id: "1_15min",
        lawyerId: "1",
        duration: "15min",
        inPersonPrice: 150000,
        phonePrice: 120000,
        videoPrice: 135000,
        phonePercentage: 80,
        videoPercentage: 90,
        isActive: true
    },
    {
        id: "1_30min",
        lawyerId: "1",
        duration: "30min",
        inPersonPrice: 250000,
        phonePrice: 200000,
        videoPrice: 225000,
        phonePercentage: 80,
        videoPercentage: 90,
        isActive: true
    },
    {
        id: "1_45min",
        lawyerId: "1",
        duration: "45min",
        inPersonPrice: 350000,
        phonePrice: 280000,
        videoPrice: 315000,
        phonePercentage: 80,
        videoPercentage: 90,
        isActive: true
    },
    {
        id: "1_60min",
        lawyerId: "1",
        duration: "60min",
        inPersonPrice: 450000,
        phonePrice: 360000,
        videoPrice: 405000,
        phonePercentage: 80,
        videoPercentage: 90,
        isActive: true
    },
    {
        id: "1_90min",
        lawyerId: "1",
        duration: "90min",
        inPersonPrice: 600000,
        phonePrice: 480000,
        videoPrice: 540000,
        phonePercentage: 80,
        videoPercentage: 90,
        isActive: true
    },
    {
        id: "1_120min",
        lawyerId: "1",
        duration: "120min",
        inPersonPrice: 750000,
        phonePrice: 600000,
        videoPrice: 675000,
        phonePercentage: 80,
        videoPercentage: 90,
        isActive: true
    }
];


