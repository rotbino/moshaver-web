// app/[id]/component/ConsultationPricingTabs.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Badge } from '@/components/radix/badge';
import { Button } from '@/components/radix/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/radix/tabs';
import { User, Phone, Video, Clock, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { LawyerList } from '@/lib/api/types';
import { useConsultationOptions } from '@/lib/api/useApi';

interface ConsultationPricingTabsProps {
    lawyer: LawyerList;
    onConsultationRequest: () => void;
}

export default function ConsultationPricingTabs({ lawyer, onConsultationRequest }: ConsultationPricingTabsProps) {
    const { data: consultationOptions = [] } = useConsultationOptions(lawyer.id);

    const consultationTypes = [
        { id: 'in-person', name: 'حضوری', icon: User, color: 'bg-blue-100 text-blue-800' },
        { id: 'phone', name: 'تلفنی', icon: Phone, color: 'bg-green-100 text-green-800' },
        { id: 'video', name: 'تماس ویدئویی', icon: Video, color: 'bg-purple-100 text-purple-800' }
    ];

    // تابع برای دریافت قیمت بر اساس نوع مشاوره
    const getPrice = (type: 'in-person' | 'phone' | 'video', option: any) => {
        switch (type) {
            case 'in-person':
                return option.inPersonPrice;
            case 'phone':
                return option.phonePrice;
            case 'video':
                return option.videoPrice;
            default:
                return option.inPersonPrice;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-red-700" />
                    درخواست مشاوره
                    {lawyer.isOnline && (
                        <Badge className="bg-red-700 rounded-full text-white text-xs">
                            وکیل آنلاین است
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs defaultValue="in-person" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                        {consultationTypes.map(type => (
                            <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-1 text-xs">
                                <type.icon className="w-4 h-4" />
                                {type.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {consultationTypes.map(type => (
                        <TabsContent key={type.id} value={type.id} className="space-y-3">
                            <div className="space-y-2">
                                {consultationOptions.map(option => {
                                    const price = getPrice(type.id as 'in-person' | 'phone' | 'video', option);

                                    return (
                                        <div key={`${type.id}-${option.id}`} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium">{option.name}</span>
                                            </div>
                                            <span className="text-sm font-medium">{price.toLocaleString()} تومان</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>

                <Button
                    onClick={onConsultationRequest}
                    className="w-full bg-green-500 hover:bg-green-700 flex items-center gap-2"
                >
                    <MessageCircle className="w-4 h-4" />
                    درخواست مشاوره
                </Button>

                {!lawyer.isOnline && (
                    <div className="text-center text-sm text-gray-500 mt-2">
                        وکیل در حال حاضر آفلاین است. درخواست شما در اولین فرصت بررسی خواهد شد.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}