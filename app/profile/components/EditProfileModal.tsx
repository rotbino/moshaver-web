// app/profile/components/EditProfileModal.tsx
'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { FileUploader } from '@/components/common/FileUploader';
import { useUploadFile } from '@/lib/api/apiHooks';
import { setUser } from '@/lib/store/slices/authSlice';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        fullName: string;
        phone: string;
        avatarFile?: { id: string } | null;   // به‌روز شده
        temporaryPassword?: boolean;
    };
    onUpdate: (data: { fullName: string; avatarFileId?: string }) => void;
}

export function EditProfileModal({ isOpen, onClose, user, onUpdate }: EditProfileModalProps) {
    const dispatch = useDispatch();
    const uploadMutation = useUploadFile();

    const [fullName, setFullName] = useState(user.fullName || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // ⭐ مقداردهی با شناسه فایل از avatarFile (نه avatarFileId)
    const [currentAvatarFileId, setCurrentAvatarFileId] = useState<string | undefined>(
        user.avatarFile?.id
    );
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!fullName.trim()) {
            newErrors.fullName = 'نام و نام خانوادگی الزامی است';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setUploadError(null);

        let newAvatarFileId = currentAvatarFileId;

        try {
            if (selectedFile) {
                setIsUploading(true);
                try {
                    const result = await uploadMutation.mutateAsync({
                        file: selectedFile,
                        model: 'User',
                        modelId: user.id,
                        fieldKey: 'avatar',
                    });

                    newAvatarFileId = result.id;
                    setCurrentAvatarFileId(result.id);
                    toast.success('تصویر پروفایل آپلود شد');
                } catch (uploadError: any) {
                    setUploadError(uploadError.message || 'خطا در آپلود تصویر');
                    toast.error(uploadError.message || 'خطا در آپلود تصویر');
                } finally {
                    setIsUploading(false);
                }
            }

            const updateData: { fullName: string; avatarFileId?: string } = {
                fullName: fullName.trim(),
            };

            if (newAvatarFileId) {
                updateData.avatarFileId = newAvatarFileId;
            }

            await onUpdate(updateData);

            // به‌روزرسانی Redux (اکنون avatarFile را می‌توانیم ست کنیم)
            dispatch(setUser({
                ...user,
                fullName: fullName.trim(),
                avatarFile: newAvatarFileId ? { id: newAvatarFileId } : undefined,
            }));

            toast.success('پروفایل با موفقیت به‌روزرسانی شد');
            onClose();
        } catch (error: any) {
            toast.error(error?.message || 'خطا در به‌روزرسانی پروفایل');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface w-full max-w-md border border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-outline-variant sticky top-0 bg-surface z-10">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">ویرایش پروفایل</h3>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="flex flex-col items-center gap-3">
                        <FileUploader
                            value={currentAvatarFileId}
                            onFileSelect={(file) => setSelectedFile(file)}
                            onRemove={() => {
                                setSelectedFile(null);
                                setCurrentAvatarFileId(undefined);
                            }}
                            rounded={true}
                            width={120}
                            height={120}
                            error={uploadError || undefined}
                            disabled={isLoading}
                        />
                        <p className="text-[10px] text-on-surface-variant">
                            {selectedFile ? 'تصویر جدید انتخاب شد' :
                                currentAvatarFileId ? 'تصویر با موفقیت آپلود شد' :
                                    'برای تغییر تصویر کلیک کنید'}
                        </p>
                        {uploadError && <p className="text-[10px] text-error">{uploadError}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md text-on-surface-variant">
                            نام و نام خانوادگی <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value);
                                if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                            }}
                            placeholder="نام خود را وارد کنید"
                            className={`w-full bg-surface-container-lowest border h-12 px-4 font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all ${
                                errors.fullName ? 'border-error' : 'border-outline'
                            }`}
                        />
                        {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-label-md text-label-md text-on-surface-variant">شماره موبایل</label>
                        <div className="w-full bg-surface-container border h-12 px-4 font-body-md text-right flex items-center text-on-surface-variant">
                            {user.phone}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-outline-variant">
                        <button type="button" onClick={onClose} className="flex-1 h-12 border border-outline text-on-surface hover:bg-surface-container-low transition-colors font-label-md">
                            انصراف
                        </button>
                        <button type="submit" disabled={isLoading} className="flex-1 h-12 bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md disabled:opacity-50">
                            {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}