// app/lawyer-dashboard/pricing/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import ConsultationPricingManager from "@/app/lawyer-dashboard/ConsultationPricingManager";

export default function ConsultationPricingPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">مدیریت قیمت‌های مشاوره</CardTitle>
                </CardHeader>
              {/*  <CardContent>
                    <p className="text-gray-600 mb-6 text-justify">
                        در این صفحه می‌توانید قیمت‌های انواع مشاوره خود را به ازای بازه های زمانی مختلف تعیین کنید.
                    </p>
                </CardContent>*/}
            </Card>

            <ConsultationPricingManager />
        </div>
    );
}