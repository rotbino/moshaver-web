"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Lock } from "lucide-react";
import { Button } from "@/components/radix/button";
import { Input } from "@/components/radix/input";
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/radix/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/radix/form";
import { z } from "zod";
import { useAuth } from "@/lib/api/useApi";
import DateSelector from "@/components/common/DateSelector";
import Image from "next/image";
import Link from "next/link";

// ✅ ولیدیشن فرم تغییر رمز
const changePasswordSchema = z
    .object({
        phone: z
            .string()
            .length(11, "شماره موبایل باید 11 رقم باشد")
            .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شود"),
        nationalId: z
            .string()
            .length(10, "کد ملی باید 10 رقم باشد")
            .regex(/^\d+$/, "کد ملی فقط شامل اعداد است"),
        birthDate: z
            .string()
            .min(1, "تاریخ تولد الزامی است")
            .length(10, "تاریخ تولد باید 10 کاراکتر باشد (مثل 1402/01/01)"),
        newPassword: z
            .string()
            .min(6, "رمز جدید باید حداقل 6 کاراکتر باشد"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "رمزهای جدید یکسان نیستند",
        path: ["confirmPassword"],
    });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
    const { changePassword, isChangingPassword } = useAuth();

    const form = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            phone: "",
            nationalId: "",
            birthDate: "",
            newPassword: "",
            confirmPassword: "",
        },
        mode: "all",
    });

    const onSubmit = async (data: ChangePasswordFormData) => {
        await changePassword({
            phone: data.mobile,
            nationalId: data.nationalId,
            birthDate: data.birthDate,
            newPassword: data.newPassword,
        });
    };

    return (
        <div className="bg-white min-h-screen flex items-center justify-center">
            <Card className="max-w-md w-full p-6 bg-white rounded-xl shadow-md">
                {/* لوگو */}
                <CardHeader className="relative w-full h-40 mb-6">
                    <Image
                        src="/images/logo.png"
                        alt="Zarialam Logo"
                        fill
                        style={{ objectFit: "contain" }}
                    />
                </CardHeader>

                {/*<CardTitle className="text-2xl font-bold mb-6 text-center">
                    تغییر رمز عبور
                </CardTitle>*/}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* شماره همراه */}
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
                                            <Input
                                                {...field}
                                                type="tel"
                                                maxLength={11}
                                                inputMode="numeric"
                                                placeholder="شماره همراه"
                                                className="pr-14 h-14 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-lg text-right"
                                                dir="rtl"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-right text-red-500 text-sm">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* کد ملی */}
                        <FormField
                            control={form.control}
                            name="nationalId"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="کد ملی"
                                            className="h-14 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-lg text-right"
                                            dir="rtl"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-right text-red-500 text-sm">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* تاریخ تولد */}
                        <FormField
                            control={form.control}
                            name="birthDate"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <DateSelector
                                            {...field}
                                            placeholder="تاریخ تولد"
                                            className="w-full h-14 rounded-xl text-right border-2 border-gray-200 focus:border-purple-500"
                                            onChange={field.onChange}
                                            value={field.value}
                                            format="YYYY-MM-DD"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-right text-red-500 text-sm">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* رمز جدید */}
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="رمز جدید"
                                                className="pr-14 h-14 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-lg text-right"
                                                dir="rtl"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-right text-red-500 text-sm">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* تکرار رمز جدید */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="تکرار رمز جدید"
                                                className="pr-14 h-14 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-lg text-right"
                                                dir="rtl"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-right text-red-500 text-sm">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isChangingPassword}
                            className="w-full bg-[#A45C70] text-white font-bold py-7 text-lg rounded-xl"
                        >
                            {isChangingPassword ? "در حال ارسال..." : "تغییر رمز عبور"}
                        </Button>
                    </form>
                </Form>

                {/* لینک‌ها */}
                <div className="flex justify-between text-lg pt-2">
                    <Link href="/login" className="text-gray-600 hover:text-gray-800">
                        ورود
                    </Link>
                    <Link href="/" className="text-gray-600 hover:text-gray-800">
                        صفحه اصلی
                    </Link>
                </div>
            </Card>
        </div>
    );
}
