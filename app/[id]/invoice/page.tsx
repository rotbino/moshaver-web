"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { CheckCircle, Download, Home, User, Calendar, Clock, CreditCard, Phone, Video } from "lucide-react";
import { useAuth } from "@/lib/api/useApi";
import { toast } from "@/lib/hooks/app-toast";

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

export default function ConsultationInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: lawyerId } = React.use(params);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState<string>("");
    const { user } = useAuth();

    useEffect(() => {
        const storedData = localStorage.getItem('consultationBooking');
        if (storedData) {
            const data = JSON.parse(storedData);
            setBookingData(data);

            // ایجاد شماره فاکتور
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
            const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            setInvoiceNumber(`INV-${dateStr}-${randomStr}`);
        } else {
            router.push(`/${lawyerId}`);
        }
    }, [lawyerId, router]);

    const handleDownload = () => {
        toast.warning("درخواست نامعتبر", "درخواست شما نامعتبر است.");
    };

    const handleBackToHome = () => {
        localStorage.removeItem('consultationBooking');
        toast.success("به پنل کاربری هدایت شدید");
        router.push("/user-dashboard");
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

    const formatInvoiceDate = () => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Intl.DateTimeFormat('fa-IR', options).format(now);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Success Message */}
                <div className="mb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">پرداخت موفقیت‌آمیز بود</h1>
                    <p className="text-gray-600 mt-2">رزرو مشاوره شما با موفقیت انجام شد</p>
                </div>

                {/* Invoice Card */}
                <Card className="mb-8 shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-orange-500" />
                                فاکتور مشاوره
                            </span>
                            <Badge className="bg-green-100 text-green-800 self-start sm:self-auto">
                                پرداخت شده
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Invoice Header */}
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 pb-4 border-b">
                            <div>
                                <div className="font-bold text-lg">فاکتور رسمی</div>
                                <div className="text-gray-600 text-sm">شماره فاکتور: {invoiceNumber}</div>
                                <div className="text-gray-600 text-sm">تاریخ صدور: {formatInvoiceDate()}</div>
                            </div>
                            <div className="text-right sm:text-left">
                                <div className="font-bold text-lg">وکیل یاب</div>
                                <div className="text-gray-600 text-sm">پلتفرم ارتباط با بهترین وکلا</div>
                            </div>
                        </div>

                        {/* Invoice Details */}
                        <div className="space-y-6">
                            {/* Lawyer Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold mb-3 text-orange-600">اطلاعات وکیل</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                        <User className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{bookingData.lawyerName}</div>
                                        <div className="text-sm text-gray-600">وکیل پایه یک دادگستری</div>
                                    </div>
                                </div>
                            </div>

                            {/* User Info */}
                            {bookingData.userName && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-bold mb-3 text-blue-600">اطلاعات مشتری</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{bookingData.userName}</div>
                                            <div className="text-sm text-gray-600">مشتری</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Consultation Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold mb-3 text-orange-600">اطلاعات مشاوره</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            {getConsultationTypeIcon(bookingData.consultationType)}
                                        </div>
                                        <div>
                                            <div className="font-medium">نوع مشاوره</div>
                                            <Badge className={getConsultationTypeColor(bookingData.consultationType)}>
                                                {getConsultationTypeLabel(bookingData.consultationType)}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium">مدت زمان</div>
                                            <div>{bookingData.consultationName}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium">تاریخ</div>
                                            <div>{formatDate(bookingData.timeSlot.date)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium">ساعت</div>
                                            <div>{bookingData.timeSlot.startTime} - {bookingData.timeSlot.endTime}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">هزینه مشاوره</span>
                                <span className="font-medium">{bookingData.consultationPrice.toLocaleString()} تومان</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">مالیات (0%)</span>
                                <span className="font-medium">0 تومان</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg pt-3 border-t border-orange-200">
                                <span>مبلغ کل</span>
                                <span className="text-orange-600">{bookingData.consultationPrice.toLocaleString()} تومان</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <Button
                        variant="outline"
                        onClick={handleDownload}
                        className="flex items-center gap-2 h-12"
                    >
                        <Download className="w-4 h-4" />
                        دانلود فاکتور
                    </Button>
                    <Button
                        onClick={handleBackToHome}
                        className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2 h-12"
                    >
                        <Home className="w-4 h-4" />
                        مشاهده رزرو در پنل
                    </Button>
                </div>
            </div>
        </div>
    );
}