// app/profile/page.tsx

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/radix/tabs';
import { User, Briefcase, Mail, Phone, MapPin, Edit, Calendar, Star, Award, LogOut } from 'lucide-react';
import { useProfile, useAuth, useLogout } from '@/lib/data-service/hooks';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/app-toast';
import { ApiError, UserRole, Lawyer, Specialty, Skill } from '@/lib/data-service/types';
import Link from "next/link";
import { specialtyTitles, skillTitles } from "@/lib/data-service/mockData";
import Image from 'next/image';
export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const { data: profile, isLoading, error } = useProfile(user.id);

  // تابع کمکی برای دریافت عنوان تخصص
  const getSpecialtyTitle = (specialty: Specialty) => {
    return specialtyTitles.find(s => s.id === specialty)?.title || specialty;
  };

  // تابع کمکی برای دریافت عنوان مهارت
  const getSkillTitle = (skill: Skill) => {
    return skillTitles.find(s => s.id === skill)?.title || skill;
  };

  // آپلود تصویر پروفایل
  const handleImageUpload = async (file: File) => {
    try {
      // در محیط توسعه، فقط شبیه‌سازی می‌کنیم
      toast.success("تصویر پروفایل با موفقیت آپلود شد");
      // در واقعیت اینجا باید از useUploadProfileImage استفاده شود
    } catch (err: any) {
      toast.error(err.message || "خطا در آپلود تصویر پروفایل");
    }
  };

  // حذف تصویر پروفایل
  const handleImageDelete = (fileId: string) => {
    try {
      // در محیط توسعه، فقط شبیه‌سازی می‌کنیم
      toast.success("تصویر پروفایل با موفقیت حذف شد");
      // در واقعیت اینجا باید از یک هوک برای حذف فایل استفاده شود
    } catch (err: any) {
      toast.error(err.message || "خطا در حذف تصویر پروفایل");
    }
  };

  // خروج از حساب کاربری
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("خروج از حساب کاربری با موفقیت انجام شد");
        router.push('/login');
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "خطا در خروج از حساب کاربری");
      }
    });
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-[#ca2a30] animate-pulse" />
            </div>
            <p className="text-gray-600">در حال بارگذاری اطلاعات پروفایل...</p>
          </div>
        </div>
    );
  }

  if (error || !profile) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-600">خطا در بارگذاری اطلاعات پروفایل</p>
            <Button
                onClick={() => router.push('/dashboard')}
                className="mt-4 bg-[#ca2a30] hover:bg-[#b02529]"
            >
              بازگشت به داشبورد
            </Button>
          </div>
        </div>
    );
  }

  const isLawyer = profile.role === UserRole.LAWYER;
  const lawyerProfile = profile as Lawyer;

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#ca2a30] mb-2">پروفایل کاربری</h1>

            </div>

            {/* Logout Button */}
            <Button
                variant="outline"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {logoutMutation.isPending ? 'در حال خروج...' : 'خروج از حساب'}
            </Button>
          </div>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Image
                        src={profile.profileImage}
                        alt="Profile"
                        width={150}
                        height={150}
                    />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{profile.name} {profile.lastName}</h2>
                      <p className="text-gray-600">
                        {isLawyer ? 'وکیل دادگستری' : 'کاربر عادی'}
                      </p>
                    </div>
                    <Link href="/profile/edit">
                      <Button
                          className="mt-2 md:mt-0 bg-[#ca2a30] hover:bg-[#b02529]"
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        ویرایش پروفایل
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-500 ml-2" />
                      <span>{profile.email || 'ایمیل ثبت نشده'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-500 ml-2" />
                      <span>{profile.mobile}</span>
                    </div>
                    {isLawyer && (
                        <>
                          <div className="flex items-center">
                            <Briefcase className="w-5 h-5 text-gray-500 ml-2" />
                            <span>
                              {lawyerProfile.experienceYears || 0} سال سابقه کار
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-gray-500 ml-2" />
                            <span>
                              {lawyerProfile.rating || 0} ({lawyerProfile.reviewsCount || 0} نظر)
                            </span>
                          </div>
                        </>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-500 ml-2" />
                      <span>
                        عضو از {new Date(profile.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for additional information */}
          <Tabs dir="rtl" defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">اطلاعات شخصی</TabsTrigger>
              {isLawyer && (
                  <TabsTrigger value="professional">اطلاعات حرفه‌ای</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">اطلاعات پایه</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-500 ml-2" />
                          <span>نام: {profile.name}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-500 ml-2" />
                          <span>نام خانوادگی: {profile.lastName}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-gray-500 ml-2" />
                          <span>موبایل: {profile.mobile}</span>
                        </div>
                        {profile.email && (
                            <div className="flex items-center">
                              <Mail className="w-5 h-5 text-gray-500 ml-2" />
                              <span>ایمیل: {profile.email}</span>
                            </div>
                        )}
                      </div>
                    </div>

                    {isLawyer && lawyerProfile.location && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">اطلاعات تماس</h3>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <MapPin className="w-5 h-5 text-gray-500 ml-2" />
                              <span>
                                {lawyerProfile.location.province}, {lawyerProfile.location.city}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-5 h-5 text-gray-500 ml-2" />
                              <span>
                                {lawyerProfile.location.address}
                              </span>
                            </div>
                            {lawyerProfile.contact?.phone && (
                                <div className="flex items-center">
                                  <Phone className="w-5 h-5 text-gray-500 ml-2" />
                                  <span>
                                    تلفن: {lawyerProfile.contact.phone}
                                  </span>
                                </div>
                            )}
                          </div>
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isLawyer && (
                <TabsContent value="professional" className="mt-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">اطلاعات حرفه‌ای</h3>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <Briefcase className="w-5 h-5 text-gray-500 ml-2" />
                              <span>
                                سابقه کار: {lawyerProfile.experienceYears} سال
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Award className="w-5 h-5 text-gray-500 ml-2" />
                              <span>
                                پروانه وکالت: {lawyerProfile.license.type}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Award className="w-5 h-5 text-gray-500 ml-2" />
                              <span>
                                شماره پروانه: {lawyerProfile.license.licenseNumber}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Star className="w-5 h-5 text-gray-500 ml-2" />
                              <span>
                                امتیاز: {lawyerProfile.rating} ({lawyerProfile.reviewsCount} نظر)
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Award className="w-5 h-5 text-gray-500 ml-2" />
                              <span>
                                پرونده‌های موفق: {lawyerProfile.successfulCases}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4">تخصص‌ها</h3>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {lawyerProfile.specialties.map((specialty, index) => (
                                <div
                                    key={index}
                                    className={`px-3 py-1 rounded-full text-sm ${
                                        index === 0
                                            ? 'bg-[#ca2a30] text-white'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}
                                >
                                  {index === 0 ? 'اصلی: ' : 'فرعی: '}
                                  {getSpecialtyTitle(specialty)}
                                </div>
                            ))}
                          </div>

                          <h3 className="text-lg font-semibold mb-4">مهارت‌ها</h3>
                          <div className="flex flex-wrap gap-2">
                            {lawyerProfile.skills.map((skill, index) => (
                                <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                  {getSkillTitle(skill)}
                                </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {lawyerProfile.about && (
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">درباره من</h3>
                            <p className="text-gray-700 leading-relaxed">{lawyerProfile.about}</p>
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
  );
}