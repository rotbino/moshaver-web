// app/profile/edit/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { FloatingLabel, DropSelector, NumberInput } from '@/components/common';
import {ArrowLeft, Save, User, Briefcase, MapPin, Phone, Mail, Plus, X} from 'lucide-react';
import { useProfile, useUpdateUserProfile, useUpdateLawyerProfile, useUploadProfileImage, useAuth, useSkills, useSpecialties } from '@/lib/data-service/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUploader from '@/components/common/FileUploader';
import { toast } from '@/lib/hooks/app-toast';
import { provincesData, licenseTypes } from '@/lib/data-service/mockData';
import { UserRole, ApiError, Lawyer, Specialty, Skill } from '@/lib/data-service/types';
import { SkillSelectorModal } from "@/app/register/SkillSelectorModal";
import {SpecialtySelector} from "@/app/register/SpecialtySelector";


export default function EditProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState<any>({});
    const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([]);
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // هوک‌ها
    const { data: profile, isLoading } = useProfile(user?.id || '');
    const updateUserProfile = useUpdateUserProfile();
    const updateLawyerProfile = useUpdateLawyerProfile();
    const uploadProfileImage = useUploadProfileImage();
    const { data: skillsData } = useSkills();
    const { data: specialtiesData } = useSpecialties();

    // اگر کاربر وارد نشده باشد، به صفحه لاگین هدایت شود
    if (!isAuthenticated || !user) {
        router.push('/login');
        return null;
    }

    // پر کردن فرم با اطلاعات پروفایل
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                lastName: profile.lastName,
                email: profile.email || '',
                mobile: profile.mobile,
                ...(profile.role === UserRole.LAWYER && {
                    experienceYears: (profile as Lawyer).experienceYears,
                    licenseNumber: (profile as Lawyer).license.licenseNumber,
                    licenseType: (profile as Lawyer).license.type,
                    about: (profile as Lawyer).about || '',
                    province: (profile as Lawyer).location?.province || '',
                    provinceCode: (profile as Lawyer).location?.provinceCode || '',
                    city: (profile as Lawyer).location?.city || '',
                    cityCode: (profile as Lawyer).location?.cityCode || '',
                    address: (profile as Lawyer).location?.address || '',
                    phone: (profile as Lawyer).contact?.phone || '',
                    consultationFee: (profile as Lawyer).consultationPricing?.[0]?.inPersonPrice || 0,
                })
            });

            if (profile.role === UserRole.LAWYER) {
                setSelectedSkills((profile as Lawyer).skills || []);
                setSelectedSpecialties((profile as Lawyer).specialties || []);
            }

            if (profile.profileImage) {
                setProfileImagePreview(profile.profileImage);
            }
        }
    }, [profile]);

    const handleProfileImageSelect = (file: File | null) => {
        setProfileImageFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setProfileImagePreview(null);
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // پاک کردن خطا برای این فیلد
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) newErrors.name = "نام را وارد کنید";
        if (!formData.lastName) newErrors.lastName = "نام خانوادگی را وارد کنید";

        if (user.role === UserRole.LAWYER) {
            if (!formData.experienceYears) newErrors.experienceYears = "سابقه کار را وارد کنید";
            if (!formData.licenseNumber) newErrors.licenseNumber = "شماره پروانه را وارد کنید";
            if (!formData.licenseType) newErrors.licenseType = "نوع پروانه را انتخاب کنید";
            if (!formData.province) newErrors.province = "استان را انتخاب کنید";
            if (!formData.city) newErrors.city = "شهر را انتخاب کنید";
            if (!formData.address) newErrors.address = "آدرس را وارد کنید";
            if (!formData.consultationFee) newErrors.consultationFee = "هزینه مشاوره را وارد کنید";
            if (selectedSkills.length === 0) newErrors.skills = "حداقل یک مهارت را انتخاب کنید";
            if (selectedSpecialties.length === 0) newErrors.specialties = "حداقل یک تخصص را انتخاب کنید";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // آپلود تصویر پروفایل
    const handleImageUpload = async (file: File) => {
        try {
            const response = await uploadProfileImage.mutateAsync({
                userId: user.id,
                file
            });

            // در واقعیت اینجا باید آیدی فایل در پروفایل کاربر ذخیره شود
            setProfileImageFile(file);
            setProfileImagePreview(URL.createObjectURL(file));
            toast.success("تصویر پروفایل با موفقیت آپلود شد");
        } catch (err: any) {
            toast.error(err.message || "خطا در آپلود تصویر پروفایل");
        }
    };

    // حذف تصویر پروفایل
    const handleImageDelete = () => {
        setProfileImageFile(null);
        setProfileImagePreview(null);
        toast.success("تصویر پروفایل با موفقیت حذف شد");
    };

    // ذخیره تغییرات
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("لطفاً تمام فیلدهای الزامی را تکمیل کنید");
            return;
        }

        try {
            if (user.role === UserRole.LAWYER) {
                await updateLawyerProfile.mutateAsync({
                    userId: user.id,
                    lawyerData: {
                        ...formData,
                        skills: selectedSkills,
                        specialties: selectedSpecialties,
                        profileImage: profileImagePreview,
                        location: {
                            province: formData.province,
                            provinceCode: formData.provinceCode,
                            city: formData.city,
                            cityCode: formData.cityCode,
                            address: formData.address
                        },
                        contact: {
                            phone: formData.phone,
                            mobile: formData.mobile,
                            email: formData.email
                        },
                        consultationPricing: [
                            {
                                id: 'cp1',
                                duration: '15min',
                                inPersonPrice: formData.consultationFee,
                                phonePrice: Math.round(formData.consultationFee * 0.8),
                                videoPrice: Math.round(formData.consultationFee * 0.9),
                                textChatPrice: Math.round(formData.consultationFee * 0.7),
                                isActive: true
                            }
                        ]
                    }
                });
            } else {
                await updateUserProfile.mutateAsync({
                    userId: user.id,
                    userData: {
                        ...formData,
                        profileImage: profileImagePreview
                    }
                });
            }

            toast.success("پروفایل با موفقیت به‌روزرسانی شد");
            router.push('/profile');
        } catch (err: any) {
            toast.error(err.message || "خطا در به‌روزرسانی پروفایل");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Save className="w-8 h-8 text-[#ca2a30] animate-pulse" />
                    </div>
                    <p className="text-gray-600">در حال بارگذاری اطلاعات پروفایل...</p>
                </div>
            </div>
        );
    }

    const isLawyer = user.role === UserRole.LAWYER;

    // آماده‌سازی گزینه‌ها برای DropSelector
    const provinceOptions = provincesData.map(province => ({
        value: province.id,
        label: province.name
    }));

    const licenseTypeOptions = licenseTypes.map(type => ({
        value: type.id,
        label: type.title
    }));

    const selectedProvince = provincesData.find(p => p.id === formData.province);
    const cityOptions = selectedProvince?.cities.map(city => ({
        value: city.id,
        label: city.name
    })) || [];

    // تابع کمکی برای دریافت عنوان مهارت
    const getSkillTitle = (skill: Skill) => {
        return skillsData?.find(s => s.id === skill)?.title || skill;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-[#ca2a30]/10 p-3 rounded-full">
                                <User className="w-8 h-8 text-[#ca2a30] "/>
                            </div>
                            <div>
                                <h1 className="text-3xl px-3 font-bold text-[#ca2a30]">ویرایش پروفایل</h1>
                            </div>
                        </div>

                        <Link href="/profile" className="mr-4">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Image */}
                            <div className="flex flex-col items-center">
                                <FileUploader
                                    width={150}
                                    height={150}
                                    rounded={true}
                                    onFileSelect={handleProfileImageSelect}
                                    value={profileImagePreview}
                                    label="انتخاب تصویر پروفایل"
                                    showPreview={true}
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    تصویر پروفایل خود را آپلود کنید
                                </p>
                            </div>

                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-[#ca2a30]" />
                                    اطلاعات شخصی
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FloatingLabel
                                        id="name"
                                        label="نام"
                                        error={errors.name}
                                    >
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            required
                                        />
                                    </FloatingLabel>

                                    <FloatingLabel
                                        id="lastName"
                                        label="نام خانوادگی"
                                        error={errors.lastName}
                                    >
                                        <input
                                            type="text"
                                            value={formData.lastName || ''}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            required
                                        />
                                    </FloatingLabel>

                                    <FloatingLabel
                                        id="email"
                                        label="ایمیل"
                                    >
                                        <input
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                        />
                                    </FloatingLabel>

                                    <FloatingLabel
                                        id="mobile"
                                        label="موبایل"
                                    >
                                        <input
                                            type="tel"
                                            value={formData.mobile || ''}
                                            onChange={(e) => handleInputChange("mobile", e.target.value)}
                                            disabled
                                        />
                                    </FloatingLabel>
                                </div>
                            </div>

                            {/* Professional Information (for lawyers) */}
                            {isLawyer && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-[#ca2a30]" />
                                        اطلاعات حرفه‌ای
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FloatingLabel
                                            id="experienceYears"
                                            label="سابقه کار (سال)"
                                            error={errors.experienceYears}
                                        >
                                            <NumberInput
                                                value={formData.experienceYears || 0}
                                                onChange={(value) => handleInputChange("experienceYears", value)}
                                            />
                                        </FloatingLabel>

                                        <FloatingLabel
                                            id="licenseNumber"
                                            label="شماره پروانه وکالت"
                                            error={errors.licenseNumber}
                                        >
                                            <input
                                                type="text"
                                                value={formData.licenseNumber || ''}
                                                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                                            />
                                        </FloatingLabel>

                                        <div>
                                            <label className="block text-gray-700 mb-2">نوع پروانه وکالت</label>
                                            <DropSelector
                                                value={formData.licenseType || ''}
                                                options={licenseTypeOptions}
                                                placeholder="نوع پروانه خود را انتخاب کنید"
                                                onChange={(value) => handleInputChange("licenseType", value)}
                                                error={errors.licenseType}
                                            />
                                        </div>

                                        <FloatingLabel
                                            id="consultationFee"
                                            label="هزینه مشاوره (تومان)"
                                            error={errors.consultationFee}
                                        >
                                            <NumberInput
                                                value={formData.consultationFee || 0}
                                                onChange={(value) => handleInputChange("consultationFee", value)}
                                            />
                                        </FloatingLabel>

                                        <div>
                                            <label className="block text-gray-700 mb-2">استان</label>
                                            <DropSelector
                                                value={formData.province || ''}
                                                options={provinceOptions}
                                                placeholder="استان خود را انتخاب کنید"
                                                onChange={(value, option) => {
                                                    handleInputChange("province", value);
                                                    handleInputChange("provinceCode", provincesData.find(p => p.id === value)?.code || '');
                                                    handleInputChange("city", '');
                                                    handleInputChange("cityCode", '');
                                                }}
                                                error={errors.province}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 mb-2">شهر</label>
                                            <DropSelector
                                                value={formData.cityCode || ''}
                                                options={cityOptions}
                                                placeholder="شهر خود را انتخاب کنید"
                                                onChange={(value, option) => {
                                                    handleInputChange("city", option.label);
                                                    handleInputChange("cityCode", value);
                                                }}
                                                error={errors.city}
                                                disabled={!formData.province}
                                            />
                                        </div>

                                        <FloatingLabel
                                            id="phone"
                                            label="تلفن تماس"
                                        >
                                            <input
                                                type="tel"
                                                value={formData.phone || ''}
                                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                            />
                                        </FloatingLabel>

                                        <div className="md:col-span-2">
                                            <FloatingLabel
                                                id="address"
                                                label="آدرس"
                                                error={errors.address}
                                            >
                                                <textarea
                                                    rows={3}
                                                    value={formData.address || ''}
                                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </FloatingLabel>
                                        </div>

                                        <div className="md:col-span-2 h-42">
                                            <FloatingLabel
                                                id="about"
                                                label="درباره من"
                                            >
                                                <textarea
                                                    rows={5}
                                                    value={formData.about || ''}
                                                    onChange={(e) => handleInputChange("about", e.target.value)}
                                                    className="w-full h-40 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </FloatingLabel>
                                        </div>

                                        {/* Specialties */}
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 mb-2">تخصص‌ها</label>
                                            <SpecialtySelector
                                                selectedSpecialties={selectedSpecialties}
                                                onSpecialtiesChange={setSelectedSpecialties}
                                                maxSpecialties={3}
                                            />
                                            {errors.specialties && <p className="text-red-500 text-sm mt-1">{errors.specialties}</p>}
                                        </div>

                                        {/* Skills */}
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 mb-2">مهارت‌ها</label>
                                            <div className="flex flex-col gap-2 border border-gray-200 rounded-lg p-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSkillModalOpen(true)}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 w-full"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span className="text-sm">انتخاب مهارت‌ها</span>
                                                </button>

                                                {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}

                                                {/* Selected skills display */}
                                                {selectedSkills.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedSkills.map(skill => (
                                                                <div key={skill} className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full">
                                                                    <span className="ml-2 text-sm">{getSkillTitle(skill)}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                                                                        className="text-red-800 hover:text-red-900 focus:outline-none"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="bg-[#ca2a30] hover:bg-[#b02529]"
                                    disabled={updateUserProfile.isPending || updateLawyerProfile.isPending}
                                >
                                    {updateUserProfile.isPending || updateLawyerProfile.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin ml-2"></div>
                                            در حال ذخیره...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 ml-2" />
                                            ذخیره تغییرات
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Skill Selector Modal */}
            <SkillSelectorModal
                isOpen={isSkillModalOpen}
                onClose={() => setIsSkillModalOpen(false)}
                selectedSkills={selectedSkills}
                onSkillsChange={setSelectedSkills}
                maxSkills={10}
            />
        </div>
    );
}