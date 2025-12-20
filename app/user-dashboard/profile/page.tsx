"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import { User, Mail, Phone, MapPin, Edit, Camera } from "lucide-react";
import { useAuth, useUpdateUser } from "@/lib/api/useApi";
import Image from "next/image";

export default function UserProfilePage() {
    const { user: currentUser } = useAuth();
    const updateUser = useUpdateUser();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        lastName: currentUser?.lastName || '',
        mobile: currentUser?.mobile || '',
        phone: currentUser?.phone || '',
        province: currentUser?.province || '',
        city: currentUser?.city || '',
        address: currentUser?.address || '',
        about: currentUser?.about || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        if (currentUser) {
            updateUser.mutate({
                userId: currentUser.id,
                userData: formData
            });
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: currentUser?.name || '',
            lastName: currentUser?.lastName || '',
            mobile: currentUser?.mobile || '',
            phone: currentUser?.phone || '',
            province: currentUser?.province || '',
            city: currentUser?.city || '',
            address: currentUser?.address || '',
            about: currentUser?.about || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">پروفایل کاربری</h1>
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#ca2a30] hover:bg-[#b02529]"
                    >
                        <Edit className="w-4 h-4 ml-1" />
                        ویرایش پروفایل
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-[#ca2a30]" />
                        اطلاعات شخصی
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* بخش تصویر پروفایل */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {currentUser?.profileImage ? (
                                    <Image
                                        src={currentUser.profileImage}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#ca2a30] flex items-center justify-center text-white">
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div>
                            <div className="text-lg font-medium">
                                {currentUser?.name} {currentUser?.lastName}
                            </div>

                        </div>
                    </div>

                    {/* فرم اطلاعات */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            ) : (
                                <div className="p-2 bg-gray-50 rounded-md">{currentUser?.name}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            ) : (
                                <div className="p-2 bg-gray-50 rounded-md">{currentUser?.lastName}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">موبایل</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            ) : (
                                <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {currentUser?.mobile}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تلفن</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            ) : (
                                <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {currentUser?.phone || 'ثبت نشده'}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">استان</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            ) : (
                                <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {currentUser?.province || 'ثبت نشده'}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">شهر</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            ) : (
                                <div className="p-2 bg-gray-50 rounded-md">{currentUser?.city || 'ثبت نشده'}</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">آدرس</label>
                        {isEditing ? (
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        ) : (
                            <div className="p-2 bg-gray-50 rounded-md">
                                {currentUser?.address || 'ثبت نشده'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">درباره من</label>
                        {isEditing ? (
                            <textarea
                                name="about"
                                value={formData.about}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        ) : (
                            <div className="p-2 bg-gray-50 rounded-md">
                                {currentUser?.about || 'ثبت نشده'}
                            </div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSave}
                                className="bg-[#ca2a30] hover:bg-[#b02529]"
                                disabled={updateUser.isPending}
                            >
                                {updateUser.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                            </Button>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                            >
                                انصراف
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}