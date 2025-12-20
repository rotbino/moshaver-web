// app/lawyer/[id]/page.tsx
'use client';

import { notFound, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Badge } from '@/components/radix/badge';
import { Button } from '@/components/radix/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/radix/tabs';
import {
    MapPin,
    Briefcase,
    Phone,
    Mail,
    Star,
    Eye,
    Clock,
    Award,
    MessageCircle,
    CheckCircle,
    CreditCard,
    Crown, WifiOff, Wifi
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { LawyerList } from '@/lib/api/types';
import TimeSlotSelector from '@/app/lawyer-dashboard/schedule/TimeSlotSelector';
import {useLawyer, useReviews, useQAPairs, useLawyerByUserName, useTimeSlots} from "@/lib/api/useApi";
import {useAuth} from "@/lib/api/useApi";
import ReviewsSection from "@/app/[id]/component/ReviewsSection";
import QandASection from "@/app/[id]/component/QandASection";
import DirectQuestionSection from "@/app/[id]/component/DirectQuestionSection";
import ConsultationPricingTabs from "@/app/[id]/component/ConsultationPricingTabs";

// کامپوننت‌های جدید

interface LawyerDetailPageProps {
    params: Promise<{ id: string }>;
}

interface Service {
    id: string;
    name: string;
    price: number;
}

interface TimeSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

const services: Service[] = [
    { id: "1", name: "تنظیم لایحه", price: 1149000 },
    { id: "2", name: "تنظیم اظهارنامه", price: 749000 },
    { id: "3", name: "تنظیم دادخواست", price: 1459000 },
    { id: "4", name: "تنظیم قرارداد", price: 2449000 },
    { id: "5", name: "بررسی کامل مدارک", price: 615000 },
    { id: "6", name: "بررسی مدارک(تا 3صفحه)", price: 390000 },
    { id: "7", name: "بررسی و تفهیم رای", price: 349000 },
    { id: "8", name: "صلح نامه", price: 2000000 }
];

const consultationOptions = [
    { id: "15min", name: "15 دقیقه", price: 150000 },
    { id: "30min", name: "30 دقیقه", price: 250000 },
    { id: "45min", name: "45 دقیقه", price: 350000 },
    { id: "60min", name: "60 دقیقه", price: 450000 }
];

export default function LawyerDetailPage({ params }: LawyerDetailPageProps) {
    const { id } = React.use(params);
    const router = useRouter();

    // ابتدا وکیل را بر اساس username دریافت می‌کنیم
    const { data: lawyer, isLoading, error } = useLawyerByUserName(id);

    // حالا سایر هوک‌ها را فراخوانی می‌کنیم
    const lawyerId = lawyer?.id || '';
    const { data: timeSlots, refetch } = useTimeSlots(lawyerId);
    const { data: reviews } = useReviews(lawyerId);
    const { data: qaPairs } = useQAPairs(lawyerId);
    const { user, isAuthenticated } = useAuth();

    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [showContactInfo, setShowContactInfo] = useState<boolean>(false);

    // Check if user is a lawyer
    const isLawyer = user?.role === 'lawyer';

    // Check subscription status
    const isSubscriptionActive = lawyer?.subscription ?
        new Date(lawyer.subscription.expiryDate) > new Date() : false;

    useEffect(() => {
        if (lawyerId) {
            refetch();
        }
    }, [lawyerId, refetch]);

// اضافه کردن لاگ برای دیباگ
    useEffect(() => {
        console.log('Lawyer ID:', params);
    }, [params]);
    const toggleService = (serviceId: string) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    const calculateTotal = () => {
        const servicesTotal = selectedServices.reduce((total, serviceId) => {
            const service = services.find(s => s.id === serviceId);
            return total + (service?.price || 0);
        }, 0);

        return servicesTotal;
    };

    const handlePayment = () => {
        if (!isAuthenticated) {
            alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
            router.push('/login');
            return;
        }

        alert(`پرداخت مبلغ ${calculateTotal().toLocaleString()} تومان`);
        setShowContactInfo(true);
    };

    const handleConsultationRequest = () => {
        if (!isAuthenticated) {
            alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
            router.push('/login');
            return;
        }

        router.push(`/${lawyer?.username}/consultation-options`);
    };

    // تابع برای رندر کردن نوار تاج‌ها
    const renderCrownBar = () => {
        const steps = lawyer?.subscription?.steps || 0;
        const totalCrowns = 5;

        return (
            <div className="flex gap-1 justify-between">
                <div className={"flex gap-1 mt-1"}>
                    {Array.from({ length: totalCrowns }).map((_, index) => (
                        <Crown
                            key={index}
                            className={`w-4 h-4 ${
                                index < steps
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                            }`}
                        />
                    ))}
                </div>

                {/* نمایش نشان وکیل ویژه برای پلن یکساله */}
                {isSubscriptionActive && lawyer?.subscription?.isVIP && (
                    <Badge className="bg-yellow-500 text-white text-xs font-medium py-1 px-3  rounded-full">
                        وکیل ویژه
                    </Badge>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca2a30] mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (error || !lawyer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <div className="text-red-500 mb-4">
                            <Award className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">خطا در بارگذاری</h3>
                        <p className="text-gray-600 mb-4">{error?.message || "وکیل مورد نظر یافت نشد"}</p>
                        <Button onClick={() => window.location.reload()} className="bg-[#ca2a30] hover:bg-[#b02529]">
                            تلاش مجدد
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Card */}
                <div className="mb-8 overflow-hidden shadow-lg -mx-4 -mt-8">
                    <div className="relative h-64 bg-gradient-to-r from-red-800 to-red-600">
                        <div className="absolute inset-0 bg-black opacity-20"></div>

                        {/* Back Button - روی عکس */}
                        <Link href="/" className="absolute top-4 left-4 z-10">
                            <Button
                                variant="outline"
                                size="icon"
                                className="bg-white/30 hover:bg-white/50 text-white border-white/50 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-xl transition-all duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                            </Button>
                        </Link>

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                            <div className="flex  gap-4">
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white relative">
                                    <Image
                                        src={lawyer.profileImage}
                                        alt={`${lawyer.name} ${lawyer.lastName}`}
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Online status indicator */}
                                    <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                                        {lawyer.isOnline ? (
                                            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <Wifi className="w-3 h-3 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                                                <WifiOff className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        {lawyer.name} {lawyer.lastName}
                                    </h1>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-white text-red-800 hover:bg-red-50">
                                            {lawyer.specialty}
                                        </Badge>
                                        <div className="flex items-center gap-1 bg-white/80 text-gray-800 px-2 py-1 rounded-full text-sm">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            {lawyer.rating}
                                        </div>
                                        <div className="flex items-center gap-1 bg-white/80 text-gray-800 px-2 py-1 rounded-full text-sm">
                                            <MapPin className="w-4 h-4" />
                                            {lawyer.city}
                                        </div>

                                        {/* Online status badge */}
                                        {lawyer.isOnline ? (
                                            <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                                                <Wifi className="w-4 h-4" />
                                                <span>آنلاین</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 bg-gray-500 text-white px-2 py-1 rounded-full text-sm">
                                                <WifiOff className="w-4 h-4" />
                                                <span>آفلاین</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* نمایش وضعیت اشتراک */}
                                    {isSubscriptionActive && (
                                        <div className="mt-2">
                                            {renderCrownBar()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Me - تمام عرض */}
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-red-600"/>
                                    درباره من
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">
                                    {lawyer.about}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Consultation Card - برای موبایل بالاتر */}
                        <div className="lg:hidden">
                            <ConsultationPricingTabs
                                lawyer={lawyer}
                                onConsultationRequest={handleConsultationRequest}
                            />
                        </div>

                        {/* Services - تمام عرض */}
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-red-600"/>
                                    خدمات و قیمت‌ها
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {services.map(service => (
                                        <div
                                            key={service.id}
                                            onClick={() => toggleService(service.id)}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                selectedServices.includes(service.id)
                                                    ? "border-red-600 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                                        selectedServices.includes(service.id)
                                                            ? "border-red-600 bg-red-600"
                                                            : "border-gray-400"
                                                    }`}>
                                                    {selectedServices.includes(service.id) && (
                                                        <CheckCircle className="w-3 h-3 text-white"/>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">{service.name}</span>
                                                        <span className="text-sm font-medium">
                                                            {service.price.toLocaleString()} تومان
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedServices.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-medium">مجموع:</span>
                                            <span className="text-lg font-bold text-red-800">
                                                {selectedServices.reduce((total, serviceId) => {
                                                    const service = services.find(s => s.id === serviceId);
                                                    return total + (service?.price || 0);
                                                }, 0).toLocaleString()} تومان
                                            </span>
                                        </div>
                                        <Button
                                            onClick={handlePayment}
                                            className="w-full bg-red-600 hover:bg-red-800"
                                        >
                                            پرداخت و دریافت اطلاعات تماس
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        {showContactInfo && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-red-600"/>
                                        اطلاعات تماس
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-red-600"/>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">شماره تماس</div>
                                            <div className="font-medium">{lawyer.mobile}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-red-600"/>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">شماره همراه</div>
                                            <div className="font-medium">{lawyer.mobile}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-red-600"/>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">آدرس دفتر</div>
                                            <div className="font-medium">{lawyer.address}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-red-600" />
                                    آمار پروفایل
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="text-gray-600">وضعیت</div>
                                    <div className="font-medium flex items-center gap-1">
                                        {lawyer.isOnline ? (
                                            <>
                                                <Wifi className="w-4 h-4 text-green-500" />
                                                <span className="text-green-500">آنلاین</span>
                                            </>
                                        ) : (
                                            <>
                                                <WifiOff className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-500">آفلاین</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-gray-600">تعداد بازدید</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        {lawyer.views.toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-gray-600">سابقه کاری</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {lawyer.experience} سال
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-gray-600">امتیاز</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        {lawyer.rating}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Consultation Card - برای دسکتاپ */}
                        <Card className="hidden lg:block">
                            <ConsultationPricingTabs
                                lawyer={lawyer}
                                onConsultationRequest={handleConsultationRequest}
                            />
                        </Card>
                    </div>
                </div>

                {/* Time Slot Selection - Full width at the bottom */}
                {!isLawyer && (
                    <div className="mt-8">
                        <TimeSlotSelector
                            lawyerId={lawyer.id}
                            timeSlots={timeSlots || []}
                            onTimeSlotSelect={setSelectedTimeSlot}
                            selectedTimeSlot={selectedTimeSlot}
                            title={"زمانهای مشاوره وکیل"}
                        />
                    </div>
                )}

                {/* Reviews and Q&A - تمام عرض */}
                <Card className="lg:col-span-3 mt-4 p-4 sm:p-6">
                    <Tabs defaultValue="reviews" className="w-full">
                        <TabsList className="grid grid-cols-3 w-full gap-2 p-1 sm:p-0 mb-4 sm:mb-6">
                            <TabsTrigger
                                value="reviews"
                                className="w-full flex justify-center whitespace-nowrap text-sm sm:text-base px-3 py-2 data-[state=active]:bg-red-700 data-[state=active]:text-white"
                            >
                                نظرات
                            </TabsTrigger>
                            <TabsTrigger
                                value="qa"
                                className="w-full flex justify-center whitespace-nowrap text-sm sm:text-base px-3 py-2 data-[state=active]:bg-red-700 data-[state=active]:text-white"
                            >
                                سوالات
                            </TabsTrigger>
                            <TabsTrigger
                                value="direct-question"
                                className="w-full flex justify-center whitespace-nowrap text-sm sm:text-base px-3 py-2 data-[state=active]:bg-red-700 data-[state=active]:text-white"
                            >
                                پرسیدن سوال
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="reviews" className="mt-4 sm:mt-6">
                            <ReviewsSection reviews={reviews || []} />
                        </TabsContent>
                        <TabsContent value="qa" className="mt-4 sm:mt-6">
                            <QandASection qaPairs={qaPairs || []} />
                        </TabsContent>
                        <TabsContent value="direct-question" className="mt-4 sm:mt-6">
                            <DirectQuestionSection lawyer={lawyer} />
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}