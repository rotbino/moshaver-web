'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { FloatingLabel } from '@/components/common';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, User, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/lib/hooks/app-toast';
import { useAuth } from '@/lib/data-transfer/api-hooks';
import { store } from '@/lib/store/store';
import { setAccessToken, setRefreshToken, setUser } from '@/lib/store/slices/authSlice';
import {UserProfile} from "@/lib/data-transfer/types";

export default function LoginPage() {
    const router = useRouter();
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { useLogin } = useAuth();
    const loginMutation = useLogin();

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!mobile) {
            newErrors.mobile = "شماره موبایل را وارد کنید";
        } else if (!/^09[0-9]{9}$/.test(mobile)) {
            newErrors.mobile = "شماره موبایل معتبر نیست";
        }

        if (!password) {
            newErrors.password = "رمز عبور را وارد کنید";
        } else if (password.length < 6) {
            newErrors.password = "رمز عبور باید حداقل 6 کاراکتر باشد";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await loginMutation.mutateAsync({ mobile, password });
            // ساخت آبجکت UserProfile از پاسخ دریافتی
            const userProfile: UserProfile = {
                user: response.user,
                account: response.account,
                subscription: response.subscription,
                userDashboard: response.userDashboard,
                lawyerDashboard: response.lawyerDashboard
            };

            // ذخیره توکن‌ها و اطلاعات کاربر در Redux
            store.dispatch(setAccessToken(response.tokens.accessToken));
            store.dispatch(setRefreshToken(response.tokens.refreshToken));
            store.dispatch(setUser(userProfile));

            toast.success("ورود با موفقیت انجام شد");

            // هدایت به داشبورد مناسب بر اساس نقش کاربر
            setTimeout(() => {
                if (response.user.role === 'LAWYER') {
                    router.push('/lawyer-dashboard');
                } else {
                    router.push('/user-dashboard');
                }
            }, 100);
        } catch (error: any) {
            console.error('Login failed:', error);

            // نمایش خطای مناسب به کاربر
            if (error.message) {
                toast.error(error.message || "خطا در ورود به سیستم");
            } else {
                toast.error("شماره موبایل یا رمز عبور اشتباه است");
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#ca2a30] mb-2">ورود به وکیل‌یاب</h1>
                    <p className="text-gray-600">به حساب کاربری خود وارد شوید</p>
                </div>

                {/* Form Card */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-[#ca2a30]" />
                            </div>
                            <h2 className="text-xl font-semibold">ورود به حساب کاربری</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                شماره موبایل و رمز عبور خود را وارد کنید
                            </p>
                        </div>

                        {errors.form && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                                {errors.form}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <FloatingLabel
                                id="mobile"
                                label="شماره موبایل"
                                icon={<Phone className="w-6 h-6 text-gray-400"/>}
                            >
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="09123456789"
                                    className={errors.mobile ? "border-red-500" : ""}
                                />
                            </FloatingLabel>
                            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                            <div className="relative">
                                <FloatingLabel
                                    id="password"
                                    label="رمز عبور"
                                    icon={<Lock className="w-6 h-6 text-gray-400"/>}
                                >

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={errors.password ? "border-red-500" : ""}
                                    />

                                </FloatingLabel>
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

                            {/* لینک فراموشی رمز عبور */}
                            <div className="text-left">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-[#ca2a30] hover:underline"
                                >
                                    رمز عبور خود را فراموش کرده‌اید؟
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#ca2a30] hover:bg-[#b02529]"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? 'در حال ورود...' : 'ورود'}
                            </Button>
                        </form>

                        {/* Development Tools */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-2">ابزار توسعه:</div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMobile('09196421264'); // شماره وکیل (احمد محمدی)
                                            setPassword('111111');
                                        }}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded text-left"
                                    >
                                        پر کردن فرم با داده‌های تست (وکیل)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMobile('09144133782'); // شماره کاربر عادی (علی احمدی)
                                            setPassword('111111');
                                        }}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded text-left"
                                    >
                                        پر کردن فرم با داده‌های تست (کاربر)
                                    </button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Register Link */}
                <div className="text-center text-sm text-gray-600">
                    حساب کاربری ندارید؟{' '}
                    <Link href="/register" className="text-[#ca2a30] hover:underline font-medium">
                        ثبت‌نام کنید
                    </Link>
                </div>
            </div>
        </div>
    );
}