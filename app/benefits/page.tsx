// app/benefits/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import {
    Briefcase,
    Users,
    Star,
    TrendingUp,
    Shield,
    Calendar,
    MessageSquare,
    CreditCard,
    BarChart3,
    CheckCircle,
    ArrowLeft,
    Crown
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function BenefitsPage() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'lawyers';

    const benefits = [
        {
            title: "پروفایل حرفه‌ای اختصاصی",
            description: "صفحه شخصی حرفه‌ای با امکان نمایش نمونه کارها، تخصص‌ها و سوابق کاری",
            icon: <Briefcase className="w-8 h-8 text-[#ca2a30]" />,
            forLawyer: true
        },
        {
            title: "دسترسی به هزاران کاربر",
            description: "معرفی خدمات شما به کاربران از سراسر کشور که به دنبال خدمات حقوقی هستند",
            icon: <Users className="w-8 h-8 text-[#ca2a30]" />,
            forLawyer: true
        },
        {
            title: "افزایش اعتبار حرفه‌ای",
            description: "تقویت جایگاه حرفه‌ای شما در فضای دیجیتال و افزایش اعتماد مشتریان",
            icon: <Star className="w-8 h-8 text-[#ca2a30]" />,
            forLawyer: true
        },
        {
            title: "مدیریت زمان‌بندی هوشمند",
            description: "تعیین ساعات کاری و مدیریت قرار ملاقات‌ها به صورت هوشمند و خودکار",
            icon: <Calendar className="w-8 h-8 text-[#ca2a30]" />,
            forLawyer: true
        },
        {
            title: "پنل مدیریت جامع",
            description: "دسترسی به پنل مدیریت برای پیگیری مشاوره‌ها، درآمد و گزارشات مالی",
            icon: <BarChart3 className="w-8 h-8 text-[#ca2a30]" />,
            forLawyer: true
        },
        {
            title: "سیستم پرداخت امن",
            description: "پرداخت آنلاین و امن هزینه مشاوره‌ها با تضمین بازگشت وجه در صورت عدم رضایت",
            icon: <CreditCard className="w-8 h-8 text-[#ca2a30]" />,
            forBoth: true
        },
        {
            title: "ارتباط مستقیم با وکلا",
            description: "امکان گفتگوی مستقیم با وکلا از طریق چت یا تماس تلفنی",
            icon: <MessageSquare className="w-8 h-8 text-[#ca2a30]" />,
            forUser: true
        },
        {
            title: "تنوع در انتخاب وکیل",
            description: "دسترسی به لیست کاملی از وکلا با فیلترهای تخصص، شهر و امتیاز",
            icon: <Shield className="w-8 h-8 text-[#ca2a30]" />,
            forUser: true
        },
        {
            title: "مشاوره آنلاین و حضوری",
            description: "امکان انتخاب نوع مشاوره (آنلاین یا حضوری) بر اساس نیاز و شرایط",
            icon: <Calendar className="w-8 h-8 text-[#ca2a30]" />,
            forUser: true
        },
        {
            title: "پلن‌های ویژه VIP",
            description: "امکان ارتقا به پلن‌های ویژه با امکان نمایش برجسته در صفحه اصلی",
            icon: <Crown className="w-8 h-8 text-yellow-500" />,
            forLawyer: true
        },
        {
            title: "پشتیبانی تخصصی",
            description: "پشتیبانی 24/7 از کاربران و وکلا برای حل هرگونه مشکل فنی یا حقوقی",
            icon: <Shield className="w-8 h-8 text-[#ca2a30]" />,
            forBoth: true
        },
        {
            title: "رشد درآمد تضمینی",
            description: "افزایش درآمد از طریق جذب مشتریان جدید و ارائه خدمات حقوقی متنوع",
            icon: <TrendingUp className="w-8 h-8 text-[#ca2a30]" />,
            forLawyer: true
        }
    ];

    // تفکیک مزایا بر اساس مخاطب
    const lawyerBenefits = benefits.filter(benefit => benefit.forLawyer || benefit.forBoth);
    const userBenefits = benefits.filter(benefit => benefit.forUser || benefit.forBoth);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">مزایای ثبت نام در وکیل‌یاب</h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        پلتفرم وکیل‌یاب بستری است برای ارتباط موثر بین وکلا و موکلان. با ثبت نام در این پلتفرم، از مزایای ویژه‌ای بهره‌مند خواهید شد.
                    </p>
                </div>

                {/* Tabs for switching between user and lawyer benefits */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
                        <Link
                            href="/benefits?tab=users"
                            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                                tab === 'users'
                                    ? "bg-[#ca2a30] text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                        >
                            مزایا برای کاربران
                        </Link>
                        <Link
                            href="/benefits?tab=lawyers"
                            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                                tab === 'lawyers'
                                    ? "bg-[#ca2a30] text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                        >
                            مزایا برای وکلا
                        </Link>
                    </div>
                </div>

                {/* Benefits for Lawyers */}
                {tab === 'lawyers' && (
                    <div className="space-y-6">


                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lawyerBenefits.map((benefit, index) => (
                                <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-[#ca2a30]/10 p-3 rounded-lg">
                                                {benefit.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                                                <p className="text-gray-600">{benefit.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Benefits for Users */}
                {tab === 'users' && (
                    <div className="space-y-6">


                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userBenefits.map((benefit, index) => (
                                <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-[#ca2a30]/10 p-3 rounded-lg">
                                                {benefit.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                                                <p className="text-gray-600">{benefit.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA Section */}
                <div className="mt-16 text-center">
                    <Card className="bg-gradient-to-r from-[#ca2a30] to-[#b02529] text-white overflow-hidden">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4">آماده شروع هستید؟</h2>
                            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
                                همین حالا ثبت نام کنید و از مزایای ویژه پلتفرم وکیل‌یاب بهره‌مند شوید
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register">
                                    <Button size="lg" className="bg-white text-[#ca2a30] hover:bg-gray-100">
                                        <Briefcase className="w-5 h-5 ml-2" />
                                        ثبت نام کنید
                                    </Button>
                                </Link>
                                <Link href="/">
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                        بازگشت به صفحه اصلی
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}