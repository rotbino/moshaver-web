// src/lib/data-transfer/data-types.ts

// نقش‌های کاربری
import {Consultation, ServiceRequest, User} from "@/lib/data-transfer/types";

export enum UserRole {
    USER = 'USER',
    LAWYER = 'LAWYER',
    ADMIN = 'ADMIN'
}

// انواع پروانه وکالت
export enum LicenseType {
    BASE1 = 'BASE1',
    BASE2 = 'BASE2',
    APPRENTICE = 'APPRENTICE',
    INTERN = 'INTERN',
    JUDICIARY = 'JUDICIARY',
    LEGAL_CONSULTANT = 'LEGAL_CONSULTANT'
}

// تخصص‌های حقوقی
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

// مهارت‌های وکلا
export enum Skill {
    CLIENT_COUNSELING = 'CLIENT_COUNSELING',
    NEGOTIATION = 'NEGOTIATION',
    MEDIATION = 'MEDIATION',
    PERSUASION = 'PERSUASION',
    INTERVIEWING = 'INTERVIEWING',
    LEGAL_RESEARCH = 'LEGAL_RESEARCH',
    CASE_ANALYSIS = 'CASE_ANALYSIS',
    EVIDENCE_EVALUATION = 'EVIDENCE_EVALUATION',
    STATUTE_INTERPRETATION = 'STATUTE_INTERPRETATION',
    PRECEDENT_ANALYSIS = 'PRECEDENT_ANALYSIS',
    PLEADING_DRAFTING = 'PLEADING_DRAFTING',
    CONTRACT_DRAFTING = 'CONTRACT_DRAFTING',
    LEGAL_OPINION_WRITING = 'LEGAL_OPINION_WRITING',
    MOTION_WRITING = 'MOTION_WRITING',
    REPORT_WRITING = 'REPORT_WRITING',
    ORAL_ADVOCACY = 'ORAL_ADVOCACY',
    CROSS_EXAMINATION = 'CROSS_EXAMINATION',
    DIRECT_EXAMINATION = 'DIRECT_EXAMINATION',
    OPENING_STATEMENT = 'OPENING_STATEMENT',
    CLOSING_ARGUMENT = 'CLOSING_ARGUMENT',
    CASE_MANAGEMENT = 'CASE_MANAGEMENT',
    TIME_MANAGEMENT = 'TIME_MANAGEMENT',
    CLIENT_MANAGEMENT = 'CLIENT_MANAGEMENT',
    DEADLINE_MANAGEMENT = 'DEADLINE_MANAGEMENT',
    COST_MANAGEMENT = 'COST_MANAGEMENT',
    DUE_DILIGENCE = 'DUE_DILIGENCE',
    RISK_ASSESSMENT = 'RISK_ASSESSMENT',
    COMPLIANCE_REVIEW = 'COMPLIANCE_REVIEW',
    DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
    SETTLEMENT_NEGOTIATION = 'SETTLEMENT_NEGOTIATION',
    E_FILING = 'E_FILING',
    LEGAL_TECH = 'LEGAL_TECH',
    DOCUMENT_MANAGEMENT = 'DOCUMENT_MANAGEMENT',
    EVIDENCE_DIGITIZATION = 'EVIDENCE_DIGITIZATION',
    ONLINE_RESEARCH = 'ONLINE_RESEARCH',
    LEGAL_ACCOUNTING = 'LEGAL_ACCOUNTING',
    DAMAGES_CALCULATION = 'DAMAGES_CALCULATION',
    COST_BENEFIT_ANALYSIS = 'COST_BENEFIT_ANALYSIS',
    FINANCIAL_ASSESSMENT = 'FINANCIAL_ASSESSMENT',
    PROFESSIONAL_ETHICS = 'PROFESSIONAL_ETHICS',
    CONFIDENTIALITY = 'CONFIDENTIALITY',
    CONFLICT_RESOLUTION = 'CONFLICT_RESOLUTION',
    PROFESSIONAL_CONDUCT = 'PROFESSIONAL_CONDUCT'
}
//خدمات
export enum ServiceCategory {
    DOCUMENT = 'DOCUMENT',              // تنظیم اسناد حقوقی
    CONTRACT = 'CONTRACT',              // قراردادها
    REPRESENTATION = 'REPRESENTATION',  // وکالت و پیگیری پرونده
    FAMILY = 'FAMILY',                  // دعاوی خانواده
    CRIMINAL = 'CRIMINAL',              // دعاوی کیفری
    CORPORATE = 'CORPORATE',            // شرکت‌ها و کسب‌وکار
    APPEAL = 'APPEAL',                  // اعتراض و تجدیدنظر
    EXECUTION = 'EXECUTION',            // اجرای احکام و پیگیری
    OTHER = 'OTHER'                     // سایر خدمات
}


export const SERVICE_CATEGORY_NAMES: Record<ServiceCategory, string> = {
    [ServiceCategory.DOCUMENT]: 'تنظیم اسناد حقوقی',
    [ServiceCategory.CONTRACT]: 'قراردادها',
    [ServiceCategory.REPRESENTATION]: 'وکالت و پیگیری پرونده',
    [ServiceCategory.FAMILY]: 'دعاوی خانواده',
    [ServiceCategory.CRIMINAL]: 'دعاوی کیفری',
    [ServiceCategory.CORPORATE]: 'شرکت‌ها و کسب‌وکار',
    [ServiceCategory.APPEAL]: 'اعتراض و تجدیدنظر',
    [ServiceCategory.EXECUTION]: 'اجرای احکام و پیگیری',
    [ServiceCategory.OTHER]: 'سایر خدمات',
};
// انواع خدمات
export enum ServiceType {
    DRAFT_PETITION = 'DRAFT_PETITION',                 // تنظیم دادخواست
    DRAFT_COMPLAINT = 'DRAFT_COMPLAINT',               // تنظیم شکواییه
    DRAFT_DEFENSE = 'DRAFT_DEFENSE',                   // تنظیم لایحه دفاعیه
    DRAFT_NOTICE = 'DRAFT_NOTICE',                     // تنظیم اظهارنامه

    DRAFT_CONTRACT = 'DRAFT_CONTRACT',                 // تنظیم قرارداد
    REVIEW_CONTRACT = 'REVIEW_CONTRACT',               // بررسی و اصلاح قرارداد

    LEGAL_REPRESENTATION = 'LEGAL_REPRESENTATION',     // وکالت دعاوی حقوقی
    PROPERTY_REPRESENTATION = 'PROPERTY_REPRESENTATION', // وکالت دعاوی ملکی

    FAMILY_REPRESENTATION = 'FAMILY_REPRESENTATION',   // وکالت دعاوی خانواده
    DIVORCE_REPRESENTATION = 'DIVORCE_REPRESENTATION', // وکالت طلاق

    CRIMINAL_REPRESENTATION = 'CRIMINAL_REPRESENTATION', // وکالت کیفری

    COMPANY_REGISTRATION = 'COMPANY_REGISTRATION',     // ثبت و تغییرات شرکت
    BUSINESS_CONSULTING = 'BUSINESS_CONSULTING',       // خدمات حقوقی کسب‌وکار
    PARTNER_DISPUTE = 'PARTNER_DISPUTE',               // اختلافات شرکا

    APPEAL_REQUEST = 'APPEAL_REQUEST',                 // تجدیدنظرخواهی
    EXTRAORDINARY_OBJECTION = 'EXTRAORDINARY_OBJECTION', // فرجام / اعاده دادرسی

    JUDGMENT_EXECUTION = 'JUDGMENT_EXECUTION',          // اجرای احکام

    ADMINISTRATIVE_CLAIM = 'ADMINISTRATIVE_CLAIM',     // دیوان عدالت اداری
    ARBITRATION = 'ARBITRATION',                       // داوری و میانجی‌گری
}

export const SERVICES_LIST = [
    {
        id: ServiceType.DRAFT_PETITION,
        title: 'تنظیم دادخواست',
        description: 'تنظیم دادخواست حقوقی یا خانواده',
        category: ServiceCategory.DOCUMENT,
    },
    {
        id: ServiceType.DRAFT_COMPLAINT,
        title: 'تنظیم شکواییه',
        description: 'تنظیم شکواییه برای مراجع کیفری',
        category: ServiceCategory.DOCUMENT,
    },
    {
        id: ServiceType.DRAFT_DEFENSE,
        title: 'تنظیم لایحه دفاعیه',
        description: 'تنظیم لایحه دفاعیه یا تکمیلی',
        category: ServiceCategory.DOCUMENT,
    },
    {
        id: ServiceType.DRAFT_NOTICE,
        title: 'تنظیم اظهارنامه',
        description: 'تنظیم اظهارنامه رسمی',
        category: ServiceCategory.DOCUMENT,
    },

    {
        id: ServiceType.DRAFT_CONTRACT,
        title: 'تنظیم قرارداد',
        description: 'تنظیم انواع قراردادهای حقوقی و تجاری',
        category: ServiceCategory.CONTRACT,
    },
    {
        id: ServiceType.REVIEW_CONTRACT,
        title: 'بررسی و اصلاح قرارداد',
        description: 'بررسی و اصلاح مفاد قرارداد',
        category: ServiceCategory.CONTRACT,
    },

    {
        id: ServiceType.LEGAL_REPRESENTATION,
        title: 'وکالت دعاوی حقوقی',
        description: 'قبول وکالت در دعاوی حقوقی و مالی',
        category: ServiceCategory.REPRESENTATION,
    },
    {
        id: ServiceType.PROPERTY_REPRESENTATION,
        title: 'وکالت دعاوی ملکی',
        description: 'قبول وکالت در دعاوی مرتبط با املاک',
        category: ServiceCategory.REPRESENTATION,
    },

    {
        id: ServiceType.FAMILY_REPRESENTATION,
        title: 'وکالت دعاوی خانواده',
        description: 'قبول وکالت در پرونده‌های خانواده',
        category: ServiceCategory.FAMILY,
    },
    {
        id: ServiceType.DIVORCE_REPRESENTATION,
        title: 'وکالت طلاق',
        description: 'طلاق توافقی یا یک‌طرفه',
        category: ServiceCategory.FAMILY,
    },

    {
        id: ServiceType.CRIMINAL_REPRESENTATION,
        title: 'وکالت دعاوی کیفری',
        description: 'دفاع و پیگیری پرونده‌های کیفری',
        category: ServiceCategory.CRIMINAL,
    },

    {
        id: ServiceType.COMPANY_REGISTRATION,
        title: 'ثبت و تغییرات شرکت',
        description: 'ثبت شرکت و انجام تغییرات',
        category: ServiceCategory.CORPORATE,
    },
    {
        id: ServiceType.BUSINESS_CONSULTING,
        title: 'خدمات حقوقی کسب‌وکار',
        description: 'خدمات حقوقی مستمر برای شرکت‌ها',
        category: ServiceCategory.CORPORATE,
    },
    {
        id: ServiceType.PARTNER_DISPUTE,
        title: 'اختلافات بین شرکا',
        description: 'رسیدگی به دعاوی شرکای تجاری',
        category: ServiceCategory.CORPORATE,
    },

    {
        id: ServiceType.APPEAL_REQUEST,
        title: 'تجدیدنظرخواهی',
        description: 'اعتراض به رأی در مرحله تجدیدنظر',
        category: ServiceCategory.APPEAL,
    },
    {
        id: ServiceType.EXTRAORDINARY_OBJECTION,
        title: 'فرجام و اعاده دادرسی',
        description: 'اعتراضات فوق‌العاده به آراء',
        category: ServiceCategory.APPEAL,
    },

    {
        id: ServiceType.JUDGMENT_EXECUTION,
        title: 'اجرای احکام',
        description: 'پیگیری اجرای رأی و وصول مطالبات',
        category: ServiceCategory.EXECUTION,
    },

    {
        id: ServiceType.ADMINISTRATIVE_CLAIM,
        title: 'دیوان عدالت اداری',
        description: 'دعاوی علیه نهادهای دولتی',
        category: ServiceCategory.OTHER,
    },
    {
        id: ServiceType.ARBITRATION,
        title: 'داوری و میانجی‌گری',
        description: 'حل اختلاف خارج از دادگاه',
        category: ServiceCategory.OTHER,
    },
];

// استان‌ها



// مدت زمان مشاوره
export enum ConsultationDuration {
    MIN_30 = 'MIN_30',
    MIN_60 = 'MIN_60',
    MIN_90 = 'MIN_90',
    MIN_120 = 'MIN_120'
}

// نوع مشاوره
export enum ConsultationType {
    IN_PERSON = 'IN_PERSON',
    PHONE = 'PHONE',
    VIDEO = 'VIDEO',
    TEXT_CHAT = 'TEXT_CHAT'
}

// وضعیت مشاوره
export enum ConsultationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

// وضعیت درخواست خدمات
export enum ServiceRequestStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

// وضعیت سوال
export enum QuestionStatus {
    PENDING = 'PENDING',
    ANSWERED = 'ANSWERED',
    CLOSED = 'CLOSED'
}

// وضعیت پرداخت
export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

// نوع تراکنش
export enum TransactionType {
    CONSULTATION = 'CONSULTATION',
    SERVICE = 'SERVICE',
    SUBSCRIPTION = 'SUBSCRIPTION'
}

// پلتفرم‌های اجتماعی
export enum SocialPlatform {
    INSTAGRAM = 'INSTAGRAM',
    WHATSAPP = 'WHATSAPP',
    TELEGRAM = 'TELEGRAM',
    YOUTUBE = 'YOUTUBE',
    APARAT = 'APARAT',
    LINKEDIN = 'LINKEDIN',
    TWITTER = 'TWITTER',
    FACEBOOK = 'FACEBOOK'
}

// نوع اعلان
export enum NotificationType {
    CONSULTATION_BOOKED = 'CONSULTATION_BOOKED',
    CONSULTATION_CONFIRMED = 'CONSULTATION_CONFIRMED',
    CONSULTATION_CANCELLED = 'CONSULTATION_CANCELLED',
    NEW_MESSAGE = 'NEW_MESSAGE',
    NEW_REVIEW = 'NEW_REVIEW',
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    SYSTEM_UPDATE = 'SYSTEM_UPDATE',
    NEW_QUESTION = 'NEW_QUESTION',
    NEW_ANSWER = 'NEW_ANSWER'
}

// نوع تحصیلات
export interface Education {
    degree: string;
    university: string;
    graduationYear: number;
}

// منبع مشتری
export enum ClientSource {
    SELF_REGISTERED = 'SELF_REGISTERED',
    LAWYER_REGISTERED = 'LAWYER_REGISTERED',
    INVITATION_LINK = 'INVITATION_LINK',
    MANUAL_ADD = 'MANUAL_ADD'
}

// وضعیت زمان مشاوره
export enum TimeSlotStatus {
    AVAILABLE = 'AVAILABLE',
    RESERVED = 'RESERVED',
    BOOKED = 'BOOKED',
    BLOCKED = 'BLOCKED'
}

// منبع مشاوره
export enum ConsultationSource {
    ONLINE_USER = 'ONLINE_USER',
    LAWYER_BOOKING = 'LAWYER_BOOKING',
    LAWYER_SELF = 'LAWYER_SELF',
    EXTERNAL = 'EXTERNAL'
}

// نام‌های فارسی برای enumها
export const USER_ROLE_NAMES: Record<UserRole, string> = {
    [UserRole.USER]: 'کاربر عادی',
    [UserRole.LAWYER]: 'وکیل',
    [UserRole.ADMIN]: 'مدیر سیستم'
};

export const LICENSE_TYPE_NAMES: Record<LicenseType, string> = {
    [LicenseType.BASE1]: 'پایه یک',
    [LicenseType.BASE2]: 'پایه دو',
    [LicenseType.APPRENTICE]: 'کارآموز',
    [LicenseType.INTERN]: 'کارآموز دفتر',
    [LicenseType.JUDICIARY]: 'قضات',
    [LicenseType.LEGAL_CONSULTANT]: 'مشاور حقوقی'
};

export const SPECIALTY_NAMES: Record<Specialty, string> = {
    [Specialty.FAMILY]: 'خانواده',
    [Specialty.REAL_ESTATE]: 'ملکی',
    [Specialty.LEGAL]: 'حقوقی',
    [Specialty.CRIMINAL]: 'کیفری',
    [Specialty.COMMERCIAL]: 'تجاری',
    [Specialty.ADMINISTRATIVE]: 'اداری',
    [Specialty.REGISTRATION]: 'ثبت اسناد',
    [Specialty.CUSTOMS]: 'گمرک',
    [Specialty.TAX]: 'مالیاتی',
    [Specialty.CYBER_CRIME]: 'جرایم سایبری',
    [Specialty.IMMIGRATION]: 'مهاجرت',
    [Specialty.INTERNATIONAL]: 'بین‌الملل',
    [Specialty.TRAFFIC_ACCIDENT]: 'تصادفات',
    [Specialty.DRUG]: 'مواد مخدر',
    [Specialty.MEDICAL_MALPRACTICE]: 'قصور پزشکی',
    [Specialty.LABOR]: 'کارگری'
};




export const CONSULTATION_DURATION_NAMES: Record<ConsultationDuration, string> = {
    [ConsultationDuration.MIN_30]: '۳۰ دقیقه',
    [ConsultationDuration.MIN_60]: '۶۰ دقیقه',
    [ConsultationDuration.MIN_90]: '۹۰ دقیقه',
    [ConsultationDuration.MIN_120]: '۱۲۰ دقیقه'
};

export const CONSULTATION_TYPE_NAMES: Record<ConsultationType, string> = {
    [ConsultationType.IN_PERSON]: 'حضوری',
    [ConsultationType.PHONE]: 'تلفنی',
    [ConsultationType.VIDEO]: 'تصویری',
    [ConsultationType.TEXT_CHAT]: 'متنی'
};

export const CONSULTATION_STATUS_NAMES: Record<ConsultationStatus, string> = {
    [ConsultationStatus.PENDING]: 'در انتظار',
    [ConsultationStatus.CONFIRMED]: 'تایید شده',
    [ConsultationStatus.COMPLETED]: 'تکمیل شده',
    [ConsultationStatus.CANCELLED]: 'لغو شده'
};

export const PAYMENT_STATUS_NAMES: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'در انتظار',
    [PaymentStatus.COMPLETED]: 'تکمیل شده',
    [PaymentStatus.FAILED]: 'ناموفق',
    [PaymentStatus.REFUNDED]: 'بازگشت داده شده'
};

export const CLIENT_SOURCE_NAMES: Record<ClientSource, string> = {
    [ClientSource.SELF_REGISTERED]: 'ثبت‌نام خودکار',
    [ClientSource.LAWYER_REGISTERED]: 'ثبت‌نام توسط وکیل',
    [ClientSource.INVITATION_LINK]: 'لینک دعوت',
    [ClientSource.MANUAL_ADD]: 'اضافه دستی'
};

export const TIME_SLOT_STATUS_NAMES: Record<TimeSlotStatus, string> = {
    [TimeSlotStatus.AVAILABLE]: 'آزاد',
    [TimeSlotStatus.RESERVED]: 'رزرو موقت',
    [TimeSlotStatus.BOOKED]: 'رزرو قطعی',
    [TimeSlotStatus.BLOCKED]: 'مسدود'
};

export const CONSULTATION_SOURCE_NAMES: Record<ConsultationSource, string> = {
    [ConsultationSource.ONLINE_USER]: 'کاربر آنلاین',
    [ConsultationSource.LAWYER_BOOKING]: 'رزرو توسط وکیل',
    [ConsultationSource.LAWYER_SELF]: 'خود وکیل',
    [ConsultationSource.EXTERNAL]: 'خارجی'
};

export const skillCategories = [
    { id: 'communication', title: 'ارتباطی و مشاوره‌ای' },
    { id: 'research', title: 'تحقیقی و تحلیلی' },
    { id: 'writing', title: 'نگارشی' },
    { id: 'court', title: 'دادگاهی' },
    { id: 'management', title: 'مدیریتی' },
    { id: 'legal', title: 'تخصصی حقوقی' },
    { id: 'technical', title: 'فنی و دیجیتال' },
    { id: 'financial', title: 'مالی و حسابداری' },
    { id: 'ethics', title: 'اخلاق حرفه‌ای' }
];

// لیست مهارت‌ها با عنوان و دسته‌بندی
export const skillTitlesWithCategories = [
    // مهارت‌های ارتباطی و مشاوره‌ای
    { id: Skill.CLIENT_COUNSELING, title: 'مشاوره به موکل', category: 'communication' },
    { id: Skill.NEGOTIATION, title: 'مذاکره', category: 'communication' },
    { id: Skill.MEDIATION, title: 'میانجی‌گری', category: 'communication' },
    { id: Skill.PERSUASION, title: 'اقناع', category: 'communication' },
    { id: Skill.INTERVIEWING, title: 'مصاحبه', category: 'communication' },

    // مهارت‌های تحقیقی و تحلیلی
    { id: Skill.LEGAL_RESEARCH, title: 'تحقیق حقوقی', category: 'research' },
    { id: Skill.CASE_ANALYSIS, title: 'تحلیل پرونده', category: 'research' },
    { id: Skill.EVIDENCE_EVALUATION, title: 'ارزیابی شواهد', category: 'research' },
    { id: Skill.STATUTE_INTERPRETATION, title: 'تفسیر قوانین', category: 'research' },
    { id: Skill.PRECEDENT_ANALYSIS, title: 'تحلیل رویه‌های قضایی', category: 'research' },

    // مهارت‌های نگارشی
    { id: Skill.PLEADING_DRAFTING, title: 'تنظیم دادخواست', category: 'writing' },
    { id: Skill.CONTRACT_DRAFTING, title: 'تنظیم قرارداد', category: 'writing' },
    { id: Skill.LEGAL_OPINION_WRITING, title: 'نوشتن نظر حقوقی', category: 'writing' },
    { id: Skill.MOTION_WRITING, title: 'تنظیم لایحه', category: 'writing' },
    { id: Skill.REPORT_WRITING, title: 'نوشتن گزارش', category: 'writing' },

    // مهارت‌های دادگاهی
    { id: Skill.ORAL_ADVOCACY, title: 'دفاع شفاهی', category: 'court' },
    { id: Skill.CROSS_EXAMINATION, title: 'بازجویی متقابل', category: 'court' },
    { id: Skill.DIRECT_EXAMINATION, title: 'بازجویی مستقیم', category: 'court' },
    { id: Skill.OPENING_STATEMENT, title: 'بیان آغازین', category: 'court' },
    { id: Skill.CLOSING_ARGUMENT, title: 'بیان پایانی', category: 'court' },

    // مهارت‌های مدیریتی
    { id: Skill.CASE_MANAGEMENT, title: 'مدیریت پرونده', category: 'management' },
    { id: Skill.TIME_MANAGEMENT, title: 'مدیریت زمان', category: 'management' },
    { id: Skill.CLIENT_MANAGEMENT, title: 'مدیریت موکل', category: 'management' },
    { id: Skill.DEADLINE_MANAGEMENT, title: 'مدیریت ضرب‌الاجل', category: 'management' },
    { id: Skill.COST_MANAGEMENT, title: 'مدیریت هزینه', category: 'management' },

    // مهارت‌های تخصصی حقوقی
    { id: Skill.DUE_DILIGENCE, title: 'بررسی دقیق', category: 'legal' },
    { id: Skill.RISK_ASSESSMENT, title: 'ارزیابی ریسک', category: 'legal' },
    { id: Skill.COMPLIANCE_REVIEW, title: 'بررسی انطباق', category: 'legal' },
    { id: Skill.DISPUTE_RESOLUTION, title: 'حل اختلاف', category: 'legal' },
    { id: Skill.SETTLEMENT_NEGOTIATION, title: 'مذاکره توافق', category: 'legal' },

    // مهارت‌های فنی و دیجیتال
    { id: Skill.E_FILING, title: 'ثبت الکترونیک', category: 'technical' },
    { id: Skill.LEGAL_TECH, title: 'فناوری حقوقی', category: 'technical' },
    { id: Skill.DOCUMENT_MANAGEMENT, title: 'مدیریت اسناد', category: 'technical' },
    { id: Skill.EVIDENCE_DIGITIZATION, title: 'دیجیتالی کردن شواهد', category: 'technical' },
    { id: Skill.ONLINE_RESEARCH, title: 'تحقیق آنلاین', category: 'technical' },

    // مهارت‌های مالی و حسابداری
    { id: Skill.LEGAL_ACCOUNTING, title: 'حسابداری حقوقی', category: 'financial' },
    { id: Skill.DAMAGES_CALCULATION, title: 'محاسبه خسارت', category: 'financial' },
    { id: Skill.COST_BENEFIT_ANALYSIS, title: 'تحلیل هزینه-فایده', category: 'financial' },
    { id: Skill.FINANCIAL_ASSESSMENT, title: 'ارزیابی مالی', category: 'financial' },

    // مهارت‌های اخلاق حرفه‌ای
    { id: Skill.PROFESSIONAL_ETHICS, title: 'اخلاق حرفه‌ای', category: 'ethics' },
    { id: Skill.CONFIDENTIALITY, title: 'محرمانگی', category: 'ethics' },
    { id: Skill.CONFLICT_RESOLUTION, title: 'حل تعارض', category: 'ethics' },
    { id: Skill.PROFESSIONAL_CONDUCT, title: 'رفتار حرفه‌ای', category: 'ethics' }
];





// افزودن DTOهای جستجوی وکلا
export enum LawyerSortBy {
    NEWEST = 'createdAt',
    RATING = 'rating',
    EXPERIENCE = 'experienceYears',
    PRICE_LOW = 'price',
    PRICE_HIGH = 'price',
    SUCCESSFUL_CASES = 'successfulCases',
    VIEWS = 'views',
    COMMENTS_COUNT = 'reviewsCount'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}
