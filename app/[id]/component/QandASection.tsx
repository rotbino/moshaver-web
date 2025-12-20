// app/lawyer/[id]/components/QandASection.tsx
'use client';

import { MessageCircle } from 'lucide-react';
import { QAPair } from '@/lib/api/types';

interface QandASectionProps {
    qaPairs: QAPair[];
}

export default function QandASection({ qaPairs }: QandASectionProps) {
    return (
        <div className="space-y-4 sm:space-y-6">
            {qaPairs?.map(qa => (
                <div key={qa.id} className="border-b pb-4 sm:pb-6 last:border-0">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                        <div className="flex items-start gap-2 mb-2">
                            <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                                    سوال از {qa.askedBy}
                                </div>
                                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                    {qa.question}
                                </p>
                                <div className="text-xs sm:text-sm text-gray-500 mt-2">
                                    {new Date(qa.askedAt).toLocaleDateString('fa-IR')}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                                    پاسخ وکیل
                                </div>
                                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                    {qa.answer}
                                </p>
                                <div className="text-xs sm:text-sm text-gray-500 mt-2">
                                    {new Date(qa.answeredAt).toLocaleDateString('fa-IR')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {(!qaPairs || qaPairs.length === 0) && (
                <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base">هنوز سوالی ثبت نشده است</p>
                </div>
            )}
        </div>
    );
}