// app/questions/AnswerCard.tsx
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/radix/card';
import { Badge } from '@/components/radix/badge';
import { Button } from '@/components/radix/button';
import { User, Clock, ThumbsUp, Check } from 'lucide-react';
import { Answer } from '@/lib/api/types';

interface AnswerCardProps {
    answer: Answer;
    isQuestionOwner: boolean;
    onAcceptAnswer?: (answerId: string) => void;
}

export default function AnswerCard({ answer, isQuestionOwner, onAcceptAnswer }: AnswerCardProps) {
    return (
        <div className="border-b pb-6 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-medium text-gray-900">{answer.lawyerName}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(answer.createdAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                </div>

                {answer.isAccepted && (
                    <Badge className="bg-green-100 text-green-800">
                        بهترین پاسخ
                    </Badge>
                )}
            </div>

            <p className="text-gray-700 mb-4">{answer.content}</p>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                    >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{answer.likes}</span>
                    </Button>
                </div>

                {isQuestionOwner && !answer.isAccepted && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAcceptAnswer?.(answer.id)}
                        className="flex items-center gap-1"
                    >
                        <Check className="w-4 h-4" />
                        انتخاب به عنوان بهترین پاسخ
                    </Button>
                )}
            </div>
        </div>
    );
}