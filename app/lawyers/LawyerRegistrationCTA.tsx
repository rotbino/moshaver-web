// app/home/LawyerRegistrationCTA.tsx
"use client";

import { Button } from "@/components/radix/button";
import { Card, CardContent } from "@/components/radix/card";
import { Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LawyerRegistrationCTA() {
    return (
        <Card className="my-8 border border-gray-200 shadow-sm">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-2 text-gray-900">به جمع وکلای ما بپیوندید</h2>
                        <p className="text-gray-600 mb-4">
                            با ثبت نام در پلتفرم وکیل یاب، خدمات خود را به هزاران کاربر معرفی کنید و درآمد خود را افزایش دهید.
                        </p>
                        <Link href="/benefits" className="text-[#ca2a30] hover:underline text-sm font-medium inline-flex items-center gap-1">
                            مشاهده مزایای ثبت نام
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/register">
                            <Button size="lg" className="bg-[#ca2a30] hover:bg-[#b02529] text-white w-full md:w-auto">
                                <Briefcase className="w-5 h-5 ml-2" />
                                ثبت نام وکلا
                            </Button>
                        </Link>
                        {/*<Link href="/vip-lawyers">
                            <Button variant="outline" size="sm" className="border-[#ca2a30] text-[#ca2a30] hover:bg-[#ca2a30]/10 w-full md:w-auto">
                                مشاهده پلن‌های ویژه
                            </Button>
                        </Link>*/}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}