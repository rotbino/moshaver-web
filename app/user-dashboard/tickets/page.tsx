"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Badge } from "@/components/radix/badge";
import { Button } from "@/components/radix/button";
import {
    Ticket,
    Calendar,
    Clock,
    User,
    Phone,
    Video,
    FileText,
    CheckCircle,
    AlertCircle,
    X
} from "lucide-react";
import { useAuth } from "@/lib/api/useApi";

export default function UserTicketsPage() {
    const { user: currentUser } = useAuth();

    // محاسبه مشاوره‌های آینده
    const upcomingConsultations = currentUser?.consultations?.filter(c =>
        c.status === 'confirmed' || c.status === 'pending'
    ) || [];

    // محاسبه مشاوره‌های گذشته
    const pastConsultations = currentUser?.consultations?.filter(c =>
        c.status === 'completed' || c.status === 'cancelled'
    ) || [];

    // کامپوننت کارت مشاوره
    const ConsultationCard = ({ consultation }: { consultation: any }) => (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="font-medium">{consultation.lawyerName}</div>
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
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {consultation.date}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {consultation.time} ({consultation.duration})
                            </div>
                        </div>

                        {consultation.subject && (
                            <div className="text-sm text-gray-700 mb-3">
                                موضوع: {consultation.subject}
                            </div>
                        )}

                        <div className="text-lg font-bold text-[#ca2a30]">
                            {consultation.price.toLocaleString()} تومان
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {consultation.status === 'confirmed' || consultation.status === 'pending' ? (
                            <>
                                <Button size="sm" className="bg-[#ca2a30] hover:bg-[#b02529]">
                                    <Phone className="w-4 h-4 ml-1" />
                                    تماس
                                </Button>
                                <Button size="sm" variant="outline">
                                    <Video className="w-4 h-4 ml-1" />
                                    جلسه آنلاین
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" variant="outline">
                                <FileText className="w-4 h-4 ml-1" />
                                مشاهده جزئیات
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">بلیط‌های من</h1>
                <div className="text-sm text-gray-600">
                    {currentUser?.consultations?.length || 0} مشاوره
                </div>
            </div>

            {/* مشاوره‌های آینده */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#ca2a30]" />
                        مشاوره‌های آینده
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {upcomingConsultations.length > 0 ? (
                        upcomingConsultations.map(consultation => (
                            <ConsultationCard key={consultation.id} consultation={consultation} />
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>شما هیچ مشاوره آینده‌ای ندارید</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* مشاوره‌های گذشته */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        مشاوره‌های گذشته
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pastConsultations.length > 0 ? (
                        pastConsultations.map(consultation => (
                            <ConsultationCard key={consultation.id} consultation={consultation} />
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>شما هیچ مشاوره گذشته‌ای ندارید</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}