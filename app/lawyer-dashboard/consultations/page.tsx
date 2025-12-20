// app/lawyer-dashboard/consultations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { Calendar, Clock, User, CheckCircle, X, Search, Filter } from "lucide-react";
import { useAuth } from "@/lib/api/useApi";
import { formatDate, getPersianDayName } from "@/lib/utils";

interface Consultation {
    id: string;
    userId: string;
    lawyerId: string;
    lawyerName: string;
    date: string;
    time: string;
    duration: string;
    price: number;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    type: "instant" | "scheduled";
    subject?: string;
    invoiceNumber?: string;
    userName?: string;
    userMobile?: string;
}

export default function ConsultationsPage() {
    const { user: currentUser } = useAuth();
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // شبیه‌سازی دریافت داده‌ها از API
        const fetchConsultations = async () => {
            setIsLoading(true);

            // در یک برنامه واقعی، اینجا از API استفاده می‌شود
            // برای حال حاضر، از داده‌های محلی استفاده می‌کنیم
            setTimeout(() => {
                if (currentUser && currentUser.consultations) {
                    setConsultations(currentUser.consultations as Consultation[]);
                    setFilteredConsultations(currentUser.consultations as Consultation[]);
                }
                setIsLoading(false);
            }, 500);
        };

        fetchConsultations();
    }, [currentUser]);

    useEffect(() => {
        // اعمال فیلترها
        let result = [...consultations];

        if (statusFilter !== "all") {
            result = result.filter(c => c.status === statusFilter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                (c.userName && c.userName.toLowerCase().includes(term)) ||
                (c.subject && c.subject.toLowerCase().includes(term)) ||
                c.lawyerName.toLowerCase().includes(term)
            );
        }

        setFilteredConsultations(result);
    }, [consultations, statusFilter, searchTerm]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800">در انتظار</Badge>;
            case "confirmed":
                return <Badge className="bg-blue-100 text-blue-800">تایید شده</Badge>;
            case "completed":
                return <Badge className="bg-green-100 text-green-800">انجام شده</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-800">لغو شده</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">مشاوره‌های من</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="جستجو در مشاوره‌ها..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="pending">در انتظار</option>
                        <option value="confirmed">تایید شده</option>
                        <option value="completed">انجام شده</option>
                        <option value="cancelled">لغو شده</option>
                    </select>
                </div>
            </div>

            {filteredConsultations.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">مشاوره‌ای یافت نشد</h3>
                        <p className="text-gray-500 mb-4">
                            {statusFilter !== "all" || searchTerm
                                ? "با تغییر فیلترها یا جستجوی عبارت دیگر، دوباره تلاش کنید"
                                : "شما هنوز هیچ مشاوره‌ای نداشته‌اید"
                            }
                        </p>
                        <Button
                            onClick={() => {
                                setStatusFilter("all");
                                setSearchTerm("");
                            }}
                            variant="outline"
                        >
                            حذف فیلترها
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredConsultations.map((consultation) => (
                        <Card key={consultation.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center">
                                                <User className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {currentUser?.role === 'lawyer'
                                                        ? consultation.userName || "مشتری"
                                                        : consultation.lawyerName}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {consultation.date} - {consultation.time} ({consultation.duration})
                                                </div>
                                            </div>
                                        </div>

                                        {consultation.subject && (
                                            <div className="text-sm text-gray-600 mb-2">
                                                موضوع: {consultation.subject}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            {getStatusBadge(consultation.status)}
                                            <div className="text-sm font-medium">
                                                {consultation.price.toLocaleString()} تومان
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-2">
                                        {consultation.status === "pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-500 hover:bg-green-600"
                                                >
                                                    تایید مشاوره
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-500 border-red-500 hover:bg-red-50"
                                                >
                                                    لغو مشاوره
                                                </Button>
                                            </>
                                        )}

                                        {consultation.status === "confirmed" && (
                                            <Button
                                                size="sm"
                                                className="bg-blue-500 hover:bg-blue-600"
                                            >
                                                شروع مشاوره
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            variant="outline"
                                        >
                                            جزئیات
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}