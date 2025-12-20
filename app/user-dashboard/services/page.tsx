'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Badge } from "@/components/radix/badge";
import { Button } from "@/components/radix/button";
import { FileText, User, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from '@/lib/data-transfer/api-hooks';
import { useClientOrders } from '@/lib/data-transfer/api-hooks';
import { toast } from '@/lib/hooks/app-toast';

export default function UserServicesPage() {
    const { useLawyerProfile } = useAuth();
    const { data: lawyerProfile, isLoading: profileLoading } = useLawyerProfile();

    const { data: clientOrders, isLoading: ordersLoading } = useClientOrders(lawyerProfile?.id || '');

    // محاسبه سفارشات بر اساس وضعیت
    const activeOrders = clientOrders?.filter(o => o.status === 'in-progress') || [];
    const completedOrders = clientOrders?.filter(o => o.status === 'completed') || [];
    const pendingOrders = clientOrders?.filter(o => o.status === 'pending') || [];

    if (profileLoading || ordersLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">خدمات دریافتی</h1>
                <div className="text-sm text-gray-600">
                    {clientOrders?.length || 0} سفارش
                </div>
            </div>

            {/* سفارشات در حال انجام */}
            {activeOrders.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#ca2a30]" />
                            خدمات در حال انجام
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeOrders.map((order) => (
                            <div key={order.id} className="flex items-start justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-lg">{order.serviceName}</div>
                                    <div className="text-sm text-gray-600 mt-1">{order.lawyerName}</div>
                                    {order.description && (
                                        <div className="text-sm text-gray-700 mt-2">
                                            {order.description}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-2">
                                        درخواست در: {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                    <Badge className="bg-blue-100 text-blue-800">
                                        در حال انجام
                                    </Badge>
                                    <div className="text-lg font-bold">
                                        {order.price.toLocaleString()} تومان
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* سفارشات در انتظار */}
            {pendingOrders.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            خدمات در انتظار
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingOrders.map((order) => (
                            <div key={order.id} className="flex items-start justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-lg">{order.serviceName}</div>
                                    <div className="text-sm text-gray-600 mt-1">{order.lawyerName}</div>
                                    {order.description && (
                                        <div className="text-sm text-gray-700 mt-2">
                                            {order.description}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-2">
                                        درخواست در: {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        در انتظار
                                    </Badge>
                                    <div className="text-lg font-bold">
                                        {order.price.toLocaleString()} تومان
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* سفارشات تکمیل شده */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        خدمات تکمیل شده
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {completedOrders.length > 0 ? (
                        <div className="space-y-4">
                            {completedOrders.map((order) => (
                                <div key={order.id} className="flex items-start justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium text-lg">{order.serviceName}</div>
                                        <div className="text-sm text-gray-600 mt-1">{order.lawyerName}</div>
                                        {order.description && (
                                            <div className="text-sm text-gray-700 mt-2">
                                                {order.description}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-2">
                                            درخواست در: {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                                            {order.completedAt && (
                                                <span className="mr-2">
                                                    • تکمیل در: {new Date(order.completedAt).toLocaleDateString('fa-IR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <Badge className="bg-green-100 text-green-800">
                                            تکمیل شده
                                        </Badge>
                                        <div className="text-lg font-bold">
                                            {order.price.toLocaleString()} تومان
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 mb-4">شما تا کنون هیچ خدمتی دریافت نکرده‌اید</p>
                            <Button className="bg-[#ca2a30] hover:bg-[#b02529]">
                                مشاهده وکلا
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}