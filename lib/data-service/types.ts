// lib/data-service/types.ts

// ==================== Base Types ====================

export interface ApiError {
    code: number;
    key: string;
    message: string;
    data?: any;
}

/**
 * تایپ پایه برای تمام موجودیت‌ها
 */
export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

// ==================== User Types ====================
/**
 * اطلاعات پایه کاربران سیستم
 */
export interface User extends BaseEntity {
    username: string;
    name: string;
    lastName: string;
    mobile: string;
    phone?: string;
    email?: string;
    role: UserRole;
    profileImage?: string;
    isActive: boolean;
    isVerified: boolean;
}

/**
 * نقش‌های کاربری در سیستم
 */
export enum UserRole {
    USER = 'USER',
    LAWYER = 'LAWYER',
    ADMIN = 'ADMIN'
}

// ==================== Lawyer Types ====================
/**
 * اطلاعات کامل وکیل
 */
export interface Lawyer extends User {
    role: UserRole.LAWYER;

    // License Information
    license: {
        type: LicenseType;
        barAssociation: string;
        licenseNumber: string;
    };

    // Professional Information
    specialties: Specialty[];
    skills: Skill[];
    education: Education;
    experienceYears: number;
    about: string;
    successfulCases: number;
    commentsCount: number;

    // Location
    location: {
        province: Province;
        city: string;
        address: string;
    };

    // Contact Information
    contact: Contact;

    // Social Media
    socials: SocialMedia[];

    // Services and Pricing
    services: LawyerService[];
    consultationPricing: ConsultationPricing[];

    // Case Records
    caseRecords: CaseRecord[];

    // Subscription
    subscription?: Subscription;

    // Stats
    rating: number;
    reviewsCount: number;
    views: number;
    questionPoints?: number;
    steps: number;
    isVIP: boolean;

    // Status
    status: {
        isVerified: boolean;
        documentsCompleted: boolean;
    };
}

/**
 * نوع پروانه وکالت
 */
export enum LicenseType {
    BASE1 = 'BASE1',
    BASE2 = 'BASE2',
    APPRENTICE = 'APPRENTICE',
    INTERN = 'INTERN',
    JUDICIARY = 'JUDICIARY',
    LEGAL_CONSULTANT = 'LEGAL_CONSULTANT'
}

/**
 * تخصص‌های وکیل
 */
export enum Specialty {
    FAMILY = 'FAMILY',
    REAL_ESTATE = 'REAL_ESTATE',
    LEGAL = 'LEGAL',
    CRIMINAL = 'CRIMINAL',
    COMMERCIAL = 'COMMERCIAL',
    ADMINISTRATIVE = 'ADMINISTRATIVE',
    REGISTRATION = 'REGISTRATION',
    CUSTOMS = 'CUSTOMS',
    TAX = 'TAX',
    CYBER_CRIME = 'CYBER_CRIME',
    IMMIGRATION = 'IMMIGRATION',
    INTERNATIONAL = 'INTERNATIONAL',
    TRAFFIC_ACCIDENT = 'TRAFFIC_ACCIDENT',
    DRUG = 'DRUG',
    MEDICAL_MALPRACTICE = 'MEDICAL_MALPRACTICE',
    LABOR = 'LABOR'
}

/**
 * مهارت‌های وکیل
 */
export enum Skill {
    // مهارت‌های ارتباطی و مشاوره‌ای
    CLIENT_COUNSELING = 'CLIENT_COUNSELING',
    NEGOTIATION = 'NEGOTIATION',
    MEDIATION = 'MEDIATION',
    PERSUASION = 'PERSUASION',
    INTERVIEWING = 'INTERVIEWING',

    // مهارت‌های تحقیقی و تحلیلی
    LEGAL_RESEARCH = 'LEGAL_RESEARCH',
    CASE_ANALYSIS = 'CASE_ANALYSIS',
    EVIDENCE_EVALUATION = 'EVIDENCE_EVALUATION',
    STATUTE_INTERPRETATION = 'STATUTE_INTERPRETATION',
    PRECEDENT_ANALYSIS = 'PRECEDENT_ANALYSIS',

    // مهارت‌های نگارشی
    PLEADING_DRAFTING = 'PLEADING_DRAFTING',
    CONTRACT_DRAFTING = 'CONTRACT_DRAFTING',
    LEGAL_OPINION_WRITING = 'LEGAL_OPINION_WRITING',
    MOTION_WRITING = 'MOTION_WRITING',
    REPORT_WRITING = 'REPORT_WRITING',

    // مهارت‌های دادگاهی
    ORAL_ADVOCACY = 'ORAL_ADVOCACY',
    CROSS_EXAMINATION = 'CROSS_EXAMINATION',
    DIRECT_EXAMINATION = 'DIRECT_EXAMINATION',
    OPENING_STATEMENT = 'OPENING_STATEMENT',
    CLOSING_ARGUMENT = 'CLOSING_ARGUMENT',

    // مهارت‌های مدیریتی
    CASE_MANAGEMENT = 'CASE_MANAGEMENT',
    TIME_MANAGEMENT = 'TIME_MANAGEMENT',
    CLIENT_MANAGEMENT = 'CLIENT_MANAGEMENT',
    DEADLINE_MANAGEMENT = 'DEADLINE_MANAGEMENT',
    COST_MANAGEMENT = 'COST_MANAGEMENT',

    // مهارت‌های تخصصی حقوقی
    DUE_DILIGENCE = 'DUE_DILIGENCE',
    RISK_ASSESSMENT = 'RISK_ASSESSMENT',
    COMPLIANCE_REVIEW = 'COMPLIANCE_REVIEW',
    DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
    SETTLEMENT_NEGOTIATION = 'SETTLEMENT_NEGOTIATION',

    // مهارت‌های فنی و دیجیتال
    E_FILING = 'E_FILING',
    LEGAL_TECH = 'LEGAL_TECH',
    DOCUMENT_MANAGEMENT = 'DOCUMENT_MANAGEMENT',
    EVIDENCE_DIGITIZATION = 'EVIDENCE_DIGITIZATION',
    ONLINE_RESEARCH = 'ONLINE_RESEARCH',

    // مهارت‌های مالی و حسابداری
    LEGAL_ACCOUNTING = 'LEGAL_ACCOUNTING',
    DAMAGES_CALCULATION = 'DAMAGES_CALCULATION',
    COST_BENEFIT_ANALYSIS = 'COST_BENEFIT_ANALYSIS',
    FINANCIAL_ASSESSMENT = 'FINANCIAL_ASSESSMENT',

    // مهارت‌های اخلاق حرفه‌ای
    PROFESSIONAL_ETHICS = 'PROFESSIONAL_ETHICS',
    CONFIDENTIALITY = 'CONFIDENTIALITY',
    CONFLICT_RESOLUTION = 'CONFLICT_RESOLUTION',
    PROFESSIONAL_CONDUCT = 'PROFESSIONAL_CONDUCT'
}

/**
 * استان‌ها
 */
export enum Province {
    TEHRAN = 'TEHRAN',
    ISFAHAN = 'ISFAHAN',
    FARS = 'FARS',
    ALBORZ = 'ALBORZ',
    KHORASAN_RAZAVI = 'KHORASAN_RAZAVI'
}

/**
 * اطلاعات تحصیلی وکیل
 */
export interface Education {
    degree: string;
    university: string;
    graduationYear: number;
}

/**
 * اطلاعات تماس وکیل
 */
export interface Contact {
    phone: string;
    mobile: string;
    email?: string;
    website?: string;
}

/**
 * شبکه‌های اجتماعی وکیل
 */
export interface SocialMedia {
    id: string;
    platform: SocialPlatform;
    url: string;
    username?: string | null | undefined;
}

/**
 * پلتفرم‌های اجتماعی
 */
export enum SocialPlatform {
    INSTAGRAM = 'INSTAGRAM',
    WHATSAPP = 'WHATSAPP',
    TELEGRAM = 'TELEGRAM',
    YOUTUBE = 'YOUTUBE',
    APARAT = 'APARAT',
    LINKEDIN = 'LINKEDIN'
}

/**
 * خدمات ارائه شده توسط وکیل
 */
export interface LawyerService {
    id: string;
    serviceId: string;
    title: string;
    price: number;
    isActive: boolean;
}

/**
 * قیمت‌های مشاوره برای انواع و بازه‌های زمانی
 */
export interface ConsultationPricing {
    id: string;
    duration: ConsultationDuration;
    inPersonPrice: number;
    phonePrice: number;
    videoPrice: number;
    textChatPrice: number;
    isActive: boolean;
}

/**
 * مدت‌های زمانی مشاوره
 */
export enum ConsultationDuration {
    MIN_15 = 'MIN_15',
    MIN_30 = 'MIN_30',
    MIN_45 = 'MIN_45',
    MIN_60 = 'MIN_60',
    MIN_90 = 'MIN_90',
    MIN_120 = 'MIN_120'
}

/**
 * سوابق پرونده‌های وکیل
 */
export interface CaseRecord {
    id: string;
    category: string;
    title: string;
    summary: string;
    result: string;
    year: number;
    isVerified: boolean;
}

/**
 * اطلاعات اشتراک وکیل
 */
export interface Subscription {
    planId: string;
    planName: string;
    duration: number;
    durationUnit: string;
    steps: number;
    expiryDate: string;
    isVIP: boolean;
    purchasedAt: string;
}

// ==================== Lawyer List Types ====================
/**
 * اطلاعات خلاصه شده وکیل برای نمایش در لیست‌ها
 */
export interface LawyerListItem {
    id: string;
    username: string;
    name: string;
    lastName: string;
    fullName: string;
    profileImage: string;
    specialty: Specialty;
    skills: Skill[];
    specialties: Specialty[];
    province: Province;
    city: string;
    experienceYears: number;
    rating: number;
    reviewsCount: number;
    successfulCases: number;
    isOnline: boolean;
    steps: number;
    isVIP: boolean;
    views: number;
    commentsCount: number;
    questionPoints?: number;
    minConsultationPrice: number;
    maxConsultationPrice: number;
}

// ==================== Lawyer Detail Types ====================
/**
 * اطلاعات کامل وکیل برای صفحه جزئیات
 */
export interface LawyerDetail extends Lawyer {
    reviews: Review[];
    qaPairs: QAPair[];
    timeSlots: TimeSlot[];
    weeklyTemplate: WeeklyTemplate;
}

/**
 * نظر کاربران درباره وکیل
 */
export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

/**
 * سوالات و پاسخ‌های متداول
 */
export interface QAPair {
    id: string;
    question: string;
    answer: string;
    askedBy: string;
    askedAt: string;
    answeredAt: string;
}

/**
 * زمان‌های مشاوره رزرو شده
 */
export interface TimeSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

/**
 * قالب هفتگی زمان‌بندی مشاوره‌ها
 */
export interface WeeklyTemplate {
    [key: string]: {
        hours: number[];
        isHoliday: boolean;
    };
}

// ==================== Service Types ====================
/**
 * سرویس‌های پایه (لیست کامل خدمات قابل انتخاب توسط وکلا)
 */
export interface BaseService {
    id: string;
    title: string;
    description: string;
    category: ServiceCategory;
}

/**
 * دسته‌بندی خدمات
 */
export enum ServiceCategory {
    CONSULTATION = 'CONSULTATION',
    DOCUMENT = 'DOCUMENT',
    CONTRACT = 'CONTRACT',
    REPRESENTATION = 'REPRESENTATION',
    OTHER = 'OTHER'
}

// ==================== Filter Types ====================
/**
 * فیلترهای جستجوی وکلا
 */
export interface LawyersFilter {
    // Location Filters
    province?: Province;
    city?: string;

    // Professional Filters
    specialty?: Specialty;
    skill?: Skill;
    serviceIds?: string[];

    // Consultation Filters
    consultationType?: ConsultationType;
    duration?: ConsultationDuration;

    // Status Filters
    includeVIP?: boolean;
    onlineOnly?: boolean;
    hasSuccessfulCases?: boolean;

    // Search
    searchQuery?: string;

    // Price Range
    minPrice?: number;
    maxPrice?: number;

    // Experience Range
    minExperience?: number;
    maxExperience?: number;
}

/**
 * انواع مشاوره برای فیلتر
 */
export enum ConsultationType {
    IN_PERSON = 'IN_PERSON',
    PHONE = 'PHONE',
    VIDEO = 'VIDEO',
    TEXT_CHAT = 'TEXT_CHAT'
}

// ==================== Sort Types ====================
/**
 * معیارهای سورت کردن وکلا
 */
export enum LawyerSortBy {
    STEPS = 'STEPS',
    RATING = 'RATING',
    REVIEWS_COUNT = 'REVIEWS_COUNT',
    EXPERIENCE = 'EXPERIENCE',
    SUCCESSFUL_CASES = 'SUCCESSFUL_CASES',
    PRICE_LOW = 'PRICE_LOW',
    PRICE_HIGH = 'PRICE_HIGH',
    VIEWS = 'VIEWS',
    NEWEST = 'NEWEST',
    ONLINE = 'ONLINE',
    COMMENTS_COUNT = 'COMMENTS_COUNT'
}

/**
 * پارامترهای سورت
 */
export interface SortParams {
    sortBy: LawyerSortBy;
    sortOrder: SortOrder;
}

/**
 * ترتیب سورت
 */
export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}

// ==================== Province/City Types ====================
/**
 * اطلاعات استان‌ها و شهرها
 */
export interface ProvinceData {
    id: string;
    code: string;
    name: string;
    cities: City[];
}

export interface City {
    id: string;
    code: string;
    name: string;
    provinceCode: string;
}

// ==================== Registration Types ====================
/**
 * داده‌های مرحله اول ثبت نام
 */
export interface RegistrationStep1Data {
    mobile: string;
}

/**
 * داده‌های مرحله دوم ثبت نام
 */
export interface RegistrationStep2Data {
    verificationCode: string;
}

/**
 * داده‌های مرحله سوم ثبت نام
 */
export interface RegistrationStep3Data {
    name: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    skills: Skill[];

    // Lawyer specific fields
    email?: string;
    specialty?: Specialty;
    experience?: string;
    licenseNumber?: string;
    licenseType?: LicenseType;
    about?: string;
    province?: Province;
    city?: string;
    address?: string;
    consultationFee?: string;

    // VIP fields
    isVIP?: boolean;
    vipPlan?: string;
}

/**
 * تمام داده‌های ثبت نام
 */
export interface RegistrationData {
    step1: RegistrationStep1Data;
    step2: RegistrationStep2Data;
    step3: RegistrationStep3Data;
}

// ==================== Login Types ====================
/**
 * اطلاعات ورود به سیستم
 */
export interface LoginCredentials {
    mobile: string;
    password: string;
}

/**
 * پاسخ موفق ورود به سیستم
 */
export interface LoginResponse {
    user: User;
    token: string;
}

// ==================== API Response Types ====================
/**
 * پاسخ استاندارد API
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string>;
}

/**
 * پاسخ صفحه‌بندی شده
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

// ==================== API Request Types ====================
/**
 * پارامترهای درخواست لیست وکلا
 */
export interface GetLawyersParams {
    filters?: LawyersFilter;
    sort?: SortParams;
    pagination?: {
        page: number;
        pageSize: number;
    };
}