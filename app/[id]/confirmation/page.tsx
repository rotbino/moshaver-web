"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { ArrowRight, ArrowLeft, Clock, User, Calendar, CreditCard, Phone, Video } from "lucide-react";
import { useAuth } from "@/lib/api/useApi";

interface BookingData {
    lawyerId: string;
    lawyerName: string;
    consultationId: string;
    consultationName: string;
    consultationType: 'in-person' | 'phone' | 'video';
    consultationPrice: number;
    timeSlot: {
        id: string;
        date: string;
        startTime: string;
        endTime: string;
    };
    userId?: string;
    userName?: string;
}

export default function ConsultationConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: lawyerId } = React.use(params);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const storedData = localStorage.getItem('consultationBooking');
        if (storedData) {
            const data = JSON.parse(storedData);
            setBookingData(data);
        } else {
            router.push(`/${lawyerId}`);
        }
    }, [lawyerId, router]);

    const handleBack = () => {
        router.push(`/${lawyerId}/booking?consultation=${bookingData?.consultationId}`);
    };

    const handlePayment = () => {
        setIsSubmitting(true);

        // شبیه‌سازی پرداخت
        setTimeout(() => {
            router.push(`/${lawyerId}/invoice`);
        }, 1500);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Intl.DateTimeFormat('fa-IR', options).format(date);
    };

    const getConsultationTypeLabel = (type: string) => {
        switch (type) {
            case 'in-person': return 'حضوری';
            case 'phone': return 'تلفنی';
            case 'video': return 'تماس ویدئویی';
            default: return type;
        }
    };

    const getConsultationTypeColor = (type: string) => {
        switch (type) {
            case 'in-person': return 'bg-blue-100 text-blue-800';
            case 'phone': return 'bg-green-100 text-green-800';
            case 'video': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getConsultationTypeIcon = (type: string) => {
        switch (type) {
            case 'in-person': return <User className="w-4 h-4" />;
            case 'phone': return <Phone className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (!bookingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca2a30] mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">تایید رزرو مشاوره</h1>
                    <p className="text-gray-600 mt-2">لطفاً اطلاعات رزرو خود را بررسی و تایید کنید</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-500" />
                                    خلاصه رزرو
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Lawyer Info */}
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                                        <User className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{bookingData.lawyerName}</div>
                                        <div className="text-gray-600">وکیل پایه یک دادگستری</div>
                                    </div>
                                </div>

                                {/* User Info */}
                                {bookingData.userName && (
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{bookingData.userName}</div>
                                            <div className="text-gray-600">مشتری</div>
                                        </div>
                                    </div>
                                )}

                                {/* Consultation Details */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg">جزئیات مشاوره</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 border rounded-lg">
                                            <div className="text-sm text-gray-600 mb-1">نوع مشاوره</div>
                                            <div className="flex items-center gap-2">
                                                {getConsultationTypeIcon(bookingData.consultationType)}
                                                <Badge className={getConsultationTypeColor(bookingData.consultationType)}>
                                                    {getConsultationTypeLabel(bookingData.consultationType)}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-3 border rounded-lg">
                                            <div className="text-sm text-gray-600 mb-1">مدت زمان</div>
                                            <div className="font-medium">{bookingData.consultationName}</div>
                                        </div>

                                        <div className="p-3 border rounded-lg">
                                            <div className="text-sm text-gray-600 mb-1">هزینه</div>
                                            <div className="font-medium">{bookingData.consultationPrice.toLocaleString()} تومان</div>
                                        </div>

                                        <div className="p-3 border rounded-lg">
                                            <div className="text-sm text-gray-600 mb-1">تاریخ</div>
                                            <div className="font-medium">{formatDate(bookingData.timeSlot.date)}</div>
                                        </div>

                                        <div className="p-3 border rounded-lg col-span-2">
                                            <div className="text-sm text-gray-600 mb-1">ساعت</div>
                                            <div className="font-medium">{bookingData.timeSlot.startTime} - {bookingData.timeSlot.endTime}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">مبلغ کل</span>
                                        <span className="font-bold text-lg">{bookingData.consultationPrice.toLocaleString()} تومان</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        هزینه مشاوره {getConsultationTypeLabel(bookingData.consultationType)} {bookingData.consultationName} با وکیل {bookingData.lawyerName}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-orange-500" />
                                    پرداخت
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600 mb-2">
                                        {bookingData.consultationPrice.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">تومان</div>
                                </div>

                                <Button
                                    onClick={handlePayment}
                                    disabled={isSubmitting}
                                    className="w-full bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
                                >
                                    {isSubmitting ? "در حال پردازش..." : "پرداخت و نهایی کردن رزرو"}
                                </Button>

                                <div className="text-xs text-gray-500 text-center">
                                    با کلیک روی دکمه پرداخت، به درگاه بانک هدایت می‌شوید
                                </div>
                            </CardContent>
                        </Card>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex-1 flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                بازگشت
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}