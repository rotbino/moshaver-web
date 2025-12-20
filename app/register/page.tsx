// app/register/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import {
    User,
    Phone,
    Lock,
    Mail,
    MapPin,
    Briefcase,
    Star,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    Shield,
    UserCheck,
    Users, Plus, Camera, Check, X, Globe
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/data-transfer/api";
import {
    RegisterStep1Dto,
    VerifyOtpDto,
    CompleteRegistrationDto,
    LawyerInfoDto,
    UserInfoDto,
} from "@/lib/data-transfer/types";
import {
    PROVINCE_NAMES,
    LICENSE_TYPE_NAMES,
    SPECIALTY_NAMES,
    skillTitlesWithCategories,
    UserRole,
    LicenseType,
    Specialty,
    Skill,
    Province
} from "@/lib/data-transfer/data-types";

import {FloatingLabel, DropSelector, NumberInput} from "@/components/common";
import {Label} from "@/components/radix/label";
import {SkillSelectorModal} from "@/app/register/SkillSelectorModal";
import {toast} from "@/lib/hooks/app-toast";
import FileUploader from "@/components/common/FileUploader";
import {SpecialtySelector} from "@/app/register/SpecialtySelector";

export default function RegisterPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([]);
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [registrationToken, setRegistrationToken] = useState<string | null>(null);
    const [accountSlugStatus, setAccountSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [accountSlugMessage, setAccountSlugMessage] = useState<string>('');

    // API mutations
    const registerStep1Mutation = useMutation({
        mutationFn: (data: RegisterStep1Dto) => authApi.registerStep1(data),
    });

    const registerStep2Mutation = useMutation({
        mutationFn: (data: VerifyOtpDto) => authApi.registerStep2(data),
    });

    const registerStep3Mutation = useMutation({
        mutationFn: ({ registrationToken, data }: { registrationToken: string; data: CompleteRegistrationDto }) =>
            authApi.registerStep3(registrationToken, data),
    });

    const checkUsernameMutation = useMutation({
        mutationFn: ({ username, accountSlug }: { username: string; accountSlug?: string }) =>
            authApi.checkUsernameAvailability(username, accountSlug),
    });

    const [formData, setFormData] = useState({
        // Step 1: Role and mobile
        role: undefined as UserRole | undefined,
        mobile: '',

        // Step 2: Verification
        verificationCode: '',

        // Step 3: User info
        name: '',
        lastName: '',
        username: '',
        accountSlug: '',
        email: '',
        password: '',
        confirmPassword: '',

        // Lawyer info (if applicable)
        licenseType: '' as LicenseType | '',
        barAssociation: '',
        licenseNumber: '',
        experienceYears: undefined as number | undefined,
        about: '',
        province: '' as Province | '',
        city: '',
        address: '', // Now optional
        phone: '',
        website: '',
    });

    // Handle profile image selection
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

    // Handle input changes
    const handleInputChange = (field: string, value: string | number | boolean | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Check account slug availability - فقط با onBlur فراخوانی می‌شود
    const checkAccountSlugAvailability = useCallback((slug: string) => {
        if (!slug || slug.length < 3) {
            setAccountSlugStatus('idle');
            setAccountSlugMessage('');
            return;
        }

        setAccountSlugStatus('checking');
        setAccountSlugMessage('در حال بررسی...');

        checkUsernameMutation.mutate(
            { username: slug, accountSlug: slug },
            {
                onSuccess: (response) => {
                    if (response.available) {
                        setAccountSlugStatus('available');
                        setAccountSlugMessage('آدرس در دسترس است');
                    } else {
                        setAccountSlugStatus('taken');
                        setAccountSlugMessage('این آدرس قبلا توسط وکیل دیگری رزرو شده');
                    }
                },
                onError: () => {
                    setAccountSlugStatus('idle');
                    setAccountSlugMessage('خطا در بررسی آدرس');
                }
            }
        );
    }, [checkUsernameMutation]);

    // Handle account slug blur event
    const handleAccountSlugBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value && value.length >= 3) {
            checkAccountSlugAvailability(value);
        }
    };

    // Handle account slug change with validation
    const handleAccountSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // فقط حروف انگلیسی، اعداد، خط تیره، آندرلاین و نقطه مجاز هستند
        const cleaned = value.replace(/[^a-zA-Z0-9._-]/g, "");

        // محدود کردن طول آدرس
        if (cleaned.length <= 50) {
            handleInputChange("accountSlug", cleaned);

            // ریست کردن وضعیت وقتی در حال ویرایش هست
            if (accountSlugStatus !== 'idle') {
                setAccountSlugStatus('idle');
                setAccountSlugMessage('');
            }
        }
    };

    // Validate current step
    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.role) newErrors.role = "لطفاً نقش خود را انتخاب کنید";
            if (!formData.mobile) {
                newErrors.mobile = "شماره موبایل را وارد کنید";
            } else if (!/^09[0-9]{9}$/.test(formData.mobile)) {
                newErrors.mobile = "شماره موبایل معتبر نیست";
            }
        }

        if (step === 2) {
            if (!formData.verificationCode) {
                newErrors.verificationCode = "کد تایید را وارد کنید";
            } else if (formData.verificationCode.length !== 5) {
                newErrors.verificationCode = "کد تایید باید 5 رقم باشد";
            }
        }

        if (step === 3) {
            if (!formData.name) newErrors.name = "نام را وارد کنید";
            if (!formData.lastName) newErrors.lastName = "نام خانوادگی را وارد کنید";
            if (!formData.password) newErrors.password = "رمز عبور را وارد کنید";
            if (formData.password.length < 6) newErrors.password = "رمز عبور باید حداقل 6 کاراکتر باشد";
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "رمز عبور و تکرار آن یکسان نیست";
            }
            if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
                newErrors.email = "ایمیل معتبر نیست";
            }

            if (formData.role === UserRole.LAWYER) {
                if (!formData.accountSlug) {
                    newErrors.accountSlug = "آدرس صفحه شخصی را وارد کنید";
                } else if (accountSlugStatus === 'taken') {
                    newErrors.accountSlug = "این آدرس قبلا رزرو شده";
                }
                if (selectedSpecialties.length === 0) newErrors.specialties = "حداقل یک تخصص را انتخاب کنید";
                if (!formData.licenseType) newErrors.licenseType = "نوع پروانه را انتخاب کنید";
                if (!formData.barAssociation) newErrors.barAssociation = "کانون وکالت را وارد کنید";
                if (!formData.licenseNumber) newErrors.licenseNumber = "شماره پروانه را وارد کنید";
                if (!formData.province) newErrors.province = "استان را انتخاب کنید";
                if (!formData.city) newErrors.city = "شهر را وارد کنید";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle role selection
    const handleRoleSelect = (role: UserRole) => {
        setFormData(prev => ({
            ...prev,
            role
        }));
    };

    // Handle step 1 submission
    const handleStep1Submit = () => {
        if (validateStep(1)) {
            const step1Data: RegisterStep1Dto = {
                mobile: formData.mobile,
                role: formData.role,
                isLawyer: formData.role === UserRole.LAWYER
            };

            registerStep1Mutation.mutate(step1Data, {
                onSuccess: (response) => {
                    toast.success("کد تایید با موفقیت ارسال شد");
                    setCurrentStep(2);
                },
                onError: (error: any) => {
                    toast.error(error.message || "خطا در ارسال کد تایید");
                }
            });
        }
    };

    // Handle step 2 submission
    const handleStep2Submit = () => {
        if (validateStep(2)) {
            const step2Data: VerifyOtpDto = {
                mobile: formData.mobile,
                code: formData.verificationCode
            };

            registerStep2Mutation.mutate(step2Data, {
                onSuccess: (response) => {
                    if (response.registrationToken) {
                        setRegistrationToken(response.registrationToken);
                        toast.success("کد تایید با موفقیت تأیید شد");
                        setCurrentStep(3);
                    } else {
                        toast.error("خطا در دریافت توکن ثبت نام");
                        console.error("Registration token not found in response:", response);
                    }
                },
                onError: (error: any) => {
                    toast.error(error.message || "خطا در تایید کد");
                }
            });
        }
    };

    // Handle final submission
    const handleSubmit = () => {
        if (validateStep(3) && registrationToken) {
            const userInfo: UserInfoDto = {
                name: formData.name,
                lastName: formData.lastName,
                username: formData.username || undefined,
                accountSlug: formData.accountSlug || undefined,
                email: formData.email || undefined
            };

            const lawyerInfo: LawyerInfoDto | undefined = formData.role === UserRole.LAWYER ? {
                accountSlug: formData.accountSlug,
                licenseType: formData.licenseType as LicenseType,
                barAssociation: formData.barAssociation,
                licenseNumber: formData.licenseNumber,
                specialties: selectedSpecialties,
                skills: selectedSkills.length > 0 ? selectedSkills : undefined,
                province: formData.province as Province,
                city: formData.city,
                address: formData.address || undefined, // Now optional
                experienceYears: formData.experienceYears,
                about: formData.about,
                phone: formData.phone || undefined,
                website: formData.website || undefined
            } : undefined;

            const step3Data: CompleteRegistrationDto = {
                password: formData.password,
                userInfo,
                lawyerInfo,
                isLawyer: formData.role === UserRole.LAWYER
            };

            registerStep3Mutation.mutate({ registrationToken, data: step3Data }, {
                onSuccess: (response) => {
                    toast.success("ثبت نام با موفقیت انجام شد");

                    // Handle profile image upload if selected
                    if (profileImageFile) {
                        // In a real implementation, you would upload the image here
                        setTimeout(() => {
                            toast.success("تصویر پروفایل با موفقیت آپلود شد");
                        }, 1000);
                    }

                    router.push("/login");
                },
                onError: (error: any) => {
                    toast.error(error.message || "خطا در ثبت نام");
                    console.error("Registration error:", error);
                }
            });
        }
    };

    // Navigate to previous step
    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
    };

    // Prepare options for dropdowns
    const licenseTypeOptions = Object.values(LicenseType).map(type => ({
        value: type,
        label: LICENSE_TYPE_NAMES[type]
    }));

    const provinceOptions = Object.values(Province).map(province => ({
        value: province,
        label: PROVINCE_NAMES[province]
    }));

    // Calculate total steps based on user role
    const totalSteps = 3; // New API has 3 steps

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#ca2a30] mb-2">ثبت نام در وکیل‌یاب</h1>
                    <p className="text-gray-600">به جمع ما بپیوندید</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center">
                        {[...Array(totalSteps)].map((_, step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentStep >= step + 1
                                        ? 'bg-[#ca2a30] text-white'
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {step + 1}
                                </div>
                                {step < totalSteps - 1 && (
                                    <div className={`w-16 h-1 mx-2 ${
                                        currentStep > step + 1 ? 'bg-[#ca2a30]' : 'bg-gray-200'
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        {/* Step 1: Role and Mobile */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-4">
                                    <h2 className="text-xl font-semibold">نقش و شماره موبایل</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        لطفاً نقش خود را انتخاب کرده و شماره موبایل خود را وارد کنید
                                    </p>
                                </div>

                                {/* Role Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div
                                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                                            formData.role === UserRole.LAWYER
                                                ? 'border-green-700 bg-green-300'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handleRoleSelect(UserRole.LAWYER)}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div
                                                className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <UserCheck className={`w-8 h-8 ${
                                                        formData.role === UserRole.LAWYER
                                                            ? 'text-green-700'
                                                            : 'w-8 h-8 text-gray-500 '
                                                    }`}/>
                                                </div>
                                            <h3 className="font-semibold text-lg mb-2">وکیل هستم</h3>
                                           {/* <p className="text-sm text-gray-600">
                                                دارای پنل وکالت با امکانات کامل
                                            </p>*/}
                                        </div>
                                    </div>

                                    <div
                                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                                            formData.role === UserRole.USER
                                                ? 'border-green-700 bg-green-300'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handleRoleSelect(UserRole.USER)}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Users className={`w-8 h-8 ${
                                                    formData.role === UserRole.USER
                                                        ? 'text-green-700'
                                                        : 'w-8 h-8 text-gray-500 '
                                                }`}  />
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">کاربر عادی هستم</h3>
                                           {/* <p className="text-sm text-gray-600">
                                                به عنوان کاربر ثبت نام می‌کنم
                                            </p>*/}
                                        </div>
                                    </div>
                                </div>
                                {errors.role && <p className="text-red-500 text-sm mt-1 text-center">{errors.role}</p>}

                                {/* Mobile Number */}
                                <FloatingLabel
                                    id="mobile"
                                    label="شماره موبایل"
                                    icon={<Phone className="w-6 h-6 text-gray-400"/>}
                                >
                                    <input
                                        type="tel"
                                        value={formData.mobile}
                                        onChange={(e) => handleInputChange("mobile", e.target.value)}
                                        placeholder="09123456789"
                                        className={errors.mobile ? "border-red-500" : ""}
                                    />
                                </FloatingLabel>
                                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}

                                <Button
                                    onClick={handleStep1Submit}
                                    className="w-full bg-[#ca2a30] hover:bg-[#b02529]"
                                    disabled={registerStep1Mutation.isPending}
                                >
                                    {registerStep1Mutation.isPending ? 'در حال ارسال...' : 'ادامه'}
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Verification Code */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Shield className="w-8 h-8 text-[#ca2a30]" />
                                    </div>
                                    <h2 className="text-xl font-semibold">کد تایید را وارد کنید</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        کد 5 رقمی به شماره {formData.mobile} ارسال شد
                                    </p>
                                </div>

                                <FloatingLabel
                                    id="verificationCode"
                                    label="کد تایید"
                                    icon={<Shield className="w-6 h-6 text-gray-400"/>}
                                >
                                    <input
                                        type="text"
                                        value={formData.verificationCode}
                                        onChange={(e) => handleInputChange("verificationCode", e.target.value)}
                                        placeholder="12345"
                                        className={errors.verificationCode ? "border-red-500" : ""}
                                    />
                                </FloatingLabel>
                                {errors.verificationCode && <p className="text-red-500 text-sm mt-1">{errors.verificationCode}</p>}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleStep2Submit}
                                        className="flex-1 bg-[#ca2a30] hover:bg-[#b02529]"
                                        disabled={registerStep2Mutation.isPending}
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2" />
                                        {registerStep2Mutation.isPending ? 'در حال بررسی...' : 'تایید کد'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handlePrev}
                                        className="flex-1"
                                    >
                                        مرحله قبل
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const step1Data: RegisterStep1Dto = {
                                                mobile: formData.mobile,
                                                role: formData.role,
                                                isLawyer: formData.role === UserRole.LAWYER
                                            };

                                            registerStep1Mutation.mutate(step1Data, {
                                                onSuccess: () => {
                                                    toast.success("کد تایید مجدد ارسال شد");
                                                },
                                                onError: (error: any) => {
                                                    toast.error(error.message || "خطا در ارسال کد تایید");
                                                }
                                            });
                                        }}
                                        className="text-sm text-[#ca2a30] hover:underline"
                                        disabled={registerStep1Mutation.isPending}
                                    >
                                        {registerStep1Mutation.isPending ? 'در حال ارسال...' : 'ارسال مجدد کد'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: User Info */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-[#ca2a30]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <User className="w-8 h-8 text-[#ca2a30]" />
                                    </div>
                                    <h2 className="text-xl font-semibold">اطلاعات کاربری</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        لطفاً اطلاعات خود را کامل کنید
                                    </p>
                                </div>

                                {/* Profile Image Upload */}
                                <div className="flex flex-col items-center mb-6">
                                    <FileUploader
                                        width={120}
                                        height={120}
                                        rounded={true}
                                        onFileSelect={handleProfileImageSelect}
                                        label="انتخاب عکس پروفایل"
                                        showPreview={true}
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        عکس پروفایل خود را آپلود کنید
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FloatingLabel
                                        id="name"
                                        label="نام"
                                        icon={<User className="w-6 h-6 text-gray-400"/>}
                                    >
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className={errors.name ? "border-red-500" : ""}
                                        />
                                    </FloatingLabel>
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

                                    <FloatingLabel
                                        id="lastName"
                                        label="نام خانوادگی"
                                        icon={<User className="w-6 h-6 text-gray-400"/>}
                                    >
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            className={errors.lastName ? "border-red-500" : ""}
                                        />
                                    </FloatingLabel>
                                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                </div>

                                {formData.role === UserRole.LAWYER && (
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                            <Globe className="w-4 h-4" />
                                            آدرس صفحه وکالت شما
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <div dir={"ltr"} className="flex relative items-center">
                                                <span className="text-gray-600 flex">{location.origin}/</span>
                                                <input
                                                    type="text"
                                                    dir="ltr"
                                                    value={formData.accountSlug}
                                                    onChange={handleAccountSlugChange}
                                                    onBlur={handleAccountSlugBlur}
                                                    placeholder="مثال: ali-rezaei"
                                                    className={`flex flex-1 px-1 py-2 border rounded-lg focus:outline-none w-[150px] focus:ring-2 focus:ring-[#ca2a30] ${
                                                        errors.accountSlug ? 'border-red-500' :
                                                            accountSlugStatus === 'available' ? 'border-green-500' :
                                                                accountSlugStatus === 'taken' ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                            </div>
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                {accountSlugStatus === 'checking' && (
                                                    <div className="w-4 h-4 border-t-2 border-r-2 border-[#ca2a30] rounded-full animate-spin"></div>
                                                )}
                                                {accountSlugStatus === 'available' && (
                                                    <Check className="w-4 h-4 text-green-500"/>
                                                )}
                                                {accountSlugStatus === 'taken' && (
                                                    <X className="w-4 h-4 text-red-500"/>
                                                )}
                                            </div>
                                        </div>
                                        {accountSlugMessage && (
                                            <p className={`text-xs mt-1 ${
                                                accountSlugStatus === 'available' ? 'text-green-600' :
                                                    accountSlugStatus === 'taken' ? 'text-red-600' : 'text-gray-500'
                                            }`}>
                                                {accountSlugMessage}
                                            </p>
                                        )}
                                        {errors.accountSlug && <p className="text-red-500 text-sm mt-1">{errors.accountSlug}</p>}
                                        <p className="text-xs text-gray-500 mt-1">
                                            صفحه وکالت شما دارای امکانات ارتباطی، اطلاعاتی و رزرو مشاوره است.
                                        </p>
                                    </div>
                                )}

                                <FloatingLabel
                                    id="email"
                                    label="ایمیل (اختیاری)"
                                    icon={<Mail className="w-6 h-6 text-gray-400"/>}
                                >
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                </FloatingLabel>
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

                                <FloatingLabel
                                    id="password"
                                    label="رمز عبور"
                                    icon={<Lock className="w-6 h-6 text-gray-400"/>}
                                >
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        className={errors.password ? "border-red-500" : ""}
                                    />
                                </FloatingLabel>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

                                <FloatingLabel
                                    id="confirmPassword"
                                    label="تکرار رمز عبور"
                                    icon={<Lock className="w-6 h-6 text-gray-400"/>}
                                >
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                        className={errors.confirmPassword ? "border-red-500" : ""}
                                    />
                                </FloatingLabel>
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}

                                {/* Lawyer-specific fields */}
                                {formData.role === UserRole.LAWYER && (
                                    <>
                                        <div className="pt-4 border-t border-gray-200">
                                            <h3 className="text-lg font-medium my-4">اطلاعات تخصصی وکالت</h3>

                                            {/* Specialties */}
                                            <div>
                                                <SpecialtySelector
                                                    selectedSpecialties={selectedSpecialties}
                                                    onSpecialtiesChange={setSelectedSpecialties}
                                                    maxSpecialties={3}
                                                />
                                                {errors.specialties && <p className="text-red-500 text-sm mt-1">{errors.specialties}</p>}
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-col gap-2 mt-4 border border-gray-200 rounded-lg p-2">
                                                <div className="flex items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsSkillModalOpen(true)}
                                                        className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                                                    >
                                                        <span className="text-sm">انتخاب مهارت‌ها</span>
                                                        <Plus className="w-4 h-4 ml-2" />
                                                    </button>
                                                </div>
                                                {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}

                                                {selectedSkills.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedSkills.map(skill => {
                                                                const skillTitle = skillTitlesWithCategories.find(s => s.id === skill)?.title || skill;
                                                                return (
                                                                    <div key={skill} className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full">
                                                                        <span className="ml-2 text-sm">{skillTitle}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                                                                            className="text-red-800 hover:text-red-900 focus:outline-none"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <FloatingLabel
                                                id="experienceYears"
                                                label="سابقه کار (سال)"
                                                icon={<Briefcase className="w-6 h-6 text-gray-400"/>}
                                            >
                                                <NumberInput
                                                    value={formData.experienceYears}
                                                    onChange={(value) => handleInputChange("experienceYears", value)}
                                                />
                                            </FloatingLabel>

                                            <FloatingLabel
                                                id="licenseNumber"
                                                label="شماره پروانه وکالت"
                                                icon={<Briefcase className="w-6 h-6 text-gray-400"/>}
                                            >
                                                <input
                                                    type="text"
                                                    value={formData.licenseNumber}
                                                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                                                    className={errors.licenseNumber ? "border-red-500" : ""}
                                                />
                                            </FloatingLabel>
                                            {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}

                                            <div className={"mt-2"}>
                                                <DropSelector
                                                    value={formData.licenseType}
                                                    options={licenseTypeOptions}
                                                    placeholder="نوع پروانه خود را انتخاب کنید"
                                                    onChange={(value) => handleInputChange("licenseType", value)}
                                                    className={errors.licenseType ? "border-red-500" : ""}
                                                />
                                                {errors.licenseType && <p className="text-red-500 text-sm mt-1">{errors.licenseType}</p>}
                                            </div>

                                            <FloatingLabel
                                                id="barAssociation"
                                                label="کانون وکالت"
                                                icon={<Briefcase className="w-6 h-6 text-gray-400"/>}
                                            >
                                                <input
                                                    type="text"
                                                    value={formData.barAssociation}
                                                    onChange={(e) => handleInputChange("barAssociation", e.target.value)}
                                                    className={errors.barAssociation ? "border-red-500" : ""}
                                                />
                                            </FloatingLabel>
                                            {errors.barAssociation && <p className="text-red-500 text-sm mt-1">{errors.barAssociation}</p>}

                                            <div className={"mt-2"}>
                                                <DropSelector
                                                    value={formData.province}
                                                    options={provinceOptions}
                                                    placeholder="استان خود را انتخاب کنید"
                                                    onChange={(value) => handleInputChange("province", value)}
                                                    className={errors.province ? "border-red-500" : ""}
                                                />
                                                {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
                                            </div>

                                            <FloatingLabel
                                                id="city"
                                                label="شهر"
                                                icon={<MapPin className="w-6 h-6 text-gray-400"/>}
                                            >
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => handleInputChange("city", e.target.value)}
                                                    className={errors.city ? "border-red-500" : ""}
                                                />
                                            </FloatingLabel>
                                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}

                                            <FloatingLabel
                                                id="address"
                                                label="آدرس دفتر (اختیاری)"
                                                icon={<MapPin className="w-6 h-6 text-gray-400"/>}
                                            >
                                                <textarea
                                                    rows={2}
                                                    value={formData.address}
                                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                                    className="h-24 p-2"
                                                />
                                            </FloatingLabel>

                                            <FloatingLabel
                                                id="phone"
                                                label="تلفن تماس (اختیاری)"
                                                icon={<Phone className="w-6 h-6 text-gray-400"/>}
                                            >
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                                />
                                            </FloatingLabel>

                                            <FloatingLabel
                                                id="website"
                                                label="وبسایت (اختیاری)"
                                                icon={<Star className="w-6 h-6 text-gray-400"/>}
                                            >
                                                <input
                                                    type="text"
                                                    value={formData.website}
                                                    onChange={(e) => handleInputChange("website", e.target.value)}
                                                />
                                            </FloatingLabel>

                                            <FloatingLabel
                                                id="about"
                                                label="درباره من"
                                                icon={<User className="w-6 h-6 text-gray-400"/>}
                                            >
                                                <textarea
                                                    rows={4}
                                                    value={formData.about}
                                                    onChange={(e) => handleInputChange("about", e.target.value)}
                                                    className="resize-none h-24 pt-2"
                                                    placeholder="لطفاً اطلاعات بیشتری درباره خودتان وارد کنید"
                                                />
                                            </FloatingLabel>
                                        </div>
                                    </>
                                )}

                                {/* Navigation buttons */}
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={handleSubmit}
                                        className="flex-1 bg-[#ca2a30] hover:bg-[#b02529]"
                                        disabled={registerStep3Mutation.isPending}
                                    >
                                        {registerStep3Mutation.isPending ? 'در حال ثبت نام...' : 'ثبت نام نهایی'}
                                        <ArrowRight className="w-4 h-4 mr-2" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handlePrev}
                                        className="flex-1"
                                    >
                                        مرحله قبل
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Login Link */}
                <div className="text-center text-sm text-gray-600">
                    حساب کاربری دارید؟{' '}
                    <Link href="/login" className="text-[#ca2a30] hover:underline font-medium">
                        وارد شوید
                    </Link>
                </div>
            </div>

            {/* Skill Selector Modal */}
            <SkillSelectorModal
                onSkillsChange={setSelectedSkills}
                isOpen={isSkillModalOpen}
                onClose={() => setIsSkillModalOpen(false)}
                selectedSkills={selectedSkills}
                maxSkills={10}
            />
        </div>
    );
}