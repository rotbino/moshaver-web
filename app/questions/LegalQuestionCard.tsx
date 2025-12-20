// app/questions/LegalQuestionCard.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Badge } from '@/components/radix/badge';
import { Button } from '@/components/radix/button';
import { User, Clock, Eye, MessageSquare } from 'lucide-react';
import { LegalQuestion } from '@/lib/api/types';
import Link from 'next/link';

interface LegalQuestionCardProps {
    question: LegalQuestion;
}

export default function LegalQuestionCard({ question }: LegalQuestionCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <Link href={`/questions/${question.id}`} className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 hover:text-[#ca2a30] transition-colors">
                            {question.title}
                        </h3>
                    </Link>
                    <Badge variant={question.isAnswered ? "default" : "secondary"}>
                        {question.isAnswered ? 'پاسخ داده شده' : 'در انتظار پاسخ'}
                    </Badge>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                    {question.content}
                </p>

                <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{question.userName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(question.createdAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{question.viewCount} بازدید</span>
                        </div>
                    </div>

                    <Badge variant="outline">
                        {question.category}
                    </Badge>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4 inline ml-1" />
                        {question.answers.length} پاسخ
                    </div>
                    <Link href={`/questions/${question.id}`}>
                        <Button variant="ghost" size="sm">
                            مشاهده جوابها
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}