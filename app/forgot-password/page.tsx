// app/forgot-password/page.tsx

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { FloatingLabel } from '@/components/common';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Shield, Lock, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useSendResetCode, useVerifyResetCode, useResetPassword } from '@/lib/data-service/hooks';
import { toast } from '@/lib/hooks/app-toast';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        mobile: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
    });

    // هوک‌های API
    const sendResetCodeMutation = useSendResetCode();
    const verifyResetCodeMutation = useVerifyResetCode();
    const resetPasswordMutation = useResetPassword();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // پاک کردن خطا برای این فیلد
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.mobile) {
                newErrors.mobile = "شماره موبایل را وارد کنید";
            } else if (!/^09[0-9]{9}$/.test(formData.mobile)) {
                newErrors.mobile = "شماره موبایل معتبر نیست";
            }
        }

        if (step === 2) {
            if (!formData.verificationCode) {
                newErrors.verificationCode = "کد تایید را وارد کنید";
            } else if (formData.verificationCode.length !== 5) {
                newErrors.verificationCode = "کد تایید باید 5 رقم باشد";
            }
        }

        if (step === 3) {
            if (!formData.newPassword) {
                newErrors.newPassword = "رمز عبور جدید را وارد کنید";
            } else if (formData.newPassword.length < 6) {
                newErrors.newPassword = "رمز عبور باید حداقل 6 کاراکتر باشد";
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "تکرار رمز عبور را وارد کنید";
            } else if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = "رمز عبور و تکرار آن یکسان نیست";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendCode = async () => {
        if (!validateStep(1)) return;

        try {
            await sendResetCodeMutation.mutateAsync(formData.mobile);
            toast.success("کد تایید با موفقیت ارسال شد");
            setCurrentStep(2);
        } catch (err: any) {
            toast.error(err.message || 'خطا در ارسال کد تایید');
        }
    };

    const handleVerifyCode = async () => {
        if (!validateStep(2)) return;

        try {
            await verifyResetCodeMutation.mutateAsync({
                mobile: formData.mobile,
                code: formData.verificationCode
            });
            toast.success("کد تایید با موفقیت تأیید شد");
            setCurrentStep(3);
        } catch (err: any) {
            toast.error(err.message || 'خطا در تایید کد');
        }
    };

    const handleResetPassword = async () => {
        if (!validateStep(3)) return;

        try {
            await resetPasswordMutation.mutateAsync({
                mobile: formData.mobile,
                newPassword: formData.newPassword
            });

            toast.success("رمز عبور شما با موفقیت تغییر کرد");
            router.push('/login');
        } catch (err: any) {
            toast.error(err.message || 'خطا در تغییر رمز عبور');
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#ca2a30] mb-2">فراموشی رمز عبور</h1>
                    <p className="text-gray-600">رمز عبور خود را بازیابی کنید</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentStep >= step
                                        ? 'bg-[#ca2a30] text-white'
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {step}
                                </div>
                                {step < 3 && (
                                    <div className={`w-16 h-1 mx-2 ${
                                        currentStep > step ? 'bg-[#ca2a30]' : 'bg-gray-200'
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        {/* Step 1: Mobile Number */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Phone className="w-8 h-8 text-[#ca2a30]" />
                                    </div>
                                    <h2 className="text-xl font-semibold">شماره موبایل خود را وارد کنید</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        کد تایید به این شماره ارسال خواهد شد
                                    </p>
                                </div>

                                <FloatingLabel
                                    id="mobile"
                                    label="شماره موبایل"
                                    icon={<Phone className="w-6 h-6 text-gray-400"/>}
                                >
                                    <input
                                        type="tel"
                                        value={formData.mobile}
                                        onChange={(e) => handleInputChange("mobile", e.target.value)}
                                        placeholder="09123456789"
                                        className={errors.mobile ? "border-red-500" : ""}
                                    />
                                </FloatingLabel>
                                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}

                                <Button
                                    onClick={handleSendCode}
                                    className="w-full bg-[#ca2a30] hover:bg-[#b02529]"
                                    disabled={sendResetCodeMutation.isPending}
                                >
                                    {sendResetCodeMutation.isPending ? 'در حال ارسال...' : 'ارسال کد تایید'}
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Verification Code */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Shield className="w-8 h-8 text-[#ca2a30]" />
                                    </div>
                                    <h2 className="text-xl font-semibold">کد تایید را وارد کنید</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        کد 5 رقمی به شماره {formData.mobile} ارسال شد
                                    </p>
                                </div>

                                <FloatingLabel
                                    id="verificationCode"
                                    label="کد تایید"
                                    icon={<Shield className="w-6 h-6 text-gray-400"/>}
                                >
                                    <input
                                        type="text"
                                        value={formData.verificationCode}
                                        onChange={(e) => handleInputChange("verificationCode", e.target.value)}
                                        placeholder="12345"
                                        className={errors.verificationCode ? "border-red-500" : ""}
                                    />
                                </FloatingLabel>
                                {errors.verificationCode && <p className="text-red-500 text-sm mt-1">{errors.verificationCode}</p>}

                                <div className="flex gap-2">

                                    <Button
                                        onClick={handleVerifyCode}
                                        className="flex-1 bg-[#ca2a30] hover:bg-[#b02529]"
                                        disabled={verifyResetCodeMutation.isPending}
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2" />
                                        {verifyResetCodeMutation.isPending ? 'در حال بررسی...' : 'تایید کد'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handlePrev}
                                        className="flex-1"
                                    >
                                        مرحله قبل
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        className="text-sm text-[#ca2a30] hover:underline"
                                        disabled={sendResetCodeMutation.isPending}
                                    >
                                        {sendResetCodeMutation.isPending ? 'در حال ارسال...' : 'ارسال مجدد کد'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Reset Password */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Lock className="w-8 h-8 text-[#ca2a30]" />
                                    </div>
                                    <h2 className="text-xl font-semibold">تعیین رمز عبور جدید</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        رمز عبور جدید خود را وارد کنید
                                    </p>
                                </div>

                                <FloatingLabel
                                    id="newPassword"
                                    label="رمز عبور جدید"
                                    icon={<Lock className="w-6 h-6 text-gray-400"/>}
                                >
                                    <input
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                        placeholder="••••••••"
                                        className={errors.newPassword ? "border-red-500" : ""}
                                    />
                                </FloatingLabel>
                                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}

                                <FloatingLabel
                                    id="confirmPassword"
                                    label="تکرار رمز عبور جدید"
                                    icon={<Lock className="w-6 h-6 text-gray-400"/>}
                                >
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                        placeholder="••••••••"
                                        className={errors.confirmPassword ? "border-red-500" : ""}
                                    />
                                </FloatingLabel>
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}

                                <div className="flex gap-2">

                                    <Button
                                        onClick={handleResetPassword}
                                        className="flex-1 bg-[#ca2a30] hover:bg-[#b02529]"
                                        disabled={resetPasswordMutation.isPending}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {resetPasswordMutation.isPending ? 'در حال تغییر...' : 'تغییر رمز عبور'}

                                    </Button>

                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Login Link */}
                <div className="text-center text-sm text-gray-600">
                    به حساب کاربری خود دسترسی دارید؟{' '}
                    <Link href="/login" className="text-[#ca2a30] hover:underline font-medium">
                        وارد شوید
                    </Link>
                </div>

                {/* Development Tools */}
                {process.env.NODE_ENV === 'development' && currentStep === 2 && (
                    <div className="mt-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">کد تایید برای تست: 12345</div>
                    </div>
                )}
            </div>
        </div>
    );
}