"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Badge } from "@/components/radix/badge";
import { Button } from "@/components/radix/button";
import { Calendar, User, CheckCircle, Clock, AlertCircle, Phone, Video } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/api/useApi";

export default function UserConsultationsPage() {
    const { user: currentUser } = useAuth();

    // محاسبه مشاوره‌های آینده و گذشته
    const upcomingConsultations = currentUser?.consultations?.filter(c =>
        c.status === 'confirmed' || c.status === 'pending'
    ) || [];

    const completedConsultations = currentUser?.consultations?.filter(c =>
        c.status === 'completed'
    ) || [];

    const cancelledConsultations = currentUser?.consultations?.filter(c =>
        c.status === 'cancelled'
    ) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">مشاوره‌های دریافتی</h1>
                <div className="text-sm text-gray-600">
                    {currentUser?.consultations?.length || 0} مشاوره
                </div>
            </div>

            {/* مشاوره‌های آینده */}
            {upcomingConsultations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#ca2a30]" />
                            مشاوره‌های آینده
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {upcomingConsultations.map((consultation) => (
                            <div key={consultation.id} className="flex items-start justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-lg">{consultation.lawyerName}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {consultation.date} ساعت {consultation.time} ({consultation.duration})
                                    </div>
                                    {consultation.subject && (
                                        <div className="text-sm text-gray-700 mt-2">
                                            موضوع: {consultation.subject}
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                        <Button size="sm" className="bg-[#ca2a30] hover:bg-[#b02529]">
                                            <Phone className="w-4 h-4 ml-1" />
                                            تماس
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Video className="w-4 h-4 ml-1" />
                                            جلسه آنلاین
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                    <Badge
                                        className={
                                            consultation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }
                                    >
                                        {consultation.status === 'confirmed' ? 'تایید شده' : 'در انتظار'}
                                    </Badge>
                                    <div className="text-lg font-bold">
                                        {consultation.price.toLocaleString()} تومان
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* مشاوره‌های تکمیل شده */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        مشاوره‌های تکمیل شده
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {completedConsultations.length > 0 ? (
                        <div className="space-y-4">
                            {completedConsultations.map((consultation) => (
                                <div key={consultation.id} className="flex items-start justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium text-lg">{consultation.lawyerName}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {consultation.date} ساعت {consultation.time} ({consultation.duration})
                                        </div>
                                        {consultation.subject && (
                                            <div className="text-sm text-gray-700 mt-2">
                                                موضوع: {consultation.subject}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <Badge className="bg-green-100 text-green-800">
                                            انجام شده
                                        </Badge>
                                        <div className="text-lg font-bold">
                                            {consultation.price.toLocaleString()} تومان
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 mb-4">شما تا کنون هیچ مشاوره‌ای انجام نداده‌اید</p>
                            <Link href="/app/lawyers" className="inline-block">
                                <Button className="bg-[#ca2a30] hover:bg-[#b02529]">
                                    مشاهده وکلا
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* مشاوره‌های لغو شده */}
            {cancelledConsultations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            مشاوره‌های لغو شده
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cancelledConsultations.map((consultation) => (
                            <div key={consultation.id} className="flex items-start justify-between p-4 border rounded-lg opacity-60">
                                <div className="flex-1">
                                    <div className="font-medium text-lg">{consultation.lawyerName}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {consultation.date} ساعت {consultation.time} ({consultation.duration})
                                    </div>
                                    {consultation.subject && (
                                        <div className="text-sm text-gray-700 mt-2">
                                            موضوع: {consultation.subject}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                    <Badge className="bg-red-100 text-red-800">
                                        لغو شده
                                    </Badge>
                                    <div className="text-lg font-bold">
                                        {consultation.price.toLocaleString()} تومان
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}