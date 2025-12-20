// app/lawyer-dashboard/plans/page.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { Crown, Star, Check, ArrowLeft, TrendingUp, Eye, Award } from "lucide-react";
import Link from "next/link";
import { usePlans, usePurchasePlan } from "@/lib/api/useApi";
import { useAuth } from "@/lib/api/useApi";
import { useRouter } from "next/navigation";
import LadderSteps from "@/app/public/LadderSteps";


export default function PlansPage() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const { data: plans, isLoading } = usePlans();
    const purchasePlan = usePurchasePlan();
    const [selectedSteps, setSelectedSteps] = useState<number>(1);

    const handleStepSelect = (step: number) => {
        setSelectedSteps(step);
    };

    const handlePurchase = (planId: string) => {
        if (!currentUser) return;

        if (!selectedSteps || selectedSteps < 1) {
            alert('لطفاً تعداد پله‌های صعود را انتخاب کنید');
            return;
        }

        purchasePlan.mutate(
            { userId: currentUser.id, planId, steps: selectedSteps },
            {
                onSuccess: () => {
                    alert('پرداخت با موفقیت انجام شد! اشتراک شما فعال شد.');
                    router.push('/lawyer-dashboard');
                },
                onError: (error) => {
                    alert('خطا در پرداخت: ' + error.message);
                }
            }
        );
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('fa-IR');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">


            {/* Ladder Steps Selection */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-3">
                    <LadderSteps
                        selectedStep={selectedSteps}
                        onStepSelect={handleStepSelect}
                    />
                </CardContent>
            </Card>

            {/* Mobile Plan Cards - Only visible on mobile */}
            <div className="md:hidden grid grid-cols-3 gap-3">
                {plans?.map((plan) => {
                    // قیمت برای تک پله
                    const singleStepPrice = plan.basePrice * plan.duration;
                    // قیمت برای تعداد پله‌های انتخاب شده
                    const totalPrice = singleStepPrice * selectedSteps;
                    // قیمت با تخفیف
                    const discountedPrice = totalPrice * (1 - plan.discount / 100);

                    return (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden transition-all duration-300 ${
                                plan.popular
                                    ? 'border-orange-500 border-2 shadow-lg'
                                    : 'border-gray-200'
                            }`}
                        >


                            <CardContent className="p-3">
                                <CardTitle className="text-center text-sm font-bold text-gray-900 mb-1">
                                    {plan.name}
                                </CardTitle>
                                <div className="text-center mb-2">
                                    <div className="text-lg font-bold text-gray-900">
                                        {formatPrice(discountedPrice)}
                                        <span className="text-xs font-normal text-gray-500"> تومان</span>
                                    </div>
                                    {plan.discount > 0 && (
                                        <div className="text-red-600 font-bold text-xs">
                                            {plan.discount}% تخفیف
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => handlePurchase(plan.id)}
                                    disabled={purchasePlan.isPending}
                                    className={`w-full py-2 text-sm font-semibold transition-all duration-300 ${
                                        plan.popular
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                                            : 'bg-gray-800 hover:bg-gray-900 text-white'
                                    }`}
                                >
                                    {purchasePlan.isPending && selectedPlan === plan.id
                                        ? 'در حال پرداخت...'
                                        : 'خرید'
                                    }
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans?.map((plan) => {
                    // قیمت برای تک پله
                    const singleStepPrice = plan.basePrice * plan.duration;
                    // قیمت برای تعداد پله‌های انتخاب شده
                    const totalPrice = singleStepPrice * selectedSteps;
                    // قیمت با تخفیف
                    const discountedPrice = totalPrice * (1 - plan.discount / 100);

                    return (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                                plan.popular
                                    ? 'border-orange-500 border-2 shadow-lg transform hover:scale-105'
                                    : 'border-gray-200 hover:border-orange-300'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center py-2 text-sm font-bold">
                                    محبوب‌ترین
                                </div>
                            )}

                            <CardHeader className={`pb-6 ${plan.popular ? 'pt-8' : 'pt-6'}`}>
                                <CardTitle className="text-center text-xl font-bold text-gray-900">
                                    {plan.name}
                                </CardTitle>
                                <div className="text-center py-4">
                                    <div className="text-4xl font-bold text-gray-900">
                                        {formatPrice(discountedPrice)}
                                        <span className="text-lg font-normal text-gray-500"> تومان</span>
                                    </div>
                                    {plan.discount > 0 && (
                                        <div className="mt-2">
                                            <span className="text-2xl text-gray-500 line-through">
                                                {formatPrice(totalPrice)}
                                            </span>
                                            <div className="text-red-600 font-bold mt-1">
                                                {plan.discount}% تخفیف
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center text-gray-600">
                                    برای {selectedSteps} پله و {plan.duration} {plan.durationUnit}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6 flex flex-1 flex-col">
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-800">ویژگی‌ها:</h3>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                            <div className={"p-4"}>
                                <Button
                                    onClick={() => handlePurchase(plan.id)}
                                    disabled={purchasePlan.isPending}
                                    className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                                        plan.popular
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl'
                                            : 'bg-gray-800 hover:bg-gray-900 text-white'
                                    }`}
                                >
                                    {purchasePlan.isPending
                                        ? 'در حال پرداخت...'
                                        : 'خرید پلن'
                                    }
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Benefits Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">چرا پله های صعود بالاتر را انتخاب کنیم؟</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">دیده شدن بیشتر</h3>
                            <p className="text-gray-600">
                                وکلای دارای پله در نتایج جستجو تا 70% بیشتر از وکلای بدون پله دیده می‌شوند
                            </p>
                        </div>

                        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Eye className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">جذب مشتری بیشتر</h3>
                            <p className="text-gray-600">
                                پروفایل ویژه شما در صدر نتایج نمایش داده شده و مشتریان بیشتری جذب می‌کنید
                            </p>
                        </div>

                        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-amber-600" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">اعتبار حرفه‌ای</h3>
                            <p className="text-gray-600">
                                نشان ویژه و پله‌های بالاتر، اعتبار شما را در نگاه مشتریان افزایش می‌دهد
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-start gap-3">
                            <Crown className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">نکته ویژه:</h4>
                                <p className="text-gray-700">
                                    با خرید پلن‌های 6 ماهه و 1 ساله، علاوه بر تخفیف بیشتر، نشان ویژه به صورت رایگان دریافت می‌کنید
                                    و پروفایل شما با یک نشان طلایی در تمام صفحات نمایش داده می‌شود.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}