'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import {Briefcase, CheckCircle, X, Plus, Search, Filter, Clock, AlertCircle, DollarSign, Package} from "lucide-react";
import { useAuth } from '@/lib/data-transfer/api-hooks';
import { useLawyerSales, useLawyerSalesStats, useUpdateLawyerSale } from '@/lib/data-transfer/api-hooks';
import { toast } from '@/lib/hooks/app-toast';

interface Service {
    id: string;
    userId: string;
    lawyerId: string;
    lawyerName: string;
    serviceName: string;
    description: string;
    price: number;
    status: "pending" | "in-progress" | "completed" | "cancelled";
    createdAt: string;
    completedAt?: string;
    invoiceNumber?: string;
    userName?: string;
}

export default function LawyerSalesPage() {
    const { useLawyerProfile } = useAuth();
    const { data: lawyerProfile, isLoading: profileLoading } = useLawyerProfile();

    const { data: lawyerSales, isLoading: salesLoading } = useLawyerSales();
    const { data: salesStats, isLoading: statsLoading } = useLawyerSalesStats();
    const { mutate: updateLawyerSale } = useUpdateLawyerSale();

    const [sales, setSales] = useState<Service[]>(lawyerSales || []);
    const [filteredSales, setFilteredSales] = useState<Service[]>(lawyerSales || []);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        if (lawyerSales) {
            setSales(lawyerSales);
            setFilteredSales(lawyerSales);
        }
    }, [lawyerSales]);

    useEffect(() => {
        let result = [...sales];

        if (statusFilter !== "all") {
            result = result.filter(s => s.status === statusFilter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(s =>
                (s.userName && s.userName.toLowerCase().includes(term)) ||
                s.serviceName.toLowerCase().includes(term) ||
                s.description.toLowerCase().includes(term)
            );
        }

        setFilteredSales(result);
    }, [sales, statusFilter, searchTerm]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800">در انتظار</Badge>;
            case "in-progress":
                return <Badge className="bg-blue-100 text-blue-800">در حال انجام</Badge>;
            case "completed":
                return <Badge className="bg-green-100 text-green-800">انجام شده</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-800">لغو شده</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const handleStartService = (saleId: string) => {
        updateLawyerSale(
            { id: saleId, data: { status: "in-progress" } },
            {
                onSuccess: () => toast.success("خدمت با موفقیت شروع شد"),
                onError: () => toast.error("خطا در شروع خدمت")
            }
        );
    };

    const handleCompleteService = (saleId: string) => {
        updateLawyerSale(
            { id: saleId, data: { status: "completed" } },
            {
                onSuccess: () => toast.success("خدمت با موفقیت تکمیل شد"),
                onError: () => toast.error("خطا در تکمیل خدمت")
            }
        );
    };

    const handleCancelService = (saleId: string) => {
        if (window.confirm("آیا از لغو این درخواست اطمینان دارید؟")) {
            updateLawyerSale(
                { id: saleId, data: { status: "cancelled" } },
                {
                    onSuccess: () => toast.success("درخواست با موفقیت لغو شد"),
                    onError: () => toast.error("خطا در لغو درخواست")
                }
            );
        }
    };

    if (profileLoading || salesLoading || statsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">سفارشات خدمات  حقوقی</h1>

                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="جستجو در سفارش‌ها..."
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
                        <option value="in-progress">در حال انجام</option>
                        <option value="completed">انجام شده</option>
                        <option value="cancelled">لغو شده</option>
                    </select>
                </div>
            </div>

            {/* آمار سفارش */}
            {salesStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">درآمد کل</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {salesStats.totalRevenue?.toLocaleString() || 0} تومان
                                    </p>
                                </div>
                                <DollarSign className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">سفارش‌های کل</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {salesStats.totalSales || 0}
                                    </p>
                                </div>
                                <Package className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">در حال انجام</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {salesStats.inProgress || 0}
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">انجام شده</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {salesStats.completed || 0}
                                    </p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {filteredSales.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">سفارشی یافت نشد</h3>
                        <p className="text-gray-500 mb-4">
                            {statusFilter !== "all" || searchTerm
                                ? "با تغییر فیلترها یا جستجوی عبارت دیگر، دوباره تلاش کنید"
                                : "شما تا کنون سفارشی نداشته‌اید"
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
                    {filteredSales.map((sale) => (
                        <Card key={sale.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{sale.serviceName}</div>
                                                <div className="text-sm text-gray-600">
                                                    {sale.lawyerName}
                                                </div>
                                            </div>
                                        </div>

                                        {sale.description && (
                                            <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                {sale.description}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            {getStatusBadge(sale.status)}
                                            <div className="text-sm font-medium">
                                                {sale.price.toLocaleString()} تومان
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-2">
                                        {sale.status === "pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-500 hover:bg-green-600"
                                                    onClick={() => handleStartService(sale.id)}
                                                >
                                                    شروع خدمت
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-500 border-red-500 hover:bg-red-50"
                                                    onClick={() => handleCancelService(sale.id)}
                                                >
                                                    لغو درخواست
                                                </Button>
                                            </>
                                        )}

                                        {sale.status === "in-progress" && (
                                            <Button
                                                size="sm"
                                                className="bg-blue-500 hover:bg-blue-600"
                                                onClick={() => handleCompleteService(sale.id)}
                                            >
                                                تکمیل خدمت
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