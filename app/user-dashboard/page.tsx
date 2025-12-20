"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import {
    Calendar,
    FileText,
    Star,
    Ticket,
    User,
    BarChart3,
    Clock,
    Phone,
    Video,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    X
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/api/useApi";

export default function UserDashboardPage() {
    const { user: currentUser, isAuthenticated } = useAuth();

    if (!isAuthenticated || !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca2a30]"></div>
            </div>
        );
    }

    // محاسبه آمار مشاوره‌ها
    const todayConsultations = currentUser.consultations?.filter(c =>
        c.date === new Date().toISOString().split('T')[0]
    ) || [];

    const completedConsultations = currentUser.consultations?.filter(c =>
        c.status === 'completed'
    ) || [];

    const pendingConsultations = currentUser.consultations?.filter(c =>
        c.status === 'pending' || c.status === 'confirmed'
    ) || [];

    // محاسبه آمار خدمات
    const activeServices = currentUser.services?.filter(s =>
        s.status === 'in-progress'
    ) || [];

    const completedServices = currentUser.services?.filter(s =>
        s.status === 'completed'
    ) || [];

    // محاسبه مشاوره بعدی
    const nextConsultation = currentUser.consultations && currentUser.consultations.length > 0
        ? currentUser.consultations
            .filter(c => c.status === 'confirmed' || c.status === 'pending')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
        : null;

    // کامپوننت خوشامدگویی و مشاوره بعدی
    const NextConsultationSection = () => {
        if (!nextConsultation) {
            return (
                <div className="bg-gradient-to-r from-[#ca2a30] to-[#b02529] rounded-lg p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">خوش آمدید، {currentUser.name}!</h1>
                            <p className="opacity-90">شما در حال حاضر هیچ مشاوره رزرو شده‌ای ندارید.</p>
                        </div>
                        <Link href="/app/lawyers">
                            <Button className="bg-white text-[#ca2a30] hover:bg-gray-100">
                                مشاهده وکلا
                            </Button>
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-gradient-to-r from-[#ca2a30] to-[#b02529] rounded-lg p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">خوش آمدید، {currentUser.name}!</h1>
                        <p className="opacity-90 mb-4">مشاوره بعدی شما:</p>

                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-5 h-5" />
                                <span className="font-medium">مشاوره بعدی شما</span>
                            </div>
                            <div className="text-lg font-bold mb-1">
                                {nextConsultation.date} ساعت {nextConsultation.time}
                            </div>
                            <div className="text-sm opacity-90 mb-3">
                                مدت: {nextConsultation.duration} |
                                موضوع: {nextConsultation.subject || "مشاوره حقوقی"}
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" className="bg-white text-[#ca2a30] hover:bg-gray-100">
                                    <Phone className="w-4 h-4 ml-1" />
                                    تماس
                                </Button>
                                <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10">
                                    <Video className="w-4 h-4 ml-1" />
                                    جلسه آنلاین
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // کامپوننت کارت‌های آماری
    const StatsCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        مشاوره‌های من
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentUser.consultations?.length || 0}</div>
                    <p className="text-sm text-gray-500 mt-1">
                        {completedConsultations.length} انجام شده
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        درخواست‌های خدمات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentUser.services?.length || 0}</div>
                    <p className="text-sm text-gray-500 mt-1">
                        {completedServices.length} انجام شده
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        وکیل های نشان شده
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{currentUser.favorites?.length || 0}</div>
                    <p className="text-sm text-gray-500 mt-1">
                        وکلای مورد علاقه
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
                    <Calendar className="w-5 h-5 text-[#ca2a30]" />
                    مشاوره‌های دریافتی
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentUser.consultations && currentUser.consultations.length > 0 ? (
                    currentUser.consultations.slice(0, 3).map((consultation) => (
                        <div key={consultation.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <div className="font-medium">{consultation.lawyerName}</div>
                                <div className="text-sm text-gray-600">
                                    {consultation.date} - {consultation.time} ({consultation.duration})
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
                                        consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            consultation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                    }
                                >
                                    {consultation.status === 'completed' ? 'انجام شده' :
                                        consultation.status === 'confirmed' ? 'تایید شده' :
                                            consultation.status === 'pending' ? 'در انتظار' : 'لغو شده'}
                                </Badge>
                                <div className="text-sm font-medium">
                                    {consultation.price.toLocaleString()} تومان
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>شما تا کنون از هیچ وکیلی مشاوره نگرفته اید</p>
                        <Link href="/app/lawyers" className="mt-4 inline-block">
                            <Button className="bg-[#ca2a30] hover:bg-[#b02529]">
                                مشاهده وکلا
                            </Button>
                        </Link>
                    </div>
                )}
                {currentUser.consultations && currentUser.consultations.length > 0 && (
                    <Link href="/user-dashboard/consultations">
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
                    <FileText className="w-5 h-5 text-[#ca2a30]" />
                    درخواست‌های خدمات دریافتی
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentUser.services && currentUser.services.length > 0 ? (
                    currentUser.services.slice(0, 3).map((service) => (
                        <div key={service.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{service.serviceName}</div>
                                <div className="text-sm text-gray-600 mt-1">{service.lawyerName}</div>
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
                                        service.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            service.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                    }
                                >
                                    {service.status === 'completed' ? 'انجام شده' :
                                        service.status === 'in-progress' ? 'در حال انجام' :
                                            service.status === 'pending' ? 'در انتظار' : 'لغو شده'}
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
                        <p className="text-gray-500 mb-4">شما تا کنون هیچ خدمتی از وکلا دریافت نکرده اید</p>
                        <Link href="/app/lawyers" className="inline-block">
                            <Button className="bg-[#ca2a30] hover:bg-[#b02529]">
                                مشاهده وکلا
                            </Button>
                        </Link>
                    </div>
                )}
                {currentUser.services && currentUser.services.length > 0 && (
                    <Link href="/user-dashboard/services">
                        <Button variant="outline" className="w-full">
                            مشاهده همه درخواست‌ها
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );

    // کامپوننت علاقه‌مندی‌ها
    const FavoritesSection = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#ca2a30]" />
                    وکیل‌های نشان شده
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentUser.favorites && currentUser.favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentUser.favorites.slice(0, 4).map((favorite) => (
                            <div key={favorite.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <div className="font-medium">{favorite.lawyerName}</div>
                                    <div className="text-sm text-gray-600">{favorite.lawyerSpecialty}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>شما هنوز وکیلی را به علاقه‌مندی‌های خود اضافه نکرده اید.</p>
                        <Link href="/app/lawyers" className="mt-4 inline-block">
                            <Button className="bg-[#ca2a30] hover:bg-[#b02529]">
                                مشاهده وکلا
                            </Button>
                        </Link>
                    </div>
                )}
                {currentUser.favorites && currentUser.favorites.length > 0 && (
                    <Link href="/user-dashboard/favorites">
                        <Button variant="outline" className="w-full">
                            مشاهده همه علاقه‌مندی‌ها
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* بخش خوشامدگویی و مشاوره بعدی */}
            <NextConsultationSection />

            {/* کارت‌های آماری */}
            <StatsCards />

            {/* بخش فعالیت‌های اخیر */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentConsultations />
                <RecentServices />
            </div>

            {/* بخش علاقه‌مندی‌ها */}
            <FavoritesSection />
        </div>
    );
}