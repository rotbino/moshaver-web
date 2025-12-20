// app/[id]/consultation-options/page.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { ArrowRight, ArrowLeft, Clock, User, Phone, Video, Wifi, WifiOff } from "lucide-react";
import { useConsultationOptions, useAuth, useLawyer } from "@/lib/api/useApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/radix/tabs";

interface ConsultationOption {
    id: string;
    name: string;
    inPersonPrice: number;
    phonePrice: number;
    videoPrice: number;
}

const consultationTypes = [
    { id: 'in-person', name: 'حضوری', icon: User, color: 'bg-blue-100 text-blue-800' },
    { id: 'phone', name: 'تلفنی', icon: Phone, color: 'bg-green-100 text-green-800' },
    { id: 'video', name: 'تماس ویدئویی', icon: Video, color: 'bg-purple-100 text-purple-800' }
];

export default function ConsultationOptionsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: lawyerId } = React.use(params);
    const [selectedOption, setSelectedOption] = useState<ConsultationOption | null>(null);
    const [selectedType, setSelectedType] = useState<'in-person' | 'phone' | 'video'>('in-person');
    const swiperRef = useRef<any>(null);

    const { data: lawyer, isLoading: lawyerLoading } = useLawyer(lawyerId);
    const { data: consultationOptions = [], isLoading: optionsLoading } = useConsultationOptions(lawyerId);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (!lawyerLoading && !lawyer) {
            router.push("/");
        }
    }, [lawyer, lawyerLoading, router]);

    useEffect(() => {
        if (!isAuthenticated && consultationOptions.length > 0) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            router.push('/login');
        }
    }, [isAuthenticated, consultationOptions, router]);

    // تنظیم گزینه پیش‌فرض هنگام بارگذاری داده‌ها
    useEffect(() => {
        if (consultationOptions.length > 0 && !selectedOption) {
            setSelectedOption(consultationOptions[0]);
        }
    }, [consultationOptions, selectedOption]);

    // به‌روزرسانی گزینه انتخاب شده هنگام تغییر نوع مشاوره
    useEffect(() => {
        if (consultationOptions.length > 0) {
            // اگر گزینه انتخاب شده وجود ندارد یا برای نوع مشاوره فعلی نیست، گزینه پیش‌فرض را انتخاب کن
            if (!selectedOption || !isOptionForCurrentType(selectedOption, selectedType)) {
                setSelectedOption(consultationOptions[0]);
                // اگر سوئیپر وجود دارد، به اولین اسلاید برو
                if (swiperRef.current) {
                    swiperRef.current.slideTo(0);
                }
            }
        }
    }, [selectedType, consultationOptions]);

    // تابع کمکی برای بررسی اینکه آیا گزینه برای نوع مشاوره فعلی است
    const isOptionForCurrentType = (option: ConsultationOption, type: string) => {
        // در اینجا می‌توانیم منطق پیچیده‌تری اضافه کنیم اگر نیاز باشد
        return true; // در حال حاضر همه گزینه‌ها برای همه انواع مشاوره معتبر هستند
    };

    const handleNext = () => {
        if (!selectedOption) {
            alert("لطفاً یک مدت زمان برای مشاوره انتخاب کنید");
            return;
        }

        if (!isAuthenticated) {
            alert("لطفاً ابتدا وارد حساب کاربری خود شوید");
            router.push('/login');
            return;
        }

        localStorage.setItem('selectedConsultationType', selectedType);
        router.push(`/${lawyerId}/booking?consultation=${selectedOption.id}`);
    };

    const handleBack = () => {
        router.push(`/${lawyerId}`);
    };

    // مدیریت تغییر اسلاید با سوئپ
    const handleSlideChange = (swiper: any) => {
        const activeIndex = swiper.activeIndex;
        if (consultationOptions[activeIndex]) {
            setSelectedOption(consultationOptions[activeIndex]);
        }
    };

    // مدیریت کلیک روی گزینه
    const handleOptionClick = (option: ConsultationOption, index: number) => {
        setSelectedOption(option);
        if (swiperRef.current) {
            swiperRef.current.slideTo(index);
        }
    };

    // مدیریت تغییر تب
    const handleTabChange = (value: string) => {
        const newType = value as 'in-person' | 'phone' | 'video';
        setSelectedType(newType);

        // تنظیم گزینه پیش‌فرض برای تب جدید
        if (consultationOptions.length > 0) {
            setSelectedOption(consultationOptions[0]);
            // اگر سوئیپر وجود دارد، به اولین اسلاید برو
            if (swiperRef.current) {
                swiperRef.current.slideTo(0);
            }
        }
    };

    if (!lawyerId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">خطا در بارگذاری</h2>
                    <p className="text-gray-600 mb-4">شناسه وکیل یافت نشد</p>
                    <Button onClick={() => router.push('/')} className="bg-[#ca2a30] hover:bg-[#b02529]">
                        بازگشت به صفحه اصلی
                    </Button>
                </div>
            </div>
        );
    }

    if (lawyerLoading || optionsLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca2a30] mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (!lawyer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">اطلاعات یافت نشد</h2>
                    <Button onClick={() => router.push('/')} className="bg-[#ca2a30] hover:bg-[#b02529]">
                        بازگشت به صفحه اصلی
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-3">

                    <Card>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-orange-500"/>
                                </div>
                                <div>
                                    <div className={"flex gap-2"}>
                                        <div className="font-bold">{lawyer.name} {lawyer.lastName}</div>
                                        {lawyer.isOnline && (
                                            <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
                                                <Wifi className="w-3 h-3" />
                                                وکیل آنلاین است
                                            </Badge>
                                        ) }
                                    </div>

                                    <div className="text-sm text-gray-600">{lawyer.specialty}</div>

                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* انتخاب نوع و مدت زمان مشاوره در یک باکس یکپارچه */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-500"/>
                                    انتخاب نوع و مدت زمان مشاوره
                                    {!lawyer.isOnline && (
                                        <Badge className="bg-gray-500 text-white text-xs flex items-center gap-1">
                                            <WifiOff className="w-3 h-3" />
                                            وکیل آفلاین است
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="in-person" className="w-full" onValueChange={handleTabChange}>
                                    <TabsList className="grid grid-cols-3 w-full mb-4">
                                        {consultationTypes.map(type => (
                                            <TabsTrigger
                                                key={type.id}
                                                value={type.id}
                                                className="flex items-center gap-1 text-xs"
                                            >
                                                {type.name}
                                                <type.icon className="w-4 h-4"/>
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    {consultationTypes.map(type => (
                                        <TabsContent key={type.id} value={type.id} className="space-y-3">
                                            <Swiper
                                                ref={swiperRef}
                                                modules={[Navigation, Pagination]}
                                                spaceBetween={10}
                                                slidesPerView={1}
                                                navigation
                                                className="py-4"
                                                onSlideChange={handleSlideChange}
                                                onSwiper={(swiper) => (swiperRef.current = swiper)}
                                            >
                                                {consultationOptions.map((option, index) => {
                                                    const price = type.id === 'in-person' ? option.inPersonPrice :
                                                        type.id === 'phone' ? option.phonePrice :
                                                            option.videoPrice;

                                                    return (
                                                        <SwiperSlide key={option.id}>
                                                            <div
                                                                onClick={() => {
                                                                    setSelectedOption(option);
                                                                    if (swiperRef.current) {
                                                                        swiperRef.current.slideTo(index);
                                                                    }
                                                                }}
                                                                className={`p-5 border-2 rounded-lg cursor-pointer transition-all h-full ${
                                                                    selectedOption?.id === option.id && selectedType === type.id
                                                                        ? "border-orange-500 bg-orange-50 shadow-md"
                                                                        : "border-gray-200 hover:border-gray-300"
                                                                }`}
                                                            >
                                                                <div className="text-center">
                                                                    <div className="font-medium text-lg mb-2">{option.name}</div>
                                                                    <div className="text-2xl font-bold text-orange-600 mb-2">
                                                                        {price.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        تومان
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </SwiperSlide>
                                                    );
                                                })}
                                            </Swiper>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Selected Option Info */}
                        {selectedOption && (
                            <Card className="border-orange-200 bg-orange-50 mt-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-orange-500"/>
                                        گزینه انتخاب شده
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">نوع مشاوره</span>
                                        <Badge className={
                                            selectedType === 'in-person' ? 'bg-blue-100 text-blue-800' :
                                                selectedType === 'phone' ? 'bg-green-100 text-green-800' :
                                                    'bg-purple-100 text-purple-800'
                                        }>
                                            {consultationTypes.find(t => t.id === selectedType)?.name}
                                        </Badge>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">مدت زمان</span>
                                        <Badge className="bg-orange-100 text-orange-800">
                                            {selectedOption.name}
                                        </Badge>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">هزینه</span>
                                        <span className="font-bold text-lg">
                                            {selectedType === 'in-person' ? selectedOption.inPersonPrice.toLocaleString() :
                                                selectedType === 'phone' ? selectedOption.phonePrice.toLocaleString() :
                                                    selectedOption.videoPrice.toLocaleString()} تومان
                                        </span>
                                    </div>

                                    <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                                        <div className="text-sm text-orange-800">
                                            <span className="font-medium">نوع مشاوره: </span>{consultationTypes.find(t => t.id === selectedType)?.name.toLowerCase()}
                                            {selectedType === 'in-person' ? ' (در دفتر وکیل)' :
                                                selectedType === 'phone' ? ' (از طریق تماس تلفنی)' :
                                                    ' (از طریق واتساپ)'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Authentication Warning */}
                        {!isAuthenticated && (
                            <Card className="border-orange-200 bg-orange-50">
                                <CardContent className="p-4">
                                    <p className="text-orange-800 text-sm">
                                        برای رزرو مشاوره، لطفاً ابتدا وارد حساب کاربری خود شوید.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleNext}
                                disabled={!selectedOption || !isAuthenticated}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
                            >
                                <ArrowRight className="w-4 h-4"/>
                                ادامه
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex-1 flex items-center gap-2"
                            >
                                بازگشت
                                <ArrowLeft className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}