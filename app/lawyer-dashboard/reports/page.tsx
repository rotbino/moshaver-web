//app/lawyer-dashboard/reports/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Badge } from "@/components/radix/badge";
import { useAuth, useFinancialReport } from "@/lib/api/useApi";
import {
    BarChart3,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Calendar,
    FileText,
    Users,
    Clock
} from "lucide-react";

export default function LawyerReportsPage() {
    const { user: currentUser } = useAuth();
    const { data: report, isLoading } = useFinancialReport(currentUser?.id);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">گزارشی یافت نشد</p>
                </div>
            </div>
        );
    }

    // فرمت‌بندی درآمد ماهانه برای نمایش
    const monthlyIncomeData = Object.entries(report.monthlyIncome)
        .map(([month, income]) => ({
            month,
            income,
            formattedMonth: new Date(month + '-01').toLocaleDateString('fa-IR', { month: 'long', year: 'numeric' })
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">گزارشات مالی</h1>

            {/* کارت‌های خلاصه */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            کل درآمد
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.totalIncome.toLocaleString()}</div>
                        <p className="text-sm text-gray-500 mt-1">تومان</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            درآمد این ماه
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {monthlyIncomeData[monthlyIncomeData.length - 1]?.income.toLocaleString() || 0}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">تومان</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            درآمد تسویه نشده
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.pendingIncome.toLocaleString()}</div>
                        <p className="text-sm text-gray-500 mt-1">تومان</p>
                    </CardContent>
                </Card>
            </div>

            {/* درآمد بر اساس نوع */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-orange-600" />
                        درآمد بر اساس نوع
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-orange-600" />
                                <div className="text-lg font-medium">مشاوره‌ها</div>
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                                {report.incomeByType.consultation.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">تومان</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-5 h-5 text-orange-600" />
                                <div className="text-lg font-medium">خدمات</div>
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                                {report.incomeByType.service.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">تومان</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* درآمد ماهانه */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                        درآمد ماهانه
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {monthlyIncomeData.map((item) => (
                            <div key={item.month} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="font-medium">{item.formattedMonth}</div>
                                <div className="text-lg font-bold">{item.income.toLocaleString()} تومان</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* تراکنش‌های اخیر */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-orange-600" />
                        تراکنش‌های اخیر
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {report.transactions.slice(0, 5).map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">{transaction.description}</div>
                                    <div className="text-sm text-gray-600">
                                        {new Date(transaction.createdAt).toLocaleDateString('fa-IR')}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        تکمیل شده
                                    </Badge>
                                    <div className="text-sm font-medium">
                                        {transaction.amount.toLocaleString()} تومان
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}