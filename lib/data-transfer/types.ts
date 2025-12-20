// src/lib/data-transfer/types.ts

import {
    UserRole,
    LicenseType,
    Specialty,
    Skill,
    ServiceType,
    ConsultationDuration,
    ConsultationType,
    ConsultationStatus,
    ServiceRequestStatus,
    QuestionStatus,
    PaymentStatus,
    TransactionType,
    SocialPlatform,
    NotificationType,
    Education,
    ClientSource,
    TimeSlotStatus,
    ConsultationSource
} from './data-types';

export interface ApiResponse<T = any> {
    message: string;
    data?: T;
}

export interface RegisterStep1Dto {
    mobile: string;
    role?: UserRole;
    isLawyer?: boolean;
}

export interface VerifyOtpDto {
    mobile: string;
    code: string;
}

export interface UserInfoDto {
    name: string;
    lastName: string;
    username?: string;
    accountSlug?: string;
    email?: string;
}

export interface LawyerInfoDto {
    accountSlug?: string;
    licenseType: LicenseType;
    barAssociation: string;
    licenseNumber: string;
    specialties: Specialty[];
    skills?: Skill[];
    province: string;
    city: string;
    address?: string;
    education?: Education;
    experienceYears?: number;
    about?: string;
    phone?: string;
    website?: string;
}

export interface CompleteRegistrationDto {
    password: string;
    userInfo: UserInfoDto;
    lawyerInfo?: LawyerInfoDto;
    isLawyer?: boolean;
}

export interface LoginDto {
    mobile: string;
    password: string;
}

export interface RefreshTokenDto {
    refreshToken: string;
}

export interface User {
    id: string;
    username: string;
    name: string;
    lastName: string;
    mobile: string;
    email?: string;
    role: UserRole;
    profileImage?: string;
    isActive: boolean;
    isVerified: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Account {
    id: string;
    userId: string;
    accountSlug: string;
    licenseType?: LicenseType;
    barAssociation?: string;
    licenseNumber?: string;
    specialties: Specialty[];
    skills: Skill[];
    education?: Education;
    experienceYears?: number;
    about?: string;
    successfulCases?: number;
    province?: string;
    city?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    socials?: any[];
    rating?: number;
    reviewsCount?: number;
    views?: number;
    questionPoints?: number;
    steps?: number;
    isVIP?: boolean;
    isVerified: boolean;
    documentsCompleted: boolean;
    contactAllowed: boolean;
    callCount?: number;
    lastCall?: string;
    createdBy: UserRole;
}

export interface LawyerProfile extends User {
    account: Account;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

// انواع پاسخ داشبورد
export interface DashboardResponseDto {
    message: string;
    user: User;
    tokens: Tokens;
    account?: Account;
    subscription?: SubscriptionInfoDto;
    userDashboard: UserDashboardDto;
    lawyerDashboard?: LawyerDashboardDto;
}

export interface DashboardDto {
    message: string;
    user: User;
    account?: Account;
    subscription?: SubscriptionInfoDto;
    userDashboard: UserDashboardDto;
    lawyerDashboard?: LawyerDashboardDto;
}

export interface AccountInfoDto {
    id: string;
    userId: string;
    accountSlug: string;
    licenseType?: LicenseType;
    barAssociation?: string;
    licenseNumber?: string;
    specialties: Specialty[];
    skills: Skill[];
    education?: Education;
    experienceYears?: number;
    about?: string;
    successfulCases: number;
    province?: string;
    city?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    socials: any[];
    rating: number;
    reviewsCount: number;
    views: number;
    questionPoints: number;
    steps: number;
    isVIP: boolean;
    isVerified: boolean;
    documentsCompleted: boolean;
    contactAllowed: boolean;
    callCount: number;
    lastCall?: Date;
    createdBy: UserRole;
    source?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SubscriptionInfoDto {
    id: string;
    accountId: string;
    planId: string;
    planName: string;
    duration: number;
    durationUnit: string;
    steps: number;
    expiryDate: Date;
    isVIP: boolean;
    purchasedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserDashboardDto {
    stats: {
        totalConsultations: number;
        pendingConsultations: number;
        totalServices: number;
        favoritesCount: number;
        nextConsultation?: {
            id: string;
            date: Date;
            time: string;
            type: ConsultationType;
            lawyerName: string;
            lawyerId: string;
            status: ConsultationStatus;
        };
    };
    recentConsultations: Array<{
        id: string;
        date: string;
        time: string;
        type: ConsultationType;
        lawyerName: string;
        lawyerId: string;
        status: ConsultationStatus;
        subject?: string;
        price: number;
    }>;
    recentServices: Array<{
        id: string;
        serviceName: string;
        lawyerName: string;
        lawyerId: string;
        status: ServiceRequestStatus;
        price: number;
        description?: string;
        createdAt: Date;
    }>;
    favorites: any[];
}

export interface LawyerDashboardDto {
    stats: {
        todayConsultations: number;
        pendingConsultations: number;
        completedConsultations: number;
        activeServices: number;
        totalIncome: number;
        monthlyIncome: number;
        availableTimeSlots: number;
        totalClients: number;
        pendingQuestions: number;
    };
    recentConsultations: Array<{
        id: string;
        date: string;
        time: string;
        type: ConsultationType;
        clientName: string;
        clientId: string;
        status: ConsultationStatus;
        subject?: string;
    }>;
    recentServices: Array<{
        id: string;
        serviceName: string;
        clientName: string;
        clientId: string;
        status: ServiceRequestStatus;
        price: number;
        description?: string;
        createdAt: Date;
    }>;
    consultationPricing: Array<{
        id: string;
        duration: ConsultationDuration;
        inPersonPrice: number;
        phonePrice: number;
        videoPrice: number;
        textChatPrice: number;
        isActive: boolean;
    }>;
    hasActivePricing: boolean;
}


// تایپ اصلی TimeSlot
export interface TimeSlot {
    id: string;
    accountId: string;
    date: string; // یا Date
    startTime: string;
    endTime: string;
    duration: string; // 'MIN_30', 'MIN_60', etc.
    allowedTypes: string[]; // ['IN_PERSON', 'VIDEO', ...]
    status: TimeSlotStatus; // یا string
    reservedUntil?: string;
    reservedBy?: string;
    consultation?: any;
    createdAt: string;
    updatedAt: string;
}

export interface TimeSlotsResponse {
    timeSlots: TimeSlot[];
    groupedByDate: Record<string, TimeSlot[]>;
    summary: {
        total: number;
        available: number;
        booked: number;
        dateRange: string;
    };
}

export interface WeeklyTemplate {
    id: string;
    accountId: string;
    template: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای قیمت‌گذاری
export interface Pricing {
    id: string;
    accountId: string;
    consultationType: ConsultationType;
    duration: ConsultationDuration;
    price: number;
    generalDiscount?: number;
    discountDescription?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای مشاوره‌ها
export interface Consultation {
    id: string;
    userId: string;
    lawyerId: string;
    timeSlotId: string;
    consultationType: ConsultationType;
    source: ConsultationSource;
    bookedByLawyerId?: string;
    status: ConsultationStatus;
    paymentStatus: PaymentStatus;
    amount: number;
    discountAmount?: number;
    finalAmount: number;
    paymentMethod?: string;
    paymentNote?: string;
    subject?: string;
    notes?: string;
    invoiceNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای خدمات
export interface ServiceRequest {
    id: string;
    userId: string;
    lawyerId: string;
    serviceId: string;
    description?: string;
    price: number;
    status: ServiceRequestStatus;
    invoiceNumber?: string;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Service {
    id: string;
    accountId: string;
    serviceType: ServiceType;
    price: number;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}



// مدل‌های جدید برای تراکنش‌ها
export interface Transaction {
    id: string;
    userId: string;
    lawyerId?: string;
    amount: number;
    type: TransactionType;
    status: PaymentStatus;
    description: string;
    consultationId?: string;
    serviceRequestId?: string;
    subscriptionId?: string;
    invoiceNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای سوالات و پاسخ‌ها
export interface Question {
    id: string;
    userId: string;
    lawyerId?: string;
    title: string;
    content: string;
    category: string;
    status: QuestionStatus;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Answer {
    id: string;
    questionId: string;
    lawyerId: string;
    content: string;
    isAccepted: boolean;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای نظرات
export interface Review {
    id: string;
    userId: string;
    lawyerId: string;
    consultationId?: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای علاقه‌مندی‌ها
export interface Favorite {
    id: string;
    userId: string;
    lawyerId: string;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای اعلان‌ها
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای پرونده‌ها
export interface CaseRecord {
    id: string;
    accountId: string;
    category: string;
    title: string;
    summary: string;
    result: string;
    year: number;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای شبکه‌های اجتماعی
export interface SocialMedia {
    id: string;
    accountId: string;
    platform: SocialPlatform;
    url: string;
    username?: string;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای اشتراک‌ها
export interface Subscription {
    id: string;
    accountId: string;
    planId: string;
    duration: number;
    durationUnit: string;
    steps: number;
    expiryDate: Date;
    isVIP: boolean;
    purchasedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای طرح‌های اشتراک
export interface SubscriptionPlan {
    id: string;
    name: string;
    duration: number;
    durationUnit: string;
    basePrice: number;
    maxSteps: number;
    discount: number;
    features: string[];
    isPopular: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// مدل‌های جدید برای کدهای تأیید
export interface VerificationCode {
    id: string;
    code: string;
    mobile: string;
    expiresAt: Date;
    userId?: string;
    tempData?: any;
    createdAt: Date;
}



export interface CreateTimeSlotDto {
    date: string;
    startTime: string;
    endTime: string;
    duration: ConsultationDuration;
    allowedTypes: ConsultationType[];
}

export interface UpdateTimeSlotDto {
    status?: TimeSlotStatus;
    allowedTypes?: ConsultationType[];
    reservedUntil?: string;
}

export interface WeeklyTemplateDto {
    template: Record<string, any>;
}

export interface ApplyTemplateDto {
    startDate: string;
    endDate: string;
    overwrite?: boolean;
}


export interface CreatePricingDto {
    consultationType: ConsultationType;
    duration: ConsultationDuration;
    price: number;
    generalDiscount?: number;
    discountDescription?: string;
}

export interface UpdatePricingDto {
    price?: number;
    generalDiscount?: number;
    discountDescription?: string;
    isActive?: boolean;
}

export interface BulkCreatePricingDto {
    pricings: CreatePricingDto[];
}


export interface CreateConsultationDto {
    timeSlotId: string;
    consultationType: ConsultationType;
    amount: number;
    discountAmount?: number;
    finalAmount: number;
    paymentMethod?: string;
    subject?: string;
    notes?: string;
}

export interface CreateConsultationByLawyerDto {
    clientId: string;
    timeSlotId: string;
    consultationType: ConsultationType;
    amount: number;
    discountAmount?: number;
    finalAmount: number;
    paymentMethod?: string;
    subject?: string;
    notes?: string;
}

export interface UpdateConsultationStatusDto {
    status: ConsultationStatus;
}



// ==================== DTOهای خدمات (Products) ====================

export interface ServiceRequestDto {
    lawyerId: string;
    serviceType: ServiceType;
    description?: string;
    price: number;
}

export interface UpdateServiceRequestDto {
    status?: ServiceRequestStatus;
    description?: string;
    price?: number;
}


export interface CreateServiceDto {
    serviceType: ServiceType;
    price: number;
    description?: string;
}

export interface UpdateServiceDto {
    price?: number;
    description?: string;
    isActive?: boolean;
}

export interface BulkServicesDto {
    services: CreateServiceDto[];
}

// ==================== DTOهای سفارشات (Orders) ====================

export interface CreateOrderDto {
    lawyerId: string;
    serviceId: string;
    description?: string;
    price?: number;
}

export interface UpdateOrderDto {
    status?: ServiceRequestStatus;
    paymentStatus?: PaymentStatus;
    description?: string;
    price?: number;
    invoiceNumber?: string;
}

export interface OrderFilterDto {
    status?: ServiceRequestStatus;
    lawyerId?: string;
    clientId?: string;
}

//مشتریها crm


export interface UpdateClientDto {
    isVerified?: boolean;
    isActive?: boolean;
    notes?: string;
    tags?: string[];
}


export interface LawyerClient {
    id: string;
    lawyerId: string;
    clientId: string;
    source: ClientSource;
    isVerified: boolean;
    isActive: boolean;
    addedAt: Date;
    verifiedAt?: Date;
    consultationCount: number;
    totalSpent: number;
    notes?: string;
    tags?: string[];
    client: User;
}

export interface ClientStats {
    totalClients: number;
    activeClients: number;
    verifiedClients: number;
    totalConsultations: number;
    totalRevenue: number;
    newClientsThisMonth: number;
    averageSpentPerClient: number;
}

export interface ClientDetails {
    id: string;
    lawyerId: string;
    clientId: string;
    source: ClientSource;
    isVerified: boolean;
    isActive: boolean;
    addedAt: Date;
    verifiedAt?: Date;
    consultationCount: number;
    totalSpent: number;
    notes?: string;
    tags?: string[];
    client: User;
    history: {
        consultations: Consultation[];
        services: ServiceRequest[];
        totalConsultations: number;
        totalServices: number;
    };
}

export interface InvitationLink {
    invitationLink: string;
    invitationToken: string;
    expiresIn: string;
    clientInfo: {
        name: string;
        lastName: string;
        mobile: string;
        email?: string;
    };
    message: string;
}

//#########################################

export interface SearchLawyersDto {
    search?: string;
    province?: string; // تغییر از Province[] به string
    cities?: string[]; // افزودن فیلد جدید برای چند شهر
    specialties?: Specialty[];
    skills?: Skill[];
    services?: ServiceType[];
    consultationTypes?: ConsultationType[];
    onlineOnly?: boolean;
    vipOnly?: boolean;
    hasPricing?: boolean;
    hasServices?: boolean;
    minExperience?: number;
    minRating?: number;
    minReviews?: number;
    minSuccessfulCases?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface LawyerListItem {
    id: string;
    username: string;
    name: string;
    lastName: string;
    profileImage: string;
    specialty: Specialty;
    rating: number;
    views: number;
    experienceYears: number;
    city: string;
    minConsultationPrice: number;
    isOnline: boolean;
    subscription?: {
        steps: number;
        expiryDate: Date;
        isVIP: boolean;
    };
    questionPoints?: number;
}

export interface LawyersResponse {
    items: LawyerListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// src/lib/data-transfer/types.ts

export interface LawyersFilter {
    province?: string;
    cities?: string[];
    specialties?: Specialty[]; // تغییر از 'specialty' به 'specialties'
    skills?: Skill[];
    consultationTypes?: ConsultationType[];
    onlineOnly?: boolean;
    vipOnly?: boolean;
    hasPricing?: boolean;
    hasServices?: boolean;
    minExperience?: number;
    minRating?: number;
    minReviews?: number;
    minSuccessfulCases?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

//  DTOهای CRM
export interface CreateClientDto {
    name: string;
    lastName: string;
    mobile: string;
    email?: string;
    notes?: string;
    source?: ClientSource;
}

export interface UpdateClientDto {
    notes?: string;
    tags?: string[];
    isActive?: boolean;
    isVerified?: boolean;
}

export interface InviteClientDto {
    name: string;
    lastName: string;
    mobile: string;
    email?: string;
}

export interface ClientFilterDto {
    search?: string;
    isActive?: boolean;
    isVerified?: boolean;
    tags?: string[];
}

export interface BookConsultationForClientDto {
    clientId: string;
    timeSlotId: string;
    paymentStatus?: 'PENDING' | 'COMPLETED';
    subject?: string;
    notes?: string;
}

export interface ClientStatsDto {
    totalClients: number;
    activeClients: number;
    verifiedClients: number;
    totalConsultations: number;
    totalRevenue: number;
    newClientsThisMonth: number;
    averageSpentPerClient: number;
}

export interface ClientDetailsDto {
    id: string;
    lawyerId: string;
    clientId: string;
    source: ClientSource;
    isVerified: boolean;
    isActive: boolean;
    addedAt: Date;
    verifiedAt?: Date;
    consultationCount: number;
    totalSpent: number;
    notes?: string;
    tags?: string[];
    client: User;
    history: {
        consultations: Consultation[];
        services: ServiceRequest[];
        totalConsultations: number;
        totalServices: number;
    };
}

export interface InvitationLinkDto {
    invitationLink: string;
    invitationToken: string;
    expiresIn: string;
    clientInfo: {
        name: string;
        lastName: string;
        mobile: string;
        email?: string;
    };
    message: string;
}

