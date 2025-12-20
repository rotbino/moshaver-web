"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Badge } from "@/components/radix/badge";
import { ArrowRight, ArrowLeft, Clock, User, Calendar, Phone, Video } from "lucide-react";
import TimeSlotSelector from "@/app/lawyer-dashboard/schedule/TimeSlotSelector";
import { useTimeSlots, useConsultationOptions, useCreateBooking, useAuth, useLawyer } from "@/lib/api/useApi";
import { formatDate } from "@/lib/utils";
import { Button } from '@/components/radix/button';

interface TimeSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

interface ConsultationOption {
    id: string;
    name: string;
    inPersonPrice: number;
    phonePrice: number;
    videoPrice: number;
}

export default function ConsultationBookingPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lawyerId = params.id;
    const consultationId = searchParams.get("consultation") || "";

    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [selectedConsultationType, setSelectedConsultationType] = useState<'in-person' | 'phone' | 'video'>('in-person');

    // Fetch data using hooks
    const { data: lawyer, isLoading: lawyerLoading } = useLawyer(lawyerId);
    const { data: timeSlots = [] } = useTimeSlots(lawyerId);
    const { data: consultationOptions = [] } = useConsultationOptions();
    const { isAuthenticated, user } = useAuth();
    const createBookingMutation = useCreateBooking();

    const selectedConsultation = consultationOptions.find(c => c.id === consultationId);

    // Redirect if lawyer or consultation not found
    useEffect(() => {
        if (consultationOptions.length > 0 && consultationId && !selectedConsultation) {
            router.push(`/${lawyerId}`);
        }
    }, [selectedConsultation, consultationOptions, consultationId, lawyerId, router]);

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated && consultationOptions.length > 0) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            router.push('/login');
        }
    }, [isAuthenticated, consultationOptions, router]);

    // بازیابی نوع مشاوره از localStorage
    useEffect(() => {
        const savedType = localStorage.getItem('selectedConsultationType');
        if (savedType) {
            setSelectedConsultationType(savedType as 'in-person' | 'phone' | 'video');
        }
    }, []);

    const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
        setSelectedTimeSlot(timeSlot);
    };

    const handleNext = async () => {
        if (!selectedTimeSlot) {
            alert("لطفاً یک زمان برای مشاوره انتخاب کنید");
            return;
        }

        if (!isAuthenticated) {
            alert("لطفاً ابتدا وارد حساب کاربری خود شوید");
            router.push('/login');
            return;
        }

        try {
            // محاسبه قیمت بر اساس نوع مشاوره
            const consultationPrice = selectedConsultationType === 'in-person' ? selectedConsultation?.inPersonPrice :
                selectedConsultationType === 'phone' ? selectedConsultation?.phonePrice :
                    selectedConsultation?.videoPrice;

            const bookingData = {
                lawyerId,
                lawyerName: lawyer?.name + " " + lawyer?.lastName,
                consultationId,
                consultationName: selectedConsultation?.name,
                consultationType: selectedConsultationType,
                consultationPrice: consultationPrice || 0,
                timeSlot: selectedTimeSlot,
                userId: user?.id,
                userName: user?.name + " " + user?.lastName
            };

            await createBookingMutation.mutateAsync(bookingData);
            router.push(`/${lawyerId}/confirmation`);
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('خطا در ایجاد رزرو. لطفاً دوباره تلاش کنید.');
        }
    };

    const handleBack = () => {
        router.push(`/${lawyerId}/consultation-options?consultation=${consultationId}`);
    };

    // Loading states
    if (lawyerLoading || consultationOptions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca2a30] mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (!lawyer || !selectedConsultation) {
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

    // محاسبه قیمت بر اساس نوع مشاوره
    const consultationPrice = selectedConsultationType === 'in-person' ? selectedConsultation.inPersonPrice :
        selectedConsultationType === 'phone' ? selectedConsultation.phonePrice :
            selectedConsultation.videoPrice;

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">رزرو مشاوره</h1>
                    <p className="text-gray-600 mt-2">لطفاً زمان مورد نظر خود را برای مشاوره انتخاب کنید</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <TimeSlotSelector
                            lawyerId={lawyerId}
                            timeSlots={timeSlots}
                            onTimeSlotSelect={handleTimeSlotSelect}
                            selectedTimeSlot={selectedTimeSlot}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Lawyer Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-orange-500" />
                                    اطلاعات وکیل
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                        <User className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{lawyer.name} {lawyer.lastName}</div>
                                        <div className="text-sm text-gray-600">{lawyer.specialty}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Consultation Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    اطلاعات مشاوره
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">نوع مشاوره</span>
                                    <Badge className={getConsultationTypeColor(selectedConsultationType)}>
                                        {getConsultationTypeLabel(selectedConsultationType)}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">مدت زمان</span>
                                    <Badge className="bg-orange-100 text-orange-800">
                                        {selectedConsultation.name}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">هزینه</span>
                                    <span className="font-bold">
                                        {consultationPrice.toLocaleString()} تومان
                                    </span>
                                </div>

                                {selectedTimeSlot && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">تاریخ</span>
                                            <span className="font-medium">{formatDate(selectedTimeSlot.date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">ساعت</span>
                                            <span className="font-medium">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

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
                                disabled={!selectedTimeSlot || createBookingMutation.isPending || !isAuthenticated}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
                            >
                                <ArrowRight className="w-4 h-4" />
                                {createBookingMutation.isPending ? "در حال پردازش..." : "ادامه"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex-1 flex items-center gap-2"
                            >
                                بازگشت
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}