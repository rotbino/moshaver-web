// app/lawyer-dashboard/components/SubscriptionBanner.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { Crown, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/api/useApi";

export default function SubscriptionBanner() {
    const { user: currentUser } = useAuth();

    // اگر کاربر اشتراک فعال دارد، این کادر را نمایش نده
    if (currentUser?.subscription) {
        const expiryDate = new Date(currentUser.subscription.expiryDate);
        const now = new Date();

        // اگر اشتراک هنوز منقضی نشده، کادر را نمایش نده
        if (expiryDate > now) {
            return null;
        }
    }

    return (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-800">
                    <Crown className="w-5 h-5" />
                    ارتقای حساب کاربری
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-amber-700">
                        با خرید پله‌های اشتراک، پروفایل خود را ویژه کرده و در نتایج جستجو رتبه بالاتری کسب کنید.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            <Star className="w-3 h-3 mr-1" />
                            نمایش ویژه
                        </Badge>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            <Crown className="w-3 h-3 mr-1" />
                            رتبه بالاتر
                        </Badge>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            اولویت در نمایش
                        </Badge>
                    </div>

                    <Link href="/lawyer-dashboard/plans">
                        <Button className="w-full bg-gradient-to-r from-red-500 to-green-500 hover:from-amber-600 hover:to-orange-600 text-white mt-2">
                            مشاهده پلن‌ها و خرید
                            <ArrowRight className="w-4 h-4 mr-2" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}