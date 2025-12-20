// app/lawyer-dashboard/questions/page.tsx
'use client';

import {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { Badge } from '@/components/radix/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/radix/tabs';
import { Textarea } from '@/components/radix/textarea';
import {
    MessageSquare,
    Check,
    X,
    Clock,
    User,
    ThumbsUp,
    Send,
    Eye,
    Star
} from 'lucide-react';
import { useLawyerQuestions, useAnswerQuestion, useRejectQuestion } from '@/lib/api/useApi';
import { useAuth } from '@/lib/api/useApi';
import { LegalQuestion, Answer } from '@/lib/api/types';
import {useSearchParams} from "next/navigation";

// app/lawyer-dashboard/questions/page.tsx

export default function LawyerQuestionsPage() {
    const { user: currentUser } = useAuth();
    const { data: pendingQuestions = [], isLoading: pendingLoading } = useLawyerQuestions({ status: 'pending' });
    const { data: answeredQuestions = [], isLoading: answeredLoading } = useLawyerQuestions({ status: 'answered', lawyerId: currentUser?.id });
    const answerQuestionMutation = useAnswerQuestion();
    const rejectQuestionMutation = useRejectQuestion();

    const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
    const [answerContent, setAnswerContent] = useState('');

    const handleAnswerSubmit = (questionId: string) => {
        if (!answerContent.trim() || !currentUser) return;

        answerQuestionMutation.mutate({
            questionId,
            content: answerContent,
            lawyerId: currentUser.id
        }, {
            onSuccess: () => {
                setAnswerContent('');
                setAnsweringQuestionId(null);
            }
        });
    };

    const handleRejectQuestion = (questionId: string) => {
        if (!currentUser) return;

        rejectQuestionMutation.mutate({
            questionId,
            lawyerId: currentUser.id
        }, {
            onSuccess: () => {
                setAnsweringQuestionId(null);
            }
        });
    };

    const startAnswering = (questionId: string) => {
        setAnsweringQuestionId(questionId);
        setAnswerContent('');
    };

    const cancelAnswering = () => {
        setAnsweringQuestionId(null);
        setAnswerContent('');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-orange-500" />
                        سوالات حقوقی
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-blue-100 p-3 rounded-lg flex items-center gap-2">
                            <Star className="w-5 h-5 text-blue-600" />
                            <div>
                                <div className="text-sm text-gray-600">امتیاز سوالات</div>
                                <div className="font-bold">{currentUser?.questionPoints || 0}</div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            با پاسخ به سوالات، ضمن کسب امتیاز، در نظر کاربران اعتبار کسب می کنید.
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pending">سوالات در انتظار پاسخ</TabsTrigger>
                    <TabsTrigger value="answered">سوالات پاسخ داده شده</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pendingLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">در حال بارگذاری...</p>
                        </div>
                    ) : pendingQuestions.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">سوالی برای پاسخ وجود ندارد</h3>
                                <p className="text-gray-600">
                                    در حال حاضر سوالی برای پاسخ‌دهی وجود ندارد. به زودی سوالات جدید نمایش داده خواهند شد.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        pendingQuestions.map(question => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                showActions={true}
                                isAnswering={answeringQuestionId === question.id}
                                onAnswer={() => startAnswering(question.id)}
                                onReject={() => {
                                    if (confirm('آیا از رد این سوال مطمئن هستید؟')) {
                                        handleRejectQuestion(question.id);
                                    }
                                }}
                                answerContent={answerContent}
                                setAnswerContent={setAnswerContent}
                                isSubmitting={answerQuestionMutation.isPending}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="answered" className="space-y-4">
                    {answeredLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">در حال بارگذاری...</p>
                        </div>
                    ) : answeredQuestions.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">هنوز سوالی پاسخ نداده‌اید</h3>
                                <p className="text-gray-600">
                                    با پاسخ به سوالات کاربران، امتیاز کسب کنید و در کارت خود نمایش داده شوید.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        answeredQuestions.map(question => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                            />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

const QuestionCard = ({
                          question,
                          showActions = false,
                          isAnswering = false,
                          onAnswer,
                          onReject,
                          answerContent,
                          setAnswerContent,
                          isSubmitting
                      }: {
    question: LegalQuestion;
    showActions?: boolean;
    isAnswering?: boolean;
    onAnswer?: () => void;
    onReject?: () => void;
    answerContent?: string;
    setAnswerContent?: (content: string) => void;
    isSubmitting?: boolean;
}) => (
    <Card className={`mb-4 hover:shadow-md transition-shadow ${isAnswering ? 'border-2 border-blue-500' : 'border-l-4 border-l-orange-500'}`}>
        <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{question.title}</CardTitle>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{question.category}</Badge>
                    {!question.isAnswered && (
                        <Badge className="bg-orange-100 text-orange-800">
                            جدید
                        </Badge>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-gray-700 mb-4">{question.content}</p>

            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
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
            </div>

            {showActions && !isAnswering && (
                <div className="flex gap-2 mt-4">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onAnswer}
                        className="bg-orange-500 hover:bg-orange-600 flex items-center gap-1"
                    >
                        <MessageSquare className="w-4 h-4" />
                        پاسخ به سوال
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onReject}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-700"
                    >
                        <X className="w-4 h-4" />
                        رد سوال
                    </Button>
                </div>
            )}

            {/* فرم پاسخ به سوال - دقیقا زیر سوال */}
            {isAnswering && (
                <div className="mt-4 pt-4 border-t border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            پاسخ شما
                        </label>
                        <Textarea
                            placeholder="پاسخ خود را اینجا بنویسید..."
                            rows={4}
                            value={answerContent}
                            onChange={(e) => setAnswerContent?.(e.target.value)}
                            className="focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-between items-center">

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setAnswerContent?.('');
                                    onAnswer?.(); // This will close the form
                                }}
                            >
                                انصراف
                            </Button>
                            <Button
                                onClick={onAnswer}
                                disabled={isSubmitting || !answerContent?.trim()}
                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                                size="sm"
                            >
                                <Send className="w-4 h-4" />
                                {isSubmitting ? 'در حال ارسال...' : 'ارسال پاسخ'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {question.answers.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">پاسخ‌ها ({question.answers.length})</h4>
                    <div className="space-y-3">
                        {question.answers.map((answer: Answer) => (
                            <div key={answer.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">{answer.lawyerName}</span>
                                    <div className="flex items-center gap-2">
                                        {answer.isAccepted && (
                                            <Badge className="bg-green-100 text-green-800">
                                                بهترین پاسخ
                                            </Badge>
                                        )}
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <ThumbsUp className="w-4 h-4" />
                                            <span>{answer.likes}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700">{answer.content}</p>
                                <div className="text-xs text-gray-500 mt-2">
                                    {new Date(answer.createdAt).toLocaleDateString('fa-IR')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
);