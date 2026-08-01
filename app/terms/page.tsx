// app/terms/page.tsx - بخش جدید
'use client';

import React from 'react';
import Link from 'next/link';
import { AppHeader, AppFooter } from '@/app/components';
import {
    Shield,
    Scale,
    TrendingUp,
    Users,
    ShieldCheck,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle,
    Info,
    Target,
    Award,
    Clock,
    Handshake,
    Building2,
    Gavel,
    DollarSign,
    Package,
    Truck,
    BadgeCheck,
    Lightbulb,
    Sparkles,
    Search,
    Eye,
    UserCheck,
    AlertTriangle
} from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background pt-16 pb-24">
            <AppHeader showJoinButton={false} showBack={false}/>

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
                {/* ============================================================
                    هدر صفحه
                    ============================================================ */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <Gavel className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">
                        قوانین و مقررات
                    </h1>
                    <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto text-justify leading-relaxed">
                        پلتفرم سرنخ با هدف ایجاد شفافیت و اعتماد در بازارهای تخصصی B2B طراحی شده است.
                        لطفاً قوانین زیر را به دقت مطالعه کنید.
                    </p>
                    <div className="mt-2 text-xs text-on-surface-variant/60">
                        آخرین به‌روزرسانی: {new Date().toLocaleDateString('fa-IR')}
                    </div>
                </div>

                {/* ============================================================
                    بخش ۱: اصول کلی
                    ============================================================ */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                        <Shield className="w-6 h-6 text-primary" />
                        اصول کلی
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <h3 className="font-semibold text-on-surface flex items-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-primary" />
                                هدف پلتفرم
                            </h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                سرنخ یک پلتفرم تخصصی برای اتصال خریداران و فروشندگان عمده کالا است. هدف ما ایجاد
                                شفافیت قیمت، کاهش واسطه‌ها و اتصال مستقیم تولیدکنندگان، عمده‌فروشان و خریداران
                                عمده در یک فضای امن و قابل اعتماد است.
                            </p>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <h3 className="font-semibold text-on-surface flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-primary" />
                                مخاطبان
                            </h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                این پلتفرم برای کسب‌وکارها، تولیدکنندگان، عمده‌فروشان، واردکنندگان، صادرکنندگان،
                                پیمانکاران و خریداران عمده طراحی شده است. تمامی کاربران باید دارای کسب‌وکار
                                معتبر و فعالیت اقتصادی باشند.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    بخش ۲: قوانین قیمت‌گذاری
                    ============================================================ */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                        <DollarSign className="w-6 h-6 text-primary" />
                        قوانین قیمت‌گذاری
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">قیمت شفاف</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        تمام قیمت‌های ثبت شده در سرنخ باید شفاف، واقعی و قابل راستی‌آزمایی باشند.
                                        قیمت‌های اعلامی باید شامل کلیه هزینه‌های مربوطه باشد.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">عدم قیمت‌های غیرواقعی</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        ثبت قیمت‌های غیرواقعی، کاذب یا اغراق‌آمیز به منظور جذب تماس،
                                        تخلف محسوب شده و باعث کاهش امتیاز اعتماد و حذف آگهی می‌شود.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <Package className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">قیمت بر اساس حجم خرید</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        هر کالا می‌تواند با توجه به حجم خرید مختلف، قیمت‌های متفاوتی داشته باشد.
                                        فروشندگان می‌توانند برای هر کالا چندین قیمت با حداقل خرید متفاوت ثبت کنند.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">به‌روزرسانی قیمت</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        فروشندگان موظف به به‌روزرسانی قیمت‌های خود هستند. قیمت‌های قدیمی
                                        پس از انقضای اعتبار، از تابلو حذف می‌شوند.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    بخش ۳: قوانین آگهی
                    ============================================================ */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                        <FileText className="w-6 h-6 text-primary" />
                        قوانین ثبت آگهی
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">صحت اطلاعات</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        کلیه اطلاعات ثبت شده در آگهی (عنوان، قیمت، موجودی، مشخصات کالا و ...)
                                        باید دقیق، صحیح و مطابق با واقعیت باشد. ارائه اطلاعات نادرست تخلف محسوب می‌شود.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <BadgeCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">اعتبار آگهی</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        هر آگهی دارای اعتبار مشخص است و پس از انقضا، به‌طور خودکار از تابلو حذف می‌شود.
                                        فروشنده می‌تواند آگهی را تمدید کند.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">سهمیه آگهی رایگان</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        هر فروشنده تا ۵ آگهی به‌صورت رایگان در تابلو دارد. برای آگهی‌های بیشتر،
                                        از اعتبار استفاده می‌شود. نردبان کردن آگهی نیز نیازمند اعتبار است.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    بخش ۴: امتیاز و اعتبار
                    ============================================================ */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                        <Award className="w-6 h-6 text-primary" />
                        امتیاز اعتماد و اعتبار
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">سیستم امتیاز اعتماد</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        هر کاربر دارای امتیاز اعتماد است که بر اساس فعالیت‌ها، کیفیت آگهی‌ها،
                                        تعاملات و بازخوردها محاسبه می‌شود. امتیاز بالاتر به معنای اعتماد بیشتر است.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">اعتبار هدیه</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        به هر کاربر جدید در هنگام ثبت‌نام، اعتبار هدیه تعلق می‌گیرد. همچنین
                                        عضویت در هر بازار، اعتبار جدیدی به کاربر اعطا می‌کند.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    بخش ۵: حریم خصوصی و امنیت
                    ============================================================ */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                        <Shield className="w-6 h-6 text-primary" />
                        حریم خصوصی و امنیت
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">حفظ اطلاعات کاربران</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        اطلاعات شخصی و کسب‌وکاری کاربران نزد سرنخ محفوظ است و بدون رضایت
                                        کاربر، در اختیار شخص ثالث قرار نمی‌گیرد.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">محدودیت تماس</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        به منظور جلوگیری از سوءاستفاده، تماس با فروشندگان محدود به ۲۰ تماس
                                        در روز برای هر کاربر است.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    بخش ۶: مسئولیت تحقیق و بررسی خریداران
                    ============================================================ */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                        <Search className="w-6 h-6 text-primary" />
                        مسئولیت تحقیق و بررسی خریداران
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">تحقیق قبل از خرید</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        خریداران محترم موظف هستند قبل از هرگونه معامله، اطلاعات لازم را
                                        به‌طور کامل بررسی کنند. این شامل بررسی مشخصات کالا، قیمت، شرایط تحویل،
                                        اعتبار فروشنده و سایر موارد مرتبط با معامله می‌شود. سرنخ هیچ گونه
                                        مسئولیتی در قبال تصمیمات خریداران ندارد.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <UserCheck className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">اعتبارسنجی فروشنده</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        خریداران باید پیش از انجام معامله، اعتبار و سابقه فروشنده را بررسی کنند.
                                        سرنخ اطلاعات اولیه فروشندگان را ارائه می‌دهد اما مسئولیت تأیید نهایی
                                        اعتبار فروشنده بر عهده خریدار است.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1">هشدارهای معاملاتی</h3>
                                    <ul className="text-sm text-on-surface-variant leading-relaxed space-y-2 list-disc list-inside pr-4 text-justify">
                                        <li>هرگز مبالغ هنگفت را بدون دریافت کالا واریز نکنید</li>
                                        <li>قبل از پرداخت، مدارک و مجوزهای فروشنده را بررسی کنید</li>
                                        <li>در صورت امکان، نمونه کالا را بازدید کنید</li>
                                        <li>قرارداد کتبی با شرایط مشخص تنظیم کنید</li>
                                        <li>از فروشندگانی با امتیاز اعتماد پایین احتیاط کنید</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    بخش ۷: سلب مسئولیت سرنخ
                    ============================================================ */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                        <Shield className="w-6 h-6 text-primary" />
                        سلب مسئولیت
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-error/5 border border-error/20 p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1 text-error">نقش سرنخ</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        سرنخ صرفاً یک پلتفرم واسط برای ارتباط بین خریداران و فروشندگان است و
                                        در هیچ معامله‌ای به عنوان طرف قرارداد محسوب نمی‌شود. سرنخ مسئولیتی در
                                        قبال کیفیت کالاها، قیمت‌ها، تحویل، پرداخت و یا هرگونه اختلاف ناشی از
                                        معاملات بین کاربران ندارد.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-error/5 border border-error/20 p-5">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-error flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1 text-error">مسئولیت کاربران</h3>
                                    <ul className="text-sm text-on-surface-variant leading-relaxed space-y-2 list-disc list-inside pr-4 text-justify">
                                        <li>کاربران مسئول کامل تصمیمات و معاملات خود هستند</li>
                                        <li>سرنخ هیچ گونه تضمینی در مورد صحت اطلاعات فروشندگان نمی‌دهد</li>
                                        <li>هرگونه خسارت ناشی از معاملات، بر عهده طرفین معامله است</li>
                                        <li>سرنخ در قبال کلاهبرداری یا تخلف کاربران مسئولیتی ندارد</li>
                                        <li>کاربران باید تمامی موارد قانونی و مالی را شخصاً پیگیری کنند</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-error/5 border border-error/20 p-5">
                            <div className="flex items-start gap-3">
                                <Scale className="w-5 h-5 text-error flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1 text-error">توصیه‌های قانونی</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                                        سرنخ توصیه می‌کند کاربران قبل از هرگونه معامله، با مشاوران حقوقی و مالی
                                        خود مشورت کنند. همچنین انجام معاملات از طریق قراردادهای کتبی رسمی و
                                        مستندات معتبر، بهترین راه برای پیشگیری از اختلافات است.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    بخش ۸: مسئولیت‌ها
                    ============================================================ */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                        <Handshake className="w-6 h-6 text-primary" />
                        مسئولیت‌ها
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <h3 className="font-semibold text-on-surface flex items-center gap-2 mb-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                مسئولیت فروشنده
                            </h3>
                            <ul className="text-sm text-on-surface-variant leading-relaxed space-y-2 list-disc list-inside pr-4 text-justify">
                                <li>ارائه اطلاعات دقیق و صحیح درباره کالا و خدمات</li>
                                <li>ثبت قیمت‌های واقعی و به‌روز</li>
                                <li>پاسخگویی به موقع به درخواست‌های خریداران</li>
                                <li>رعایت اصول اخلاقی در تبلیغات و تعاملات</li>
                            </ul>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant/50 p-5 hover:shadow-sm transition-all">
                            <h3 className="font-semibold text-on-surface flex items-center gap-2 mb-2">
                                <Truck className="w-5 h-5 text-primary" />
                                مسئولیت خریدار
                            </h3>
                            <ul className="text-sm text-on-surface-variant leading-relaxed space-y-2 list-disc list-inside pr-4 text-justify">
                                <li>بررسی دقیق اطلاعات آگهی قبل از تماس</li>
                                <li>ارائه اطلاعات صحیح در هنگام استعلام قیمت</li>
                                <li>رعایت ادب و احترام در ارتباط با فروشندگان</li>
                                <li>تحقیق و بررسی کامل قبل از هرگونه معامله</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    بخش ۹: تخلفات و عواقب
                    ============================================================ */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                        <Gavel className="w-6 h-6 text-primary" />
                        تخلفات و عواقب
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-error/5 border border-error/20 p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1 text-error">تخلفات</h3>
                                    <ul className="text-sm text-on-surface-variant leading-relaxed space-y-2 list-disc list-inside pr-4 text-justify">
                                        <li>ثبت قیمت‌های غیرواقعی و کاذب</li>
                                        <li>ارائه اطلاعات نادرست در آگهی</li>
                                        <li>سوءاستفاده از سیستم تماس</li>
                                        <li>کلاهبرداری یا تقلب در معاملات</li>
                                        <li>تخلف از قوانین هر بازار</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 p-5">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-on-surface mb-1 text-primary">عواقب</h3>
                                    <ul className="text-sm text-on-surface-variant leading-relaxed space-y-2 list-disc list-inside pr-4 text-justify">
                                        <li>کاهش امتیاز اعتماد</li>
                                        <li>حذف آگهی‌های متخلف</li>
                                        <li>اخطار و تذکر کتبی</li>
                                        <li>مسدودسازی موقت حساب کاربری</li>
                                        <li>در تخلفات شدید، مسدودسازی دائم حساب کاربری</li>
                                        <li>پیگیری قانونی در موارد کلاهبرداری</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    بخش ۱۰: ارتباط با ما
                    ============================================================ */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                        <Handshake className="w-6 h-6 text-primary" />
                        ارتباط با ما
                    </h2>
                    <div className="bg-surface-container-lowest border border-outline-variant/50 p-6 text-center">
                        <p className="text-sm text-on-surface-variant leading-relaxed text-justify mb-4">
                            در صورت داشتن هرگونه سؤال، پیشنهاد یا شکایت، می‌توانید از طریق راه‌های زیر با ما در ارتباط باشید.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="tel:09196421264" className="flex items-center gap-2 text-primary hover:underline">
                                📞 ۰۹۱۹۶۴۲۱۲۶۴
                            </a>
                            <span className="text-outline-variant hidden sm:block">|</span>
                            <a href="mailto:info@sarnakh.com" className="flex items-center gap-2 text-primary hover:underline">
                                ✉️ info@sarnakh.com
                            </a>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    فوتر صفحه
                    ============================================================ */}
                <div className="border-t border-outline-variant/50 pt-6 text-center">
                    <p className="text-xs text-on-surface-variant/60 text-justify text-center">
                        تمامی حقوق مادی و معنوی این سایت متعلق به سرنخ است.
                        <br />
                        استفاده از مطالب سایت با ذکر منبع بلامانع است.
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                        <Link href="/" className="text-xs text-primary hover:underline">
                            بازگشت به صفحه اصلی
                        </Link>
                        <span className="text-outline-variant/30">|</span>
                        <Link href="/privacy" className="text-xs text-primary hover:underline">
                            حریم خصوصی
                        </Link>
                    </div>
                </div>
            </main>

            <AppFooter activeTab="dashboard" />
        </div>
    );
}