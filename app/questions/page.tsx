// app/questions/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { Input } from '@/components/radix/input';
import { Textarea } from '@/components/radix/textarea';
import { Search, Plus, Filter, MessageSquare, User, Clock, Eye, Check } from 'lucide-react';
import { useLegalQuestions, useCreateLegalQuestion, useUserQuestionStats } from '@/lib/api/useApi';
import { useAuth } from '@/lib/api/useApi';
import LegalQuestionCard from './LegalQuestionCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const categories = [
  "حقوقی", "خانواده", "کیفری", "مالیاتی", "کار",
  "تجاری", "ملکی", "ثبتی", "شرکت‌ها", "بین‌الملل"
];

export default function LegalQuestionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: questions, isLoading } = useLegalQuestions();
  const { data: userStats } = useUserQuestionStats(user?.id);
  const createQuestionMutation = useCreateLegalQuestion();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showMyQuestions, setShowMyQuestions] = useState(false);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    category: ''
  });

  // فیلتر کردن سوالات
  const filteredQuestions = questions?.filter(question => {
    const matchesSearch = searchTerm === '' ||
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || question.category === selectedCategory;

    const matchesUser = !showMyQuestions || question.userId === user?.id;

    return matchesSearch && matchesCategory && matchesUser;
  }) || [];

  const handleSubmitQuestion = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!newQuestion.title.trim() || !newQuestion.content.trim() || !newQuestion.category) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    createQuestionMutation.mutate({
      userId: user!.id,
      userName: `${user!.name} ${user!.lastName}`,
      title: newQuestion.title,
      content: newQuestion.content,
      category: newQuestion.category
    }, {
      onSuccess: () => {
        setNewQuestion({ title: '', content: '', category: '' });
        setShowNewQuestionForm(false);
      }
    });
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca2a30] mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">سوالات حقوقی</h1>
            <p className="text-gray-600">سوالات حقوقی خود را بپرسید و از وکلا پاسخ دریافت کنید</p>
          </div>

          {/* Stats Cards */}


          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                      placeholder="جستجوی سوالات..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* استفاده از کامپوننت Select موجود */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full md:w-48 h-10 px-3 border border-gray-300 rounded-md bg-white"
                >
                  <option value="">همه دسته‌بندی‌ها</option>
                  {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {isAuthenticated && (
                    <Button
                        variant={showMyQuestions ? "default" : "outline"}
                        onClick={() => setShowMyQuestions(!showMyQuestions)}
                        className="w-full md:w-auto flex items-center gap-2"
                    >
                      {showMyQuestions && <Check className="w-4 h-4" />}
                      سوالات من
                    </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Questions Section */}


          {showMyQuestions && (
              <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-xl sm:text-2xl text-blue-800 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      سوالات من
                    </CardTitle>
                    <Button
                        onClick={() => setShowNewQuestionForm(!showNewQuestionForm)}
                        className="bg-[#ca2a30] hover:bg-[#b02529] w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      سوال جدید
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredQuestions.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <MessageSquare className="w-16 h-16 mx-auto text-blue-300 mb-4" />
                        <h3 className="text-xl sm:text-2xl font-medium text-blue-800 mb-2">شما هنوز سوالی نپرسیده‌اید</h3>
                        <p className="text-blue-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
                          سوال حقوقی خود را بپرسید تا توسط وکلای متخصص پاسخ داده شود.
                          با ثبت سوال، می‌توانید از دانش و تجربه وکلا بهره‌مند شوید.
                        </p>
                        <Button
                            onClick={() => setShowNewQuestionForm(true)}
                            className="bg-[#ca2a30] hover:bg-[#b02529]"
                        >
                          <Plus className="w-4 h-4 ml-2" />
                          ثبت اولین سوال من
                        </Button>
                      </div>
                  ) : (
                      <div className="space-y-4">
                        {filteredQuestions.map(question => (
                            <LegalQuestionCard key={question.id} question={question} />
                        ))}
                      </div>
                  )}
                </CardContent>
              </Card>
          )}

          {/* New Question Form - Only show when not in "My Questions" mode */}
          {showNewQuestionForm && !showMyQuestions && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>ثبت سوال جدید</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                      placeholder="عنوان سوال"
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                  />

                  <Textarea
                      placeholder="متن سوال خود را اینجا بنویسید..."
                      rows={4}
                      value={newQuestion.content}
                      onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                  />

                  {/* استفاده از کامپوننت Select موجود */}
                  <select
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewQuestionForm(false)}>
                      انصراف
                    </Button>
                    <Button
                        onClick={handleSubmitQuestion}
                        disabled={createQuestionMutation.isPending}
                        className="bg-[#ca2a30] hover:bg-[#b02529]"
                    >
                      {createQuestionMutation.isPending ? 'در حال ثبت...' : 'ثبت سوال'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* All Questions List - Only show when not in "My Questions" mode */}
          {!showMyQuestions && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">همه سوالات</h2>
                  <Button
                      onClick={() => setShowNewQuestionForm(!showNewQuestionForm)}
                      className="bg-[#ca2a30] hover:bg-[#b02529]"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    سوال جدید
                  </Button>
                </div>

                {filteredQuestions.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">سوالی یافت نشد</h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm || selectedCategory
                              ? 'هیچ سوالی با فیلترهای انتخاب شده یافت نشد.'
                              : 'هنوز سوالی ثبت نشده است. اولین نفر باشید که سوال می‌پرسد!'}
                        </p>
                        <Button
                            onClick={() => setShowNewQuestionForm(true)}
                            className="bg-[#ca2a30] hover:bg-[#b02529]"
                        >
                          ثبت سوال جدید
                        </Button>
                      </CardContent>
                    </Card>
                ) : (
                    filteredQuestions.map(question => (
                        <LegalQuestionCard key={question.id} question={question} />
                    ))
                )}
              </div>
          )}
        </div>
      </div>
  );
}