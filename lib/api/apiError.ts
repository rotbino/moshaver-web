// lib/api/ApiError.ts
import { toast } from "@/lib/hooks/useApi____use-toast";
// lib/api/ApiErrorCode.ts

export enum ApiErrorCode {
    Approved = 0,
    InvalidSession = 1,
    TimeSync = 5,
    WrongInputData = 10,
    DuplicateInformation = 11,
    DataConflict = 12,
    ItemNotFound = 13,
    BadDataStatus = 14,
    PageFault = 15,
    DataMissing = 16,
    IdentificationError = 17,
    InsufficientAmount = 18,
    InvalidIdentifier = 19,
    SecurityViolation = 29,
    InvalidOperation = 30,
    InsufficientFunds = 31,
    ExceededLimit = 32,
    TooManyObjects = 33,
    TicketOnTheWay = 34,
    DuplicateRequest = 35,
    OppositePartyFailed = 41,
    ProtocolError = 42,
    ServerBusy = 90,
    OppositePartyTimeout = 91,
    ObsoleteClient = 92,
    IllegalClient = 93,
    FileIOError = 94,
    SystemMalfunction = 99,

    // HTTP-like errors (غیر از مستند API)
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
    NetworkError = 0, // برای خطاهای شبکه/بدون پاسخ
}

type ToastMessage =
    | {
    title: string;
    description: string;
    variant: "default" | "destructive";
}
    | string;

export class ApiError extends Error {
    code: number;
    message: string;
    data: any;

    constructor(code: number, message: string, data?: any) {
        super(message);
        this.code = code;
        this.message = message;
        this.data = data;
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    getToast(): ToastMessage {
        const code = String(this.code);
        let message = String(this.message);
        switch (code) {
                // ----------------------- HTTP استاندارد -----------------------
            case "400":
                return { title: "درخواست نامعتبر", description: "درخواست شما نامعتبر است.", variant: "destructive" };
            case "401":
                return { title: "عدم دسترسی", description: "دسترسی ندارید. لطفا لاگین کنید.", variant: "destructive" };
            case "403":
                return { title: "عدم دسترسی", description: "شما دسترسی لازم برای انجام این عملیات را ندارید.", variant: "destructive" };
            case "404":
                return { title: "خطای آدرس", description: "آدرس آی پی آی اشتباه است.", variant: "destructive" };
            case "500":
                return { title: "خطای سرور", description: "خطای سرور. لطفاً دوباره تلاش کنید.", variant: "destructive" };

                // ----------------------- خطاهای شبکه / کلاینت -----------------------
            case "0":
            case "ERR_NETWORK":
                return { title: "خطای شبکه", description: this.message || "خطای شبکه یا عدم پاسخ از سرور", variant: "destructive" };
            case "ECONNABORTED":
                return { title: "Timeout", description: "مهلت درخواست تمام شد (Timeout)", variant: "destructive" };
            case "ERR_BAD_REQUEST":
                return { title: "درخواست نامعتبر", description: "درخواست غیرمعتبر (Bad Request)", variant: "destructive" };
            case "ERR_BAD_RESPONSE":
                return { title: "پاسخ نامعتبر", description: "پاسخ نامعتبر از سرور", variant: "destructive" };
            case "ERR_CANCELED":
                return { title: "لغو شده", description: "درخواست توسط کاربر یا کد لغو شد", variant: "destructive" };
            case "ERR_FR_TOO_MANY_REDIRECTS":
                return { title: "ریدایرکت بیش از حد", description: "تعداد ریدایرکت‌ها بیش از حد مجاز", variant: "destructive" };

            // ----------------------- کدهای مستند -----------------------
            case "1":
                return {
                    title: "نشست نامعتبر",
                    description: "نشست شما منقضی شده یا وجود ندارد. لطفاً دوباره لاگین کنید.",
                    variant: "destructive",
                };
            case "5":
                return {
                    title: "عدم تطابق زمان",
                    description: `ساعت دستگاه شما تنظیم نیست. ساعت صحیح: ${this?.data || "نامشخص"}`,
                    variant: "destructive",
                };
            case "10":
                return {
                    title: "خطای فرمت ورودی",
                    description: this.message + " " + this?.data,
                    variant: "destructive",
                };
            case "11":
                return {
                    title: "اطلاعات تکراری",
                    description: this.message || "موضوع مورد نظر قبلا ثبت شده است.",
                    variant: "destructive",
                };
            case "12":
                return {
                    title: "تعارض داده",
                    description: this.message || "اطلاعات وارد شده با وضعیت فعلی سامانه در تضاد است.",
                    variant: "destructive",
                };
            case "13":
                return {
                    title: "یافت نشد",
                    description: this.message + " " + this?.data,
                    variant: "destructive",
                };
            case "14":
                return {
                    title: "وضعیت نامعتبر",
                    description: this.message || "وضعیت فعلی اجازه انجام عملیات را نمی‌دهد.",
                    variant: "destructive",
                };
            case "15":
                return {
                    title: "صفحه نامعتبر",
                    description: `گزارش چنین صفحه‌ای وجود ندارد. آخرین صفحه: ${this?.data || "نامشخص"}`,
                    variant: "destructive",
                };
            case "16":
                return {
                    title: "داده الزامی",
                    description: `فیلد الزامی ${this?.data || ""} ارسال نشده است.`,
                    variant: "destructive",
                };
            case "17":
                return {
                    title: "خطای احراز هویت",
                    description: "نام کاربری یا رمز عبور اشتباه است.",
                    variant: "destructive",
                };
            case "18":
                return {
                    title: "مبلغ ناکافی",
                    description: `مبلغ باید حداقل ${this?.data || ""} باشد.`,
                    variant: "destructive",
                };
            case "19":
                return {
                    title: "شناسه نامعتبر",
                    description: "شناسه ارائه‌شده اشتباه است.",
                    variant: "destructive",
                };
            case "29":
                return {
                    title: "خطای امنیتی",
                    description: "درخواست به دلیل ملاحظات امنیتی رد شد.",
                    variant: "destructive",
                };
            case "30":
                return {
                    title: "عملیات نامعتبر",
                    description: this.message || "کاربر دسترسی به این عملیات ندارد.",
                    variant: "destructive",
                };
            case "31":
                return {
                    title: "موجودی ناکافی",
                    description: "موجودی حساب کافی نیست.",
                    variant: "destructive",
                };
            case "32":
                return {
                    title: "فراتر از محدودیت",
                    description: `محدودیت: ${this?.data || ""}`,
                    variant: "destructive",
                };
            case "33":
                return {
                    title: "تعداد بیش از حد مجاز",
                    description:message || `تعداد ${this?.data || "موارد"} بیش از حد مجاز است.`,
                    variant: "destructive",
                };
            case "34":
                return {
                    title: "ارسال کد امنیتی",
                    description: `در بازه‌ی زمانی مجاز کد امنیتی ارسال شده. زمان بعدی: ${this?.data || ""}`,
                    variant: "destructive",
                };
            case "35":
                return {
                    title: "درخواست تکراری",
                    description: this.message + " " + this.data + " ثانیه دیگر دوباره تلاش کنید.",
                    variant: "destructive",
                };
            case "41":
                return {
                    title: "خطا از سمت مقابل",
                    description: this.message || "عملیات سمت بانک/پرداخت‌یار با خطا مواجه شد.",
                    variant: "destructive",
                };
            case "42":
                return {
                    title: "خطای پروتکل",
                    description: this.message || "پاسخ طرف مقابل با پروتکل توافق‌شده مطابقت ندارد.",
                    variant: "destructive",
                };
            case "90":
                return {
                    title: "سرور مشغول",
                    description: "مرکز فعلاً پاسخگو نیست. بعداً تلاش کنید.",
                    variant: "destructive",
                };
            case "91":
                return {
                    title: "عدم پاسخگویی طرف مقابل",
                    description: this.message || "طرف مقابل (بانک/پرداخت‌یار) پاسخگو نیست.",
                    variant: "destructive",
                };
            case "92":
                return {
                    title: "نسخه منسوخ",
                    description: "نسخه فعلی اپلیکیشن پشتیبانی نمی‌شود. لطفاً به‌روزرسانی کنید.",
                    variant: "destructive",
                };
            case "93":
                return {
                    title: "کلاینت غیرمجاز",
                    description: "این کلاینت اجازه استفاده از سرویس را ندارد.",
                    variant: "destructive",
                };
            case "94":
                return {
                    title: "خطای فایل",
                    description: "مشکل در ذخیره یا بازیابی فایل رخ داده است.",
                    variant: "destructive",
                };
            case "99":
                if(this.data==="IMPLEMENT"){
                    message="سمت سرور هنوز پیاده سازی نشده"
                }
                return {
                    title: "خطای سیستمی",
                    description: message,
                    variant: "destructive",
                };

            // ----------------------- پیش‌فرض -----------------------
            default:
                return {
                    title: "خطا",
                    description: this.message || "خطای نامشخص",
                    variant: "destructive",
                };
        }
    }
}
