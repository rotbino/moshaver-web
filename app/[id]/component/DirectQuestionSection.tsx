// app/lawyer/[id]/components/DirectQuestionSection.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { Input } from '@/components/radix/input';
import { Textarea } from '@/components/radix/textarea';
import { MessageCircle, Send } from 'lucide-react';
import { LawyerList } from '@/lib/api/types';
import { useAuth } from '@/lib/api/useApi';
import { useDirectQuestion } from '@/lib/api/useApi';
import { useRouter } from 'next/navigation';

interface DirectQuestionSectionProps {
    lawyer: LawyerList;
}

export default function DirectQuestionSection({ lawyer }: DirectQuestionSectionProps) {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const directQuestionMutation = useDirectQuestion();

    const [showQuestionForm, setShowQuestionForm] = useState<boolean>(false);
    const [newQuestion, setNewQuestion] = useState({
        title: '',
        content: '',
        category: ''
    });

    const handleDirectQuestion = () => {
        if (!isAuthenticated) {
            alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
            router.push('/login');
            return;
        }

        if (!newQuestion.title.trim() || !newQuestion.content.trim() || !newQuestion.category) {
            alert('لطفاً تمام فیلدها را پر کنید');
            return;
        }

        directQuestionMutation.mutate({
            lawyerId: lawyer.id,
            userId: user!.id,
            userName: `${user!.name} ${user!.lastName}`,
            title: newQuestion.title,
            content: newQuestion.content,
            category: newQuestion.category
        }, {
            onSuccess: () => {
                setNewQuestion({ title: '', content: '', category: '' });
                setShowQuestionForm(false);
                alert('سوال شما با موفقیت ارسال شد. وکیل در اسرع وقت پاسخ خواهد داد.');
            }
        });
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {!isAuthenticated ? (
                <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">برای پرسش سوال وارد شوید</h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
                        برای ارسال سوال مستقیم به وکیل، لطفاً وارد حساب کاربری خود شوید.
                    </p>
                    <Button
                        onClick={() => router.push('/login')}
                        className="bg-orange-500 hover:bg-orange-600 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    >
                        ورود به حساب کاربری
                    </Button>
                </div>
            ) : (
                <>
                    {!showQuestionForm ? (
                        <div className="text-center py-8 sm:py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-8 h-8 text-orange-500" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">سوال مستقیم از وکیل</h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-2xl mx-auto">
                                می‌توانید سوال حقوقی خود را مستقیماً از وکیل {lawyer.name} {lawyer.lastName} بپرسید.
                                سوال شما مستقیماً به وکیل ارسال شده و در اسرع وقت پاسخ داده خواهد شد.
                            </p>
                            <Button
                                onClick={() => setShowQuestionForm(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                            >
                                پرسیدن سوال
                            </Button>
                        </div>
                    ) : (
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-lg sm:text-xl gap-2">
                                    <span>ارسال سوال به وکیل {lawyer.name} {lawyer.lastName}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowQuestionForm(false)}
                                        className="self-end sm:self-auto"
                                    >
                                        انصراف
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        عنوان سوال
                                    </label>
                                    <Input
                                        placeholder="عنوان سوال خود را وارد کنید..."
                                        value={newQuestion.title}
                                        onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        متن سوال
                                    </label>
                                    <Textarea
                                        placeholder="متن سوال خود را اینجا بنویسید..."
                                        rows={4}
                                        value={newQuestion.content}
                                        onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        دسته‌بندی سوال
                                    </label>
                                    <select
                                        value={newQuestion.category}
                                        onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm sm:text-base"
                                    >
                                        <option value="">انتخاب دسته‌بندی</option>
                                        <option value="حقوقی">حقوقی</option>
                                        <option value="خانواده">خانواده</option>
                                        <option value="کیفری">کیفری</option>
                                        <option value="مالیاتی">مالیاتی</option>
                                        <option value="کار">کار</option>
                                        <option value="تجاری">تجاری</option>
                                        <option value="ملکی">ملکی</option>
                                        <option value="ثبتی">ثبتی</option>
                                        <option value="شرکت‌ها">شرکت‌ها</option>
                                        <option value="بین‌الملل">بین‌الملل</option>
                                    </select>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowQuestionForm(false)}
                                        className="w-full sm:w-auto order-2 sm:order-1"
                                    >
                                        انصراف
                                    </Button>
                                    <Button
                                        onClick={handleDirectQuestion}
                                        disabled={directQuestionMutation.isPending || !newQuestion.title.trim() || !newQuestion.content.trim() || !newQuestion.category}
                                        className="bg-orange-500 hover:bg-orange-600 flex items-center gap-1 w-full sm:w-auto order-1 sm:order-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        {directQuestionMutation.isPending ? 'در حال ارسال...' : 'ارسال سوال'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}