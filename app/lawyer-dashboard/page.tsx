// src/app/lawyer-dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import {
    Calendar,
    Users,
    Clock,
    DollarSign,
    FileText,
    Briefcase,
    BarChart3,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    X, MessageSquare, Settings
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/data-transfer/api-hooks";
import { useTimeManagement, usePricing } from "@/lib/data-transfer/api-hooks";

export default function LawyerDashboardPage() {
    const { useCurrentUser } = useAuth();
    const currentUser = useCurrentUser();

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // اگر کاربر وکیل نیست، به صفحه کاربر عادی هدایت شود
    if (currentUser.role !== 'LAWYER') {
        return null;
    }

    // استفاده از هوک‌های جدید برای بررسی وضعیت
    const { useGetWorkingHoursCount } = useTimeManagement();
    const { useGetUserPricingCount } = usePricing();

    const { data: workingHoursCount, isLoading: workingHoursLoading } = useGetWorkingHoursCount();
    const { data: pricingCount, isLoading: pricingLoading } = useGetUserPricingCount();
    
    // استخراج داده‌های مورد نیاز از state
    const { user, account, userDashboard, lawyerDashboard } = currentUser;

    // محاسبه آمار مشاوره‌ها
    const todayConsultations = lawyerDashboard?.recentConsultations?.filter(c =>
        new Date(c.date).toDateString() === new Date().toDateString()
    ) || [];

    const pendingConsultations = lawyerDashboard?.recentConsultations?.filter(c =>
        c.status === 'PENDING' || c.status === 'CONFIRMED'
    ) || [];

    // محاسبه آمار خدمات
    const activeServices = lawyerDashboard?.recentServices?.filter(s =>
        s.status === 'IN_PROGRESS'
    ) || [];

    // محاسبه آمار مالی
    const totalIncome = lawyerDashboard?.stats?.totalIncome || 0;
    const monthlyIncome = lawyerDashboard?.stats?.monthlyIncome || 0;

    // محاسبه آمار وکلا
    const totalClients = lawyerDashboard?.stats?.totalClients || 0;

    // کامپوننت پیام زمان‌های خالی
    const EmptyTimeSlotsMessage = () => (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="items-start gap-4">
                <div className="flex gap-2">
                    <AlertCircle className="w-6 h-6 text-orange-600 "/>
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">
                        زمانهای مشاوره خود را ثبت کنید.
                    </h3>
                </div>
                <p className="text-orange-700 mb-4 text-justify">
                    برای شروع، لطفاً ساعات کاری خود تعریف کنید. تا کاربران بتوانند انواع مشاوره
                    حضوری، تلفنی، چت یا ویدئویی با شما رزرو کنند.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full">
                    <Link href="/lawyer-dashboard/schedule">
                        <Button className="bg-green-600 hover:bg-orange-700">
                            <Settings className="w-4 h-4 mr-2"/>
                            تنظیم زمان‌های مشاوره
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );

    // کامپوننت پیام قیمت‌گذاری
    const EmptyPricingMessage = () => (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="items-start gap-4">
                <div className="flex gap-2">
                    <AlertCircle className="w-6 h-6 text-orange-600 "/>
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">
                        قیمت‌های مشاوره خود را تعیین کنید.
                    </h3>
                </div>
                <p className="text-orange-700 mb-4 text-justify">
                    برای شروع، لطفاً قیمت‌های مشاوره خود را تعیین کنید تا کاربران بتوانند خدمات شما را رزرو کنند.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full">
                    <Link href="/lawyer-dashboard/pricing">
                        <Button className="bg-green-600 hover:bg-orange-700">
                            <DollarSign className="w-4 h-4 mr-2"/>
                            تعیین قیمت‌های مشاوره
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );

    // کامپوننت خوشامدگویی
    const WelcomeSection = () => (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2">خوش آمدید، وکیل {currentUser.name}!</h1>
                    <p className="opacity-90">پنل مدیریت حرفه‌ای شما</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{todayConsultations.length}</div>
                        <div className="text-sm">مشاوره امروز</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{monthlyIncome.toLocaleString()}</div>
                        <div className="text-sm">درآمد این ماه</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // کامپوننت کارت‌های آماری
    const StatsCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        مشاوره‌های امروز
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{todayConsultations.length}</div>
                    <p className="text-sm text-gray-500 mt-1">
                        {pendingConsultations.length} در انتظار
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        مشتریان فعال
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalClients}</div>
                    <p className="text-sm text-gray-500 mt-1">
                        کل مشتریان
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        زمان‌های خالی
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {workingHoursCount?.hasWorkingHours ? '✓' : '0'}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        این هفته
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        درآمد این ماه
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{monthlyIncome.toLocaleString()}</div>
                    <p className="text-sm text-gray-500 mt-1">
                        تومان
                    </p>
                </CardContent>
            </Card>
        </div>
    );

    // کامپوننت مشاوره‌های اخیر
    const RecentConsultations = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    مشاوره‌های اخیر
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {lawyerDashboard?.recentConsultations && lawyerDashboard.recentConsultations.length > 0 ? (
                    lawyerDashboard.recentConsultations.slice(0, 3).map((consultation) => (
                        <div key={consultation.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <div className="font-medium">{consultation.clientName}</div>
                                <div className="text-sm text-gray-600">
                                    {consultation.date} - {consultation.time}
                                </div>
                                {consultation.subject && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        موضوع: {consultation.subject}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge
                                    variant="secondary"
                                    className={
                                        consultation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            consultation.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                                consultation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                    }
                                >
                                    {consultation.status === 'COMPLETED' ? 'انجام شده' :
                                        consultation.status === 'CONFIRMED' ? 'تایید شده' :
                                            consultation.status === 'PENDING' ? 'در انتظار' : 'لغو شده'}
                                </Badge>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>هیچ مشاوره‌ای یافت نشد</p>
                    </div>
                )}
                {lawyerDashboard?.recentConsultations && lawyerDashboard.recentConsultations.length > 0 && (
                    <Link href="/lawyer-dashboard/consultations">
                        <Button variant="outline" className="w-full">
                            مشاهده همه مشاوره‌ها
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );

    // کامپوننت خدمات اخیر
    const RecentServices = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    سفارشات خدمات اخیر
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {lawyerDashboard?.recentServices && lawyerDashboard.recentServices.length > 0 ? (
                    lawyerDashboard.recentServices.slice(0, 3).map((service) => (
                        <div key={service.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{service.serviceName}</div>
                                <div className="text-sm text-gray-600 mt-1">{service.clientName}</div>
                                {service.description && (
                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {service.description}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                                <Badge
                                    variant="secondary"
                                    className={
                                        service.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            service.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                service.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                    }
                                >
                                    {service.status === 'COMPLETED' ? 'انجام شده' :
                                        service.status === 'IN_PROGRESS' ? 'در حال انجام' :
                                            service.status === 'PENDING' ? 'در انتظار' : 'لغو شده'}
                                </Badge>
                                <div className="text-sm font-medium text-gray-900">
                                    {service.price.toLocaleString()} تومان
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-4">هیچ درخواست خدمتی یافت نشد</p>
                    </div>
                )}
                {lawyerDashboard?.recentServices && lawyerDashboard.recentServices.length > 0 && (
                    <Link href="/lawyer-dashboard/services">
                        <Button variant="outline" className="w-full">
                            مشاهده همه درخواست‌ها
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* بخش خوشامدگویی */}
            <WelcomeSection />

            {/* پیام زمان‌های خالی - فقط زمانی که ساعات کاری ثبت نشده است نمایش داده می‌شود */}
            {workingHoursCount===0 && <EmptyTimeSlotsMessage />}

            {/* پیام قیمت‌گذاری - فقط زمانی که قیمت‌ها تعیین نشده است نمایش داده می‌شود */}
            {pricingCount===0 && <EmptyPricingMessage />}

            {/* کارت‌های آماری */}
            <StatsCards />

            {/* بخش فعالیت‌های اخیر */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentConsultations />
                <RecentServices />
            </div>

            {/* سایر بخش‌ها را برای سادگی کامنت می‌کنیم */}
            {/* <QuestionsWidget />
            <ConsultationPricingManager />
            <LawyerServicesSection />
            <ProfessionalTools /> */}
        </div>
    );
}