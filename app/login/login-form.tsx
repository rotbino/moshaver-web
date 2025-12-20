"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
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
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/api/useApi";
import {normalizePhoneNumber} from "@/lib/utils/utils";


export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
    mode: "all", // ✅ ولیدیشن همزمان با تایپ و روی submit
  });

  const onSubmit = async (data: LoginFormData) => {
    await login({username:normalizePhoneNumber(data.mobile) ,password:data.password});
    router.replace("/");
  };

  return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 bg-white rounded-xl shadow-md">
          <CardHeader className="relative w-full h-40 mb-6">
            <Image
                src="/images/logo.png"
                alt="Logo"
                fill
                style={{ objectFit: "contain" }}
            />
          </CardHeader>

         {/* <CardTitle className="text-2xl font-bold mb-6 text-center">
            ورود به حساب کاربری
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
                                className="pr-14 h-14 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-lg text-right"
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

              {/* رمز عبور */}
              <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
                            <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="کلمه عبور"
                                className="pr-14 pl-14 h-14 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-lg text-right"
                                dir="rtl"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                            </button>
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
                  disabled={isLoggingIn}
                  className="w-full bg-[#A45C70] text-white font-bold py-6 text-lg rounded-xl"
              >
                {isLoggingIn ? "در حال ورود..." : "ورود"}
              </Button>

              <div className="flex justify-between text-lg pt-4">
               {/* <Link href="/forgot-password" className="text-gray-600 hover:text-gray-800">
                  بازیابی کلمه عبور
                </Link>*/}
                <Link href="/register" className="text-gray-600 hover:text-gray-800">
                  ثبت نام
                </Link>
              </div>
            </form>
          </Form>
        </Card>
      </div>
  );
}
