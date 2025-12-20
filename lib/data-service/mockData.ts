// lib/data-service/mockData.ts

import {
    BaseService,
    ConsultationDuration,
    Lawyer,
    LawyerDetail,
    LawyerListItem,
    LicenseType,
    Province,
    ProvinceData,
    RegistrationData,
    ServiceCategory,
    Skill,
    SocialPlatform,
    Specialty,
    User,
    UserRole
} from './types';

// ==================== Base Services ====================

// ==================== License Types ====================
export const licenseTypes: { id: LicenseType; title: string }[] = [
    { id: LicenseType.BASE1, title: "پایه یک دادگستری" },
    { id: LicenseType.BASE2, title: "پایه دو دادگستری" },
    { id: LicenseType.APPRENTICE, title: "کارآموز وکالت" },
    { id: LicenseType.INTERN, title: "کارآموز حقوقی" },
    { id: LicenseType.JUDICIARY, title: "کاردان دادگستری" },
    { id: LicenseType.LEGAL_CONSULTANT, title: "مشاور حقوقی" }
];

export const specialtyTitles: { id: Specialty; title: string }[] = [
    { id: Specialty.FAMILY, title: "خانواده" },
    { id: Specialty.REAL_ESTATE, title: "ملکی" },
    { id: Specialty.LEGAL, title: "حقوقی" },
    { id: Specialty.CRIMINAL, title: "کیفری" },
    { id: Specialty.COMMERCIAL, title: "تجاری، شرکت‌ها و مالکیت معنوی" },
    { id: Specialty.ADMINISTRATIVE, title: "دیوان عدالت-شهرداری" },
    { id: Specialty.REGISTRATION, title: "ثبتی" },
    { id: Specialty.CUSTOMS, title: "گمرکی" },
    { id: Specialty.TAX, title: "امور مالیاتی" },
    { id: Specialty.CYBER_CRIME, title: "جرایم اینترنتی" },
    { id: Specialty.IMMIGRATION, title: "مهاجرت" },
    { id: Specialty.INTERNATIONAL, title: "امور بین‌المللی" },
    { id: Specialty.TRAFFIC_ACCIDENT, title: "تصادفات" },
    { id: Specialty.DRUG, title: "مواد مخدر" },
    { id: Specialty.MEDICAL_MALPRACTICE, title: "قصور پزشکی" },
    { id: Specialty.LABOR, title: "کارفرما/کارگر - پیمانکار" }
];
// تابع برای دریافت عنوان تخصص بر اساس id
export const getSpecialtyTitle = (id: Specialty): string => {
    const specialty = specialtyTitles.find(item => item.id === id);
    return specialty ? specialty.title : "نامشخص";
};
// lib/data-service/mockData.ts

// ... (کدهای قبلی)

// ==================== Skill Categories ====================
// lib/data-service/mockData.ts

// ... (کدهای قبلی)

// ==================== Skill Categories ====================
export const skillCategories = [
    { id: 'communication', title: 'مهارت‌های ارتباطی و مشاوره‌ای' },
    { id: 'research', title: 'مهارت‌های تحقیقی و تحلیلی' },
    { id: 'writing', title: 'مهارت‌های نگارشی' },
    { id: 'court', title: 'مهارت‌های دادگاهی' },
    { id: 'management', title: 'مهارت‌های مدیریتی' },
    { id: 'legal', title: 'مهارت‌های تخصصی حقوقی' },
    { id: 'technical', title: 'مهارت‌های فنی و دیجیتال' },
    { id: 'financial', title: 'مهارت‌های مالی و حسابداری' },
    { id: 'ethics', title: 'مهارت‌های اخلاق حرفه‌ای' }
];

// ==================== Skill Titles with Categories ====================
export const skillsWithCategories = [
    // مهارت‌های ارتباطی و مشاوره‌ای
    { id: Skill.CLIENT_COUNSELING, title: "مشاوره حقوقی به موکل", category: 'communication' },
    { id: Skill.NEGOTIATION, title: "مذاکره و حل و فصل اختلافات", category: 'communication' },
    { id: Skill.MEDIATION, title: "میانجی‌گری و سازش", category: 'communication' },
    { id: Skill.PERSUASION, title: "اقناع و متقاعدسازی", category: 'communication' },
    { id: Skill.INTERVIEWING, title: "مصاحبه با موکل و شهود", category: 'communication' },

    // مهارت‌های تحقیقی و تحلیلی
    { id: Skill.LEGAL_RESEARCH, title: "تحقیق حقوقی", category: 'research' },
    { id: Skill.CASE_ANALYSIS, title: "تحلیل پرونده", category: 'research' },
    { id: Skill.EVIDENCE_EVALUATION, title: "ارزیابی ادله و مدارک", category: 'research' },
    { id: Skill.STATUTE_INTERPRETATION, title: "تفسیر قوانین", category: 'research' },
    { id: Skill.PRECEDENT_ANALYSIS, title: "تحلیل آراء وحدت رویه", category: 'research' },

    // مهارت‌های نگارشی
    { id: Skill.PLEADING_DRAFTING, title: "تنظیم دادخواست و لوایح", category: 'writing' },
    { id: Skill.CONTRACT_DRAFTING, title: "تنظیم قرارداد", category: 'writing' },
    { id: Skill.LEGAL_OPINION_WRITING, title: "تنظیم نظریه مشورتی", category: 'writing' },
    { id: Skill.MOTION_WRITING, title: "تنظیم درخواست‌های قضایی", category: 'writing' },
    { id: Skill.REPORT_WRITING, title: "تنظیم گزارش حقوقی", category: 'writing' },

    // مهارت‌های دادگاهی
    { id: Skill.ORAL_ADVOCACY, title: "دفاع شفاهی در دادگاه", category: 'court' },
    { id: Skill.CROSS_EXAMINATION, title: "بازجویی و سوال از شهود", category: 'court' },
    { id: Skill.DIRECT_EXAMINATION, title: "استماع شهود خودی", category: 'court' },
    { id: Skill.OPENING_STATEMENT, title: "بیان مقدماتی", category: 'court' },
    { id: Skill.CLOSING_ARGUMENT, title: "بیان پایانی و تجمیع دلایل", category: 'court' },

    // مهارت‌های مدیریتی
    { id: Skill.CASE_MANAGEMENT, title: "مدیریت پرونده", category: 'management' },
    { id: Skill.TIME_MANAGEMENT, title: "مدیریت زمان", category: 'management' },
    { id: Skill.CLIENT_MANAGEMENT, title: "مدیریت رابطه با موکل", category: 'management' },
    { id: Skill.DEADLINE_MANAGEMENT, title: "مدیریت مهلت‌های قانونی", category: 'management' },
    { id: Skill.COST_MANAGEMENT, title: "مدیریت هزینه‌های پرونده", category: 'management' },

    // مهارت‌های تخصصی حقوقی
    { id: Skill.DUE_DILIGENCE, title: "بررسی حقوقی", category: 'legal' },
    { id: Skill.RISK_ASSESSMENT, title: "ارزیابی ریسک حقوقی", category: 'legal' },
    { id: Skill.COMPLIANCE_REVIEW, title: "بررسی انطباق با قوانین", category: 'legal' },
    { id: Skill.DISPUTE_RESOLUTION, title: "حل و فصل اختلافات", category: 'legal' },
    { id: Skill.SETTLEMENT_NEGOTIATION, title: "مذاکره برای سازش", category: 'legal' },

    // مهارت‌های فنی و دیجیتال
    { id: Skill.E_FILING, title: "اقامه دعوا الکترونیکی", category: 'technical' },
    { id: Skill.LEGAL_TECH, title: "استفاده از فناوری حقوقی", category: 'technical' },
    { id: Skill.DOCUMENT_MANAGEMENT, title: "مدیریت اسناد الکترونیکی", category: 'technical' },
    { id: Skill.EVIDENCE_DIGITIZATION, title: "دیجیتال‌سازی مدارک", category: 'technical' },
    { id: Skill.ONLINE_RESEARCH, title: "تحقیق اینترنتی", category: 'technical' },

    // مهارت‌های مالی و حسابداری
    { id: Skill.LEGAL_ACCOUNTING, title: "حسابداری حقوقی", category: 'financial' },
    { id: Skill.DAMAGES_CALCULATION, title: "محاسبه خسارات", category: 'financial' },
    { id: Skill.COST_BENEFIT_ANALYSIS, title: "تحلیل هزینه-فایده", category: 'financial' },
    { id: Skill.FINANCIAL_ASSESSMENT, title: "ارزیابی مالی پرونده", category: 'financial' },

    // مهارت‌های اخلاق حرفه‌ای
    { id: Skill.PROFESSIONAL_ETHICS, title: "رعایت اخلاق حرفه‌ای", category: 'ethics' },
    { id: Skill.CONFIDENTIALITY, title: "حفظ اسرار موکل", category: 'ethics' },
    { id: Skill.CONFLICT_RESOLUTION, title: "مدیریت تعارض منافع", category: 'ethics' },
    { id: Skill.PROFESSIONAL_CONDUCT, title: "رفتار حرفه‌ای در دادگاه و خارج", category: 'ethics' }
];



// ==================== Skill Titles ====================
export const skillTitles: { id: Skill; title: string }[] = [
    // مهارت‌های ارتباطی و مشاوره‌ای
    { id: Skill.CLIENT_COUNSELING, title: "مشاوره حقوقی به موکل" },
    { id: Skill.NEGOTIATION, title: "مذاکره و حل و فصل اختلافات" },
    { id: Skill.MEDIATION, title: "میانجی‌گری و سازش" },
    { id: Skill.PERSUASION, title: "اقناع و متقاعدسازی" },
    { id: Skill.INTERVIEWING, title: "مصاحبه با موکل و شهود" },

    // مهارت‌های تحقیقی و تحلیلی
    { id: Skill.LEGAL_RESEARCH, title: "تحقیق حقوقی" },
    { id: Skill.CASE_ANALYSIS, title: "تحلیل پرونده" },
    { id: Skill.EVIDENCE_EVALUATION, title: "ارزیابی ادله و مدارک" },
    { id: Skill.STATUTE_INTERPRETATION, title: "تفسیر قوانین" },
    { id: Skill.PRECEDENT_ANALYSIS, title: "تحلیل آراء وحدت رویه" },

    // مهارت‌های نگارشی
    { id: Skill.PLEADING_DRAFTING, title: "تنظیم دادخواست و لوایح" },
    { id: Skill.CONTRACT_DRAFTING, title: "تنظیم قرارداد" },
    { id: Skill.LEGAL_OPINION_WRITING, title: "تنظیم نظریه مشورتی" },
    { id: Skill.MOTION_WRITING, title: "تنظیم درخواست‌های قضایی" },
    { id: Skill.REPORT_WRITING, title: "تنظیم گزارش حقوقی" },

    // مهارت‌های دادگاهی
    { id: Skill.ORAL_ADVOCACY, title: "دفاع شفاهی در دادگاه" },
    { id: Skill.CROSS_EXAMINATION, title: "بازجویی و سوال از شهود" },
    { id: Skill.DIRECT_EXAMINATION, title: "استماع شهود خودی" },
    { id: Skill.OPENING_STATEMENT, title: "بیان مقدماتی" },
    { id: Skill.CLOSING_ARGUMENT, title: "بیان پایانی و تجمیع دلایل" },

    // مهارت‌های مدیریتی
    { id: Skill.CASE_MANAGEMENT, title: "مدیریت پرونده" },
    { id: Skill.TIME_MANAGEMENT, title: "مدیریت زمان" },
    { id: Skill.CLIENT_MANAGEMENT, title: "مدیریت رابطه با موکل" },
    { id: Skill.DEADLINE_MANAGEMENT, title: "مدیریت مهلت‌های قانونی" },
    { id: Skill.COST_MANAGEMENT, title: "مدیریت هزینه‌های پرونده" },

    // مهارت‌های تخصصی حقوقی
    { id: Skill.DUE_DILIGENCE, title: "بررسی حقوقی" },
    { id: Skill.RISK_ASSESSMENT, title: "ارزیابی ریسک حقوقی" },
    { id: Skill.COMPLIANCE_REVIEW, title: "بررسی انطباق با قوانین" },
    { id: Skill.DISPUTE_RESOLUTION, title: "حل و فصل اختلافات" },
    { id: Skill.SETTLEMENT_NEGOTIATION, title: "مذاکره برای سازش" },

    // مهارت‌های فنی و دیجیتال
    { id: Skill.E_FILING, title: "اقامه دعوا الکترونیکی" },
    { id: Skill.LEGAL_TECH, title: "استفاده از فناوری حقوقی" },
    { id: Skill.DOCUMENT_MANAGEMENT, title: "مدیریت اسناد الکترونیکی" },
    { id: Skill.EVIDENCE_DIGITIZATION, title: "دیجیتال‌سازی مدارک" },
    { id: Skill.ONLINE_RESEARCH, title: "تحقیق اینترنتی" },

    // مهارت‌های مالی و حسابداری
    { id: Skill.LEGAL_ACCOUNTING, title: "حسابداری حقوقی" },
    { id: Skill.DAMAGES_CALCULATION, title: "محاسبه خسارات" },
    { id: Skill.COST_BENEFIT_ANALYSIS, title: "تحلیل هزینه-فایده" },
    { id: Skill.FINANCIAL_ASSESSMENT, title: "ارزیابی مالی پرونده" },

    // مهارت‌های اخلاق حرفه‌ای
    { id: Skill.PROFESSIONAL_ETHICS, title: "رعایت اخلاق حرفه‌ای" },
    { id: Skill.CONFIDENTIALITY, title: "حفظ اسرار موکل" },
    { id: Skill.CONFLICT_RESOLUTION, title: "مدیریت تعارض منافع" },
    { id: Skill.PROFESSIONAL_CONDUCT, title: "رفتار حرفه‌ای در دادگاه و خارج" }
];

// ... (بقیه کدها)
/**
 * لیست کامل خدمات پایه که وکلا می‌توانند انتخاب کنند
 */
export const baseServices: BaseService[] = [
    {
        id: "svc_1",
        title: "تنظیم لایحه",
        description: "تنظیم لایحه دفاعیه برای دادگاه",
        category: ServiceCategory.DOCUMENT
    },
    {
        id: "svc_2",
        title: "تنظیم اظهارنامه",
        description: "تنظیم اظهارنامه رسمی",
        category: ServiceCategory.DOCUMENT
    },
    {
        id: "svc_3",
        title: "تنظیم دادخواست",
        description: "تنظیم دادخواست برای مراجع قضایی",
        category: ServiceCategory.DOCUMENT
    },
    {
        id: "svc_4",
        title: "تنظیم قرارداد",
        description: "تنظیم انواع قراردادهای حقوقی",
        category: ServiceCategory.CONTRACT
    },
    {
        id: "svc_5",
        title: "بررسی کامل مدارک",
        description: "بررسی تخصصی مدارک حقوقی",
        category: ServiceCategory.CONSULTATION
    },
    {
        id: "svc_6",
        title: "بررسی مدارک(تا 3صفحه)",
        description: "بررسی سریع مدارک تا 3 صفحه",
        category: ServiceCategory.CONSULTATION
    },
    {
        id: "svc_7",
        title: "بررسی و تفهیم رای",
        description: "تفسیر و توضیح احکام قضایی",
        category: ServiceCategory.CONSULTATION
    },
    {
        id: "svc_8",
        title: "صلح نامه",
        description: "تنظیم صلح نامه برای حل اختلاف",
        category: ServiceCategory.OTHER
    },
    {
        id: "svc_9",
        title: "وکالت در دادگاه",
        description: "قبول وکالت و دفاع در دادگاه",
        category: ServiceCategory.REPRESENTATION
    },
    {
        id: "svc_10",
        title: "مشاوره حقوقی",
        description: "مشاوره تخصصی در امور حقوقی",
        category: ServiceCategory.CONSULTATION
    }
];

// ==================== Provinces ====================
export const provincesData: ProvinceData[] = [
    {
        id: "tehran",
        code: "tehran",
        name: "تهران",
        cities: [
            { id: "tehran", code: "tehran", name: "تهران", provinceCode: "01" },
            { id: "shahriar", code: "shahriar", name: "شهریار", provinceCode: "01" },
            { id: "eslamshahr", code: "eslamshahr", name: "اسلامشهر", provinceCode: "01" },
            { id: "pardis", code: "pardis", name: "پردیس", provinceCode: "01" },
            { id: "damavand", code: "damavand", name: "دماوند", provinceCode: "01" }
        ]
    },
    {
        id: "isfahan",
        code: "isfahan",
        name: "اصفهان",
        cities: [
            { id: "isfahan", code: "isfahan", name: "اصفهان", provinceCode: "02" },
            { id: "kashan", code: "kashan", name: "کاشان", provinceCode: "02" },
            { id: "khomeinishahr", code: "khomeinishahr", name: "خمینی‌شهر", provinceCode: "02" },
            { id: "felayezan", code: "felayezan", name: "فلاورجان", provinceCode: "02" },
            { id: "najafabad", code: "najafabad", name: "نجف‌آباد", provinceCode: "02" }
        ]
    },
    {
        id: "fars",
        code: "fars",
        name: "فارس",
        cities: [
            { id: "shiraz", code: "0301", name: "شیراز", provinceCode: "03" },
            { id: "marvdasht", code: "0302", name: "مرودشت", provinceCode: "03" },
            { id: "jahan", code: "0303", name: "جهرم", provinceCode: "03" },
            { id: "fasa", code: "0304", name: "فسا", provinceCode: "03" },
            { id: "saadatshahr", code: "0305", name: "سعدشهر", provinceCode: "03" }
        ]
    },
    {
        id: "alborz",
        code: "alborz",
        name: "البرز",
        cities: [
            { id: "karaj", code: "karaj", name: "کرج", provinceCode: "04" },
            { id: "hashtgerd", code: "hashtgerd", name: "هشتگرد", provinceCode: "04" },
            { id: "nazarabad", code: "nazarabad", name: "نظرآباد", provinceCode: "04" },
            { id: "eshtehard", code: "eshtehard", name: "اشتهارد", provinceCode: "04" },
            { id: "fardis", code: "fardis", name: "فردیس", provinceCode: "04" }
        ]
    },
    {
        id: "khorasan",
        code: "khorasan",
        name: "خراسان رضوی",
        cities: [
            { id: "mashhad", code: "mashhad", name: "مشهد", provinceCode: "05" },
            { id: "neyshabur", code: "neyshabur", name: "نیشابور", provinceCode: "05" },
            { id: "sabzevar", code: "sabzevar", name: "سبزوار", provinceCode: "05" },
            { id: "gonabad", code: "gonabad", name: "گناباد", provinceCode: "05" },
            { id: "torbat", code: "torbat", name: "تربت جام", provinceCode: "05" }
        ]
    }
];

// ==================== Lawyers Data ====================
/**
 * داده‌های کامل وکلا
 */
export const lawyersData: Lawyer[] = [
    {
        id: "1",
        username: "ahmad",
        name: "احمد",
        lastName: "محمدی",
        mobile: "09146421264",
        phone: "021-12345678",
        email: "ahmad@example.com",
        role: UserRole.LAWYER,
        profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
        isActive: true,
        isVerified: true,
        createdAt: "2022-05-10T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
        commentsCount:2,
        license: {
            type: LicenseType.BASE1,
            barAssociation: "کانون وکلای دادگستری مرکز",
            licenseNumber: "12345"
        },

        specialties: [Specialty.LEGAL, Specialty.FAMILY],

        skills: [Skill.CONTRACT_DRAFTING, Skill.CASE_ANALYSIS],

        education: {
            degree: "کارشناسی ارشد حقوق خصوصی",
            university: "دانشگاه تهران",
            graduationYear: 2012
        },

        experienceYears: 12,
        about: "وکیل پایه یک دادگستری با بیش از 10 سال سابقه در امور حقوقی، خانواده و کیفری. فارغ‌التحصیل از دانشگاه تهران و عضو کانون وکلای دادگستری مرکز. دارای سابقه درخشان در پرونده‌های مهم حقوقی و خانوادگی و ارائه مشاوره تخصصی به موکلین.",
        successfulCases: 45,

        location: {
            province: Province.TEHRAN,
            city: "تهران",
            address: "تهران، خیابان ولیعصر، پلاک 123"
        },

        contact: {
            phone: "021-12345678",
            mobile: "09146421264",
            email: "ahmad@example.com"
        },

        socials: [
            { id: "sc1", platform: SocialPlatform.INSTAGRAM, url: "https://instagram.com/ahmad_lawyer", username: "ahmad_lawyer" },
            { id: "sc2", platform: SocialPlatform.TELEGRAM, url: "https://t.me/ahmad_lawyer", username: "ahmad_lawyer" }
        ],

        services: [
            { id: "ls1", serviceId: "svc_1", title: "تنظیم لایحه", price: 1149000, isActive: true },
            { id: "ls2", serviceId: "svc_3", title: "تنظیم دادخواست", price: 1459000, isActive: true },
            { id: "ls3", serviceId: "svc_5", title: "بررسی کامل مدارک", price: 615000, isActive: true }
        ],

        consultationPricing: [
            {
                id: "cp1",
                duration: ConsultationDuration.MIN_15,
                inPersonPrice: 150000,
                phonePrice: 120000,
                videoPrice: 135000,
                textChatPrice: 100000,
                isActive: true
            },
            {
                id: "cp2",
                duration: ConsultationDuration.MIN_30,
                inPersonPrice: 250000,
                phonePrice: 200000,
                videoPrice: 225000,
                textChatPrice: 180000,
                isActive: true
            },
            {
                id: "cp3",
                duration: ConsultationDuration.MIN_60,
                inPersonPrice: 450000,
                phonePrice: 360000,
                videoPrice: 405000,
                textChatPrice: 320000,
                isActive: true
            }
        ],

        caseRecords: [
            {
                id: "cr1",
                category: "خانواده",
                title: "پرونده حضانت",
                summary: "پیگیری پرونده حضانت که منجر به صدور حکم حضانت به نفع موکل شد. موکل توانست حضانت فرزند 7 ساله خود را با ارائه مستندات محکم کسب کند.",
                result: "حکم به نفع موکل",
                year: 2023,
                isVerified: true
            },
            {
                id: "cr2",
                category: "حقوقی",
                title: "پرونده قرارداد",
                summary: "رسیدگی به پرونده اختلاف قراردادی بین دو شرکت و اخذ حکم به نفع موکل. پرونده مربوط به عدم اجرای تعهدات قراردادی بود.",
                result: "صدور رأی قطعی به نفع موکل",
                year: 2022,
                isVerified: true
            },
            {
                id: "cr3",
                category: "ملکی",
                title: "پرونده الزام به تنظیم سند",
                summary: "پیگیری پرونده الزام به تنظیم سند رسمی برای ملک مشاع. موکل توانست حکم قطعی برای تفکیک سهم خود از ملک مشاع بگیرد.",
                result: "صدور رأی قطعی به نفع موکل",
                year: 2021,
                isVerified: true
            }
        ],

        steps: 5,
        isVIP: true,
        rating: 4.8,
        reviewsCount: 54,
        views: 2450,
        questionPoints: 120,

        status: {
            isVerified: true,
            documentsCompleted: true
        }
    },
    {
        id: "2",
        username: "sara",
        name: "سارا",
        lastName: "رضایی",
        mobile: "09189001937",
        phone: "031-12345678",
        email: "sara@example.com",
        role: UserRole.LAWYER,
        profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
        commentsCount: 15,
        isActive: true,
        isVerified: true,
        createdAt: "2023-06-20T00:00:00Z",
        updatedAt: "2024-01-20T00:00:00Z",

        license: {
            type: LicenseType.BASE1,
            barAssociation: "کانون وکلای دادگستری اصفهان",
            licenseNumber: "67890"
        },

        specialties: [Specialty.FAMILY],

        skills: [Skill.MEDIATION, Skill.MEDIATION],

        education: {
            degree: "کارشناسی ارشد حقوق خانواده",
            university: "دانشگاه اصفهان",
            graduationYear: 2016
        },

        experienceYears: 8,
        about: "متخصص در امور خانواده، طلاق، حضانت و مهریه. با سابقه درخشان در پرونده‌های خانوادگی و ارائه مشاوره تخصصی به زوجین. دارای گواهینامه تخصصی در حقوق خانواده از کانون وکلای دادگستری.",
        successfulCases: 32,

        location: {
            province: Province.ISFAHAN,
            city: "اصفهان",
            address: "اصفهان، میدان نقش جهان، خیابان چهارباغ"
        },

        contact: {
            phone: "031-12345678",
            mobile: "09189001937",
            email: "sara@example.com"
        },

        socials: [
            { id: "sc3", platform: SocialPlatform.INSTAGRAM, url: "https://instagram.com/sara_lawyer", username: "sara_lawyer" },
            { id: "sc4", platform: SocialPlatform.WHATSAPP, url: "https://wa.me/989189001937", username: null }
        ],

        services: [
            { id: "ls4", serviceId: "svc_10", title: "مشاوره حقوقی", price: 450000, isActive: true },
            { id: "ls5", serviceId: "svc_8", title: "صلح نامه", price: 2000000, isActive: true },
            { id: "ls6", serviceId: "svc_2", title: "تنظیم اظهارنامه", price: 749000, isActive: true }
        ],

        consultationPricing: [
            {
                id: "cp4",
                duration: ConsultationDuration.MIN_30,
                inPersonPrice: 250000,
                phonePrice: 200000,
                videoPrice: 225000,
                textChatPrice: 180000,
                isActive: true
            },
            {
                id: "cp5",
                duration: ConsultationDuration.MIN_45,
                inPersonPrice: 350000,
                phonePrice: 280000,
                videoPrice: 315000,
                textChatPrice: 250000,
                isActive: true
            },
            {
                id: "cp6",
                duration: ConsultationDuration.MIN_60,
                inPersonPrice: 450000,
                phonePrice: 360000,
                videoPrice: 405000,
                textChatPrice: 320000,
                isActive: true
            }
        ],

        caseRecords: [
            {
                id: "cr3",
                category: "خانواده",
                title: "پرونده طلاق توافقی",
                summary: "پیگیری پرونده طلاق توافقی با موفقیت. زوجین به توافق در تمام موارد رسیدند و طلاق در کمترین زمان ممکن ثبت شد.",
                result: "طلاق توافقی",
                year: 2023,
                isVerified: true
            },
            {
                id: "cr4",
                category: "خانواده",
                title: "پرونده حضانت",
                summary: "دفاع از مادر در پرونده حضانت فرزند 5 ساله. با ارائه مستندات محکم، حضانت به مادر واگذار شد.",
                result: "حکم به نفع موکل",
                year: 2022,
                isVerified: true
            },
            {
                id: "cr5",
                category: "خانواده",
                title: "پرونده مهریه",
                summary: "پیگیری پرونده مطالبه مهریه. موکل توانست مهریه خود را با توافق طرف مقابل دریافت کند.",
                result: "توافق طرفین",
                year: 2023,
                isVerified: true
            }
        ],

        steps: 2,
        isVIP: false,
        rating: 4.9,
        reviewsCount: 38,
        views: 1890,
        questionPoints: 85,

        status: {
            isVerified: true,
            documentsCompleted: true
        }
    },
    {
        id: "3",
        username: "reza",
        name: "رضا",
        lastName: "حسینی",
        mobile: "09144133782",
        phone: "071-12345678",
        email: "reza@example.com",
        role: UserRole.LAWYER,
        profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
        commentsCount: 2,
        isActive: true,
        isVerified: true,
        createdAt: "2021-03-15T00:00:00Z",
        updatedAt: "2024-01-10T00:00:00Z",

        license: {
            type: LicenseType.BASE1,
            barAssociation: "کانون وکلای دادگستری فارس",
            licenseNumber: "54321"
        },

        specialties: [Specialty.CRIMINAL],

        skills: [Skill.CRIMINAL_LAW],

        education: {
            degree: "دکتری حقوق جزا و جرم‌شناسی",
            university: "دانشگاه شیراز",
            graduationYear: 2015
        },

        experienceYears: 15,
        about: "وکیل متخصص در امور کیفری، جرایم اقتصادی و دیوان عدالت اداری. با تجربه در دفاع از متهمان در پرونده‌های مهم. دارای سابقه درخشان در پرونده‌های کیفری و اقتصادی.",
        successfulCases: 67,

        location: {
            province: Province.FARS,
            city: "شیراز",
            address: "شیراز، خیابان زند، پلاک 45"
        },

        contact: {
            phone: "071-12345678",
            mobile: "09144133782",
            email: "reza@example.com"
        },

        socials: [
            { id: "sc5", platform: SocialPlatform.TELEGRAM, url: "https://t.me/reza_lawyer", username: "reza_lawyer" },
            { id: "sc6", platform: SocialPlatform.YOUTUBE, url: "https://youtube.com/@rezalaw", username: "rezalaw" }
        ],

        services: [
            { id: "ls7", serviceId: "svc_9", title: "وکالت در دادگاه", price: 2500000, isActive: true },
            { id: "ls8", serviceId: "svc_10", title: "مشاوره کیفری", price: 650000, isActive: true }
        ],

        consultationPricing: [
            {
                id: "cp7",
                duration: ConsultationDuration.MIN_30,
                inPersonPrice: 300000,
                phonePrice: 240000,
                videoPrice: 270000,
                textChatPrice: 200000,
                isActive: true
            },
            {
                id: "cp8",
                duration: ConsultationDuration.MIN_60,
                inPersonPrice: 500000,
                phonePrice: 400000,
                videoPrice: 450000,
                textChatPrice: 350000,
                isActive: true
            },
            {
                id: "cp9",
                duration: ConsultationDuration.MIN_90,
                inPersonPrice: 700000,
                phonePrice: 560000,
                videoPrice: 630000,
                textChatPrice: 490000,
                isActive: true
            }
        ],

        caseRecords: [
            {
                id: "cr6",
                category: "کیفری",
                title: "پرونده کلاهبرداری",
                summary: "دفاع موفق در پرونده کلاهبرداری که منجر به تبرئه موکل شد. با ارائه مستندات محکم، عدم ارتکاب جرم اثبات شد.",
                result: "برائت موکل",
                year: 2023,
                isVerified: true
            },
            {
                id: "cr7",
                category: "کیفری",
                title: "پرونده جعل",
                summary: "دفاع در پرونده جعل اسناد بانکی. موکل با ارائه مستندات معتبر، تبرئه حاصل شد.",
                result: "برائت موکل",
                year: 2022,
                isVerified: true
            },
            {
                id: "cr8",
                category: "اقتصادی",
                title: "پرونده اختلاف شرکتی",
                summary: "رسیدگی به پرونده اختلاف بین شرکا. موکل توانست حقوق خود را با توافق طرفین دریافت کند.",
                result: "توافق طرفین",
                year: 2023,
                isVerified: true
            }
        ],

        steps: 2,
        isVIP: false,

        rating: 4.7,
        reviewsCount: 42,
        views: 3120,
        questionPoints: 95,

        status: {
            isVerified: true,
            documentsCompleted: true
        }
    },
    {
        id: "4",
        username: "maryam",
        name: "مریم",
        lastName: "اکبری",
        mobile: "09186074033",
        phone: "026-12345678",
        email: "maryam@example.com",
        role: UserRole.LAWYER,
        profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
        commentsCount: 3,
        isActive: true,
        isVerified: true,
        createdAt: "2020-08-10T00:00:00Z",
        updatedAt: "2024-01-05T00:00:00Z",

        license: {
            type: LicenseType.BASE1,
            barAssociation: "کانون وکلای دادگستری البرز",
            licenseNumber: "98765"
        },

        specialties: [Specialty.TAX],

        skills: [Skill.TAX_LAW],

        education: {
            degree: "کارشناسی ارشد مالیاتی",
            university: "دانشگاه علامه طباطبایی",
            graduationYear: 2014
        },

        experienceYears: 10,
        about: "کارشناس ارشد مالیاتی و وکیل متخصص در امور مالیاتی، حل اختلافات مالیاتی و ارائه مشاوره به شرکت‌ها و اشخاص. دارای سابقه درخشان در پرونده‌های مالیاتی.",
        successfulCases: 28,

        location: {
            province: Province.ALBORZ,
            city: "کرج",
            address: "کرج، میدان آزادگان، خیابان بهار"
        },

        contact: {
            phone: "026-12345678",
            mobile: "09186074033",
            email: "maryam@example.com"
        },

        socials: [
            { id: "sc7", platform: SocialPlatform.INSTAGRAM, url: "https://instagram.com/maryam_tax", username: "maryam_tax" },
            { id: "sc8", platform: SocialPlatform.LINKEDIN, url: "https://linkedin.com/in/maryam-akbari", username: "maryam-akbari" }
        ],

        services: [
            { id: "ls9", serviceId: "svc_11", title: "مشاوره مالیاتی", price: 550000, isActive: true },
            { id: "ls10", serviceId: "svc_12", title: "حل اختلاف مالیاتی", price: 1200000, isActive: true }
        ],

        consultationPricing: [
            {
                id: "cp10",
                duration: ConsultationDuration.MIN_30,
                inPersonPrice: 350000,
                phonePrice: 280000,
                videoPrice: 315000,
                textChatPrice: 250000,
                isActive: true
            },
            {
                id: "cp11",
                duration: ConsultationDuration.MIN_45,
                inPersonPrice: 450000,
                phonePrice: 360000,
                videoPrice: 405000,
                textChatPrice: 320000,
                isActive: true
            }
        ],

        caseRecords: [
            {
                id: "cr9",
                category: "مالیاتی",
                title: "پرونده مالیات بر ارزش افزوده",
                summary: "دفاع از شرکت در پرونده مالیات بر ارزش افزوده. موکل توانست تخفیف قابل توجهی در مالیات خود کسب کند.",
                result: "کسب تخفیف مالیاتی",
                year: 2023,
                isVerified: true
            },
            {
                id: "cr10",
                category: "مالیاتی",
                title: "پرونده مالیات عملکرد",
                summary: "رسیدگی به پرونده مالیات عملکرد شرکت. با ارائه مستندات، پرونده به نفع شرکت حل شد.",
                result: "حل به نفع شرکت",
                year: 2022,
                isVerified: true
            }
        ],

        steps: 0,
        isVIP: false,

        rating: 4.6,
        reviewsCount: 31,
        views: 1560,
        questionPoints: 65,

        status: {
            isVerified: true,
            documentsCompleted: true
        }
    },
    {
        id: "5",
        username: "ali",
        name: "علی",
        lastName: "صالحی",
        mobile: "09188111609",
        phone: "021-87654321",
        email: "ali@example.com",
        role: UserRole.LAWYER,
        profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
        commentsCount: 4,
        isActive: true,
        isVerified: true,
        createdAt: "2019-05-20T00:00:00Z",
        updatedAt: "2024-01-25T00:00:00Z",

        license: {
            type: LicenseType.BASE1,
            barAssociation: "کانون وکلای دادگستری مرکز",
            licenseNumber: "11223"
        },

        specialties: [Specialty.LEGAL, Specialty.COMMERCIAL],

        skills: [Skill.CONTRACT_DRAFTING, Skill.MEDIATION],

        education: {
            degree: "دکتری حقوق تجارت",
            university: "دانشگاه تهران",
            graduationYear: 2013
        },

        experienceYears: 18,
        about: "وکیل پایه یک دادگستری با تخصص در قراردادها، امور شرکت‌ها و حقوق تجارت. با سابقه وکالت در پرونده‌های بزرگ اقتصادی. دارای تجربه در پرونده‌های بین‌المللی.",
        successfulCases: 89,

        location: {
            province: Province.TEHRAN,
            city: "تهران",
            address: "تهران، خیابان آزادی، پلاک 789"
        },

        contact: {
            phone: "021-87654321",
            mobile: "09188111609",
            email: "ali@example.com",
            website: "https://alisalehi-law.ir"
        },

        socials: [
            { id: "sc9", platform: SocialPlatform.LINKEDIN, url: "https://linkedin.com/in/ali-salehi", username: "ali-salehi" },
            { id: "sc10", platform: SocialPlatform.TELEGRAM, url: "https://t.me/alisalehi", username: "alisalehi" }
        ],

        services: [
            { id: "ls11", serviceId: "svc_4", title: "تنظیم قرارداد", price: 2449000, isActive: true },
            { id: "ls12", serviceId: "svc_9", title: "تأسیس شرکت", price: 3500000, isActive: true },
            { id: "ls13", serviceId: "svc_10", title: "مشاوره تجاری", price: 850000, isActive: true }
        ],

        consultationPricing: [
            {
                id: "cp12",
                duration: ConsultationDuration.MIN_30,
                inPersonPrice: 400000,
                phonePrice: 320000,
                videoPrice: 360000,
                textChatPrice: 280000,
                isActive: true
            },
            {
                id: "cp13",
                duration: ConsultationDuration.MIN_60,
                inPersonPrice: 700000,
                phonePrice: 560000,
                videoPrice: 630000,
                textChatPrice: 490000,
                isActive: true
            }
        ],

        caseRecords: [
            {
                id: "cr11",
                category: "تجاری",
                title: "پرونده قرارداد بین‌المللی",
                summary: "تنظیم و بررسی قرارداد بین‌المللی بین شرکت ایرانی و شرکت خارجی. پرونده با موفقیت به پایان رسید.",
                result: "انعقاد قرارداد",
                year: 2023,
                isVerified: true
            },
            {
                id: "cr12",
                category: "شرکتی",
                title: "پرونده تأسیس شرکت",
                summary: "مشاوره و راهنمایی در خصوص تأسیس شرکت سهامی خاص. پرونده با موفقیت به پایان رسید.",
                result: "تأسیس موفق شرکت",
                year: 2022,
                isVerified: true
            }
        ],

        steps: 3,
        isVIP: false,

        rating: 4.9,
        reviewsCount: 67,
        views: 4210,
        questionPoints: 110,

        status: {
            isVerified: true,
            documentsCompleted: true
        }
    },
    {
        id: "6",
        username: "zahra",
        name: "زهرا",
        lastName: "موسوی",
        mobile: "09146421264",
        phone: "051-12345678",
        email: "zahra@example.com",
        role: UserRole.LAWYER,
        profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
        commentsCount: 5,
        isActive: true,
        isVerified: true,
        createdAt: "2022-02-15T00:00:00Z",
        updatedAt: "2024-01-30T00:00:00Z",

        license: {
            type: LicenseType.BASE1,
            barAssociation: "کانون وکلای دادگستری خراسان رضوی",
            licenseNumber: "33445"
        },

        specialties: [Specialty.LABOR],

        skills: [Skill.LABOR_LAW],

        education: {
            degree: "کارشناسی ارشد حقوق کار",
            university: "دانشگاه فردوسی مشهد",
            graduationYear: 2017
        },

        experienceYears: 7,
        about: "متخصص در امور کار و تأمین اجتماعی، حل اختلافات کارگر و کارفرما و دعاوی مربوط به قراردادهای کار. دارای سابقه درخشان در دفاع از حقوق کارگران.",
        successfulCases: 23,

        location: {
            province: Province.KHORASAN_RAZAVI,
            city: "مشهد",
            address: "مشهد، بلوار سجاد، پلاک 12"
        },

        contact: {
            phone: "051-12345678",
            mobile: "09146421264",
            email: "zahra@example.com"
        },

        socials: [
            { id: "sc11", platform: SocialPlatform.INSTAGRAM, url: "https://instagram.com/zahra_labor", username: "zahra_labor" }
        ],

        services: [
            { id: "ls14", serviceId: "svc_13", title: "مشاوره کار", price: 400000, isActive: true },
            { id: "ls15", serviceId: "svc_14", title: "تنظیم قرارداد کار", price: 800000, isActive: true }
        ],

        consultationPricing: [
            {
                id: "cp14",
                duration: ConsultationDuration.MIN_30,
                inPersonPrice: 250000,
                phonePrice: 200000,
                videoPrice: 225000,
                textChatPrice: 180000,
                isActive: true
            },
            {
                id: "cp15",
                duration: ConsultationDuration.MIN_45,
                inPersonPrice: 350000,
                phonePrice: 280000,
                videoPrice: 315000,
                textChatPrice: 250000,
                isActive: true
            }
        ],

        caseRecords: [
            {
                id: "cr13",
                category: "کار",
                title: "پرونده اخراج غیرقانونی",
                summary: "دفاع از کارگر در پرونده اخراج غیرقانونی. با ارائه مستندات، حکم به نفع کارگر صادر شد.",
                result: "حکم به نفع کارگر",
                year: 2023,
                isVerified: true
            },
            {
                id: "cr14",
                category: "کار",
                title: "پرونده مطالبات معوقه",
                summary: "پیگیری مطالبات معوقه کارگر. موکل توانست حقوق معوقه خود را دریافت کند.",
                result: "دریافت حقوق معوقه",
                year: 2022,
                isVerified: true
            }
        ],

        steps: 2,
        isVIP: false,

        rating: 4.5,
        reviewsCount: 28,
        views: 1320,
        questionPoints: 45,

        status: {
            isVerified: true,
            documentsCompleted: true
        }
    }
];

// ==================== Users Data ====================
/**
 * داده‌های کاربران
 */
export const usersData: User[] = [
    {
        id: "user1",
        username: "ali",
        name: "علی",
        lastName: "احمدی",
        mobile: "09116421264",
        role: UserRole.USER,
        isActive: true,
        isVerified: true,
        createdAt: "2023-01-15T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z"
    },
    {
        id: "user2",
        username: "reza",
        name: "رضا",
        lastName: "حسینی",
        mobile: "09123456789",
        role: UserRole.USER,
        isActive: true,
        isVerified: true,
        createdAt: "2023-03-20T00:00:00Z",
        updatedAt: "2024-01-20T00:00:00Z"
    },
    // اضافه کردن کاربران وکیل
    {
        id: "1", // همان آیدی وکیل در lawyersData
        username: "ahmad",
        name: "احمد",
        lastName: "محمدی",
        mobile: "09146421264",
        role: UserRole.LAWYER,
        isActive: true,
        isVerified: true,
        createdAt: "2022-05-10T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z"
    },
    {
        id: "2", // همان آیدی وکیل در lawyersData
        username: "sara",
        name: "سارا",
        lastName: "رضایی",
        mobile: "09189001937",
        role: UserRole.LAWYER,
        isActive: true,
        isVerified: true,
        createdAt: "2023-06-20T00:00:00Z",
        updatedAt: "2024-01-20T00:00:00Z"
    },
    {
        id: "3", // همان آیدی وکیل در lawyersData
        username: "reza",
        name: "رضا",
        lastName: "حسینی",
        mobile: "09144133782",
        role: UserRole.LAWYER,
        isActive: true,
        isVerified: true,
        createdAt: "2021-03-15T00:00:00Z",
        updatedAt: "2024-01-10T00:00:00Z"
    }
];

// ==================== Lawyer Details Data ====================
/**
 * داده‌های جزئیات وکلا (برای صفحه جزئیات)
 */
export const lawyerDetailsData: LawyerDetail[] = lawyersData.map(lawyer => ({
    ...lawyer,
    reviews: [
        {
            id: `r_${lawyer.id}_1`,
            userId: "user1",
            userName: "علی احمدی",
            rating: 5,
            comment: "وکیل بسیار خوب و متخصص. مشاوره ایشون خیلی بهم کمک کرد.",
            createdAt: "2023-05-15T00:00:00Z"
        },
        {
            id: `r_${lawyer.id}_2`,
            userId: "user2",
            userName: "مریم رضایی",
            rating: 4,
            comment: "تجربه خوبی بود، اما کمی تاخیر در جلسه داشتند.",
            createdAt: "2023-06-20T00:00:00Z"
        }
    ],
    qaPairs: [
        {
            id: `qa_${lawyer.id}_1`,
            question: "برای طلاق توافقی چه مدارکی لازمه؟",
            answer: "برای طلاق توافقی نیاز به شناسنامه، کارت ملی، سند ازدواج و 6 عکس پرسنلی دارید.",
            askedBy: "سارا محمدی",
            askedAt: "2023-04-10T00:00:00Z",
            answeredAt: "2023-04-12T00:00:00Z"
        },
        {
            id: `qa_${lawyer.id}_2`,
            question: "آیا می‌توانم بدون وکیل در دادگاه حاضر شوم؟",
            answer: "بله، اما توصیه می‌شود برای پیچیدگی‌های حقوقی حتماً از وکیل استفاده کنید.",
            askedBy: "رضا کریمی",
            askedAt: "2023-05-05T00:00:00Z",
            answeredAt: "2023-05-07T00:00:00Z"
        }
    ],
    timeSlots: [
        {
            id: "ts1",
            date: "2024-01-21",
            startTime: "09:00",
            endTime: "10:00",
            isBooked: false
        },
        {
            id: "ts2",
            date: "2024-01-21",
            startTime: "10:00",
            endTime: "11:00",
            isBooked: true
        },
        {
            id: "ts3",
            date: "2024-01-21",
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
    }
}));

// ==================== Lawyer List Items ====================
/**
 * داده‌های لیست وکلا (برای نمایش در لیست‌ها)
 */
// lib/data-service/mockData.ts

// در تابع lawyerListItemsData

export const lawyerListItemsData: LawyerListItem[] = lawyersData.map(lawyer => {
    const prices = lawyer.consultationPricing.filter(cp => cp.isActive);
    const allPrices = prices.flatMap(cp => [
        cp.inPersonPrice,
        cp.phonePrice,
        cp.videoPrice,
        cp.textChatPrice
    ]);

    return {
        id: lawyer.id,
        username: lawyer.username,
        name: lawyer.name,
        lastName: lawyer.lastName,
        fullName: `${lawyer.name} ${lawyer.lastName}`,
        profileImage: lawyer.profileImage || "",
        commentsCount: lawyer.commentsCount || 0,
        specialty: lawyer.specialties[0] || lawyer.specialty || Specialty.LEGAL, // اصلاح شده
        specialties: lawyer.specialties, // اضافه شده
        skills: lawyer.skills || [],
        province: lawyer.location.province,
        city: lawyer.location.city,
        experienceYears: lawyer.experienceYears,
        rating: lawyer.rating,
        reviewsCount: lawyer.reviewsCount,
        successfulCases: lawyer.successfulCases,
        isOnline: Math.random() > 0.5,
        isVIP: lawyer.isVIP || false,
        steps: lawyer.steps || 0,
        views: lawyer.views,
        questionPoints: lawyer.questionPoints,
        minConsultationPrice: Math.min(...allPrices),
        maxConsultationPrice: Math.max(...allPrices)
    };
});

// ==================== Registration Data ====================
/**
 * نمونه داده‌های ثبت نام
 */
export const sampleRegistrationData: RegistrationData = {
    step1: {
        mobile: "09123456789"
    },
    step2: {
        verificationCode: "12345"
    },
    step3: {
        name: "محمد",
        lastName: "رضایی",
        password: "password123",
        confirmPassword: "password123",
        role: UserRole.LAWYER,
        email: "mohammad@example.com",
        specialty: Specialty.LEGAL,
        experience: "5",
        licenseNumber: "54321",
        skills:[Skill.CONFLICT_RESOLUTION,Skill.DISPUTE_RESOLUTION],
        about: "وکیل پایه یک دادگستری",
        province: Province.TEHRAN,
        city: "تهران",
        address: "تهران، خیابان آزادی"
    }
};

// ==================== Utility Functions ====================
/**
 * تابع مقداردهی اولیه localStorage
 */
export const initializeLocalStorage = () => {
    if (typeof window === 'undefined') return;

    // پاک کردن کامل localStorage
    localStorage.clear();

    const dataToStore = {
        lawyers: lawyersData,
        users: usersData,
        provinces: provincesData,
        baseServices,
        lawyerDetails: lawyerDetailsData,
        lawyerListItems: lawyerListItemsData
    };

    // ذخیره داده‌های اولیه
    Object.entries(dataToStore).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
    });
};

/**
 * تابع پاک کردن و مقداردهی مجدد localStorage
 */
export const clearAndInitializeLocalStorage = () => {
    if (typeof window === 'undefined') return;

    localStorage.clear();
    initializeLocalStorage();
    window.location.reload();
};