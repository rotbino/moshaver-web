// lib/types.ts



export interface ConsultationType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ConsultationPricing {
  id: string;
  lawyerId: string;
  duration: string; // "15min", "30min", "45min", "60min", "90min", "120min"
  inPersonPrice: number;
  phonePrice: number;
  videoPrice: number;
  phonePercentage: number; // درصد قیمت تلفنی نسبت به حضوری
  videoPercentage: number; // درصد قیمت تماس ویدئویینسبت به حضوری
  isActive: boolean;
}



export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface WeeklyTemplate {
  [key: string]: {
    hours: number[];
    isHoliday: boolean;
  };
}

export interface LawyerList {
  id: string;
  username:string;
  name: string;
  lastName: string;
  specialty: string;
  province: string;
  city: string;
  profileImage: string;
  about: string;
  experience: number;
  views: number;
  phone: string;
  mobile: string;
  address: string;
  rating: number;
  consultationFee: number;
  reviews?: Review[];
  qaPairs?: QAPair[];
  isOnline: boolean;
  steps: number;
  isVIP: boolean;
}

export interface Province {
  id: string;
  name: string;
  cities: string[];
}
// lib/types.ts

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface WeeklyTemplate {
  [key: string]: {
    hours: number[];
    isHoliday: boolean;
  };
}



export interface Consultation {
  id: string;
  userId: string;
  lawyerId: string;
  lawyerName: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  type: "instant" | "scheduled";
  subject?: string;
  invoiceNumber?: string;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  lawyerId: string;
  lawyerName: string;
  serviceName: string;
  description: string;
  price: number;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
  completedAt?: string;
  invoiceNumber?: string;
}

export interface Favorite {
  id: string;
  lawyerId: string;
  lawyerName: string;
  lawyerSpecialty: string;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Client {
  id: string;
  name: string;
  lastName: string;
  mobile: string;
  phone: string;
  totalConsultations: number;
  totalSpent: number;
  lastConsultation?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "consultation" | "service";
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  invoiceNumber?: string;
}


export interface UserProfile {
  id: string;
  username:string;
  name: string;
  lastName: string;
  mobile: string;
  phone?: string;
  role: "user" | "lawyer";
  createdAt: string;

  // فیلدهای خاص وکلا
  specialty?: string;
  province?: string;
  city?: string;
  about?: string;
  experience?: number;
  views?: number;
  address?: string;
  rating?: number;
  // حذف consultationFee قدیمی و جایگزینی با ساختار جدید
  // consultationFee?: number;  ← این فیلد حذف می‌شود
  profileImage?: string;

  // داده‌های مشاوره‌ها
  consultations?: Array<{
    id: string;
    userId: string;
    lawyerId: string;
    lawyerName: string;
    date: string;
    time: string;
    duration: string;
    price: number;
    status: "completed" | "confirmed" | "pending" | "cancelled";
    type: "scheduled" | "instant";
    subject?: string;
    invoiceNumber?: string;
  }>;

  // داده‌های خدمات
  services?: Array<{
    id: string;
    userId: string;
    lawyerId: string;
    lawyerName: string;
    serviceName: string;
    description: string;
    price: number;
    status: "completed" | "in-progress" | "pending" | "cancelled";
    createdAt: string;
    completedAt?: string;
    invoiceNumber?: string;
  }>;
  offeredServices?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  // زمان‌های مشاوره
  timeSlots?: TimeSlot[];

  // قالب هفتگی
  weeklyTemplate?: WeeklyTemplate;

  // مشتریان
  clients?: Array<{
    id: string;
    name: string;
    lastName: string;
    mobile: string;
    phone?: string;
    totalConsultations: number;
    totalSpent: number;
    lastConsultation: string;
  }>;

  // تراکنش‌های مالی
  transactions?: Array<{
    id: string;
    amount: number;
    type: "consultation" | "service";
    description: string;
    status: "completed" | "pending" | "failed";
    createdAt: string;
    invoiceNumber?: string;
  }>;

  // علاقه‌مندی‌ها
  favorites?: Array<{
    id: string;
    lawyerId: string;
    lawyerName: string;
    lawyerSpecialty: string;
    createdAt: string;
  }>;

  subscription?: {
    planId: string;
    planName: string;
    steps: number;
    expiryDate: string;
    isVIP: boolean;
    purchasedAt: string;
  },
  questionPoints?: number;

  // ← اضافه کردن فیلد جدید برای قیمت‌های مشاوره
  consultationPricing?: ConsultationPricing[];
}

export interface UserPreferences {
  [key: string]: string;
}

// اضافه کردن اینترفیس‌های جدیدها برای کامنتها و سوالات و ستاره
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  askedBy: string;
  askedAt: string;
  answeredAt: string;
}


// lib/api/types.ts

export interface LegalQuestion {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  answers: Answer[];
  isAnswered: boolean;
  viewCount: number;
  directToLawyer?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  lawyerId: string;
  lawyerName: string;
  content: string;
  createdAt: string;
  isAccepted: boolean;
  likes: number;
  isLikedByUser?: boolean;
}

export interface UserQuestionStats {
  totalQuestions: number;
  unansweredQuestions: number;
  newAnswersCount: number;
}