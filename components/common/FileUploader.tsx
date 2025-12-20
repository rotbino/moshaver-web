// components/common/FileUploader.tsx

import React, { useRef, useState, useCallback, useEffect } from "react";
import { UploadCloud, X } from "lucide-react";
import { getMainFilePath } from "@/lib/utils/utils";

export interface SimpleFileUploaderProps {
    width?: number;
    height?: number;
    className?: string;
    accept?: string;
    label?: string;
    value?: string | null;
    disabled?: boolean;
    showPreview?: boolean;
    rounded?: boolean;
    onFileSelect: (file: File | null) => void;
}

const FileUploader: React.FC<SimpleFileUploaderProps> = ({
                                                             width = 200,
                                                             height = 200,
                                                             className = "",
                                                             accept = "image/*",
                                                             label = "انتخاب فایل",
                                                             value,
                                                             disabled = false,
                                                             showPreview = true,
                                                             rounded = true,
                                                             onFileSelect,
                                                         }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // به‌روزرسانی پیش‌نمایش هنگام تغییر value
    useEffect(() => {
        if (value) {
            setPreview(getMainFilePath(value));
        } else if (!selectedFile) {
            setPreview(null);
        }
    }, [value, selectedFile]);

    // ایجاد پیش‌نمایش برای فایل انتخاب شده
    const createPreview = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    // انتخاب فایل از سیستم
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        onFileSelect(file);

        if (showPreview) {
            createPreview(file);
        }
    }, [disabled, onFileSelect, showPreview, createPreview]);

    const triggerFileSelect = () => {
        if (disabled) return;
        fileInputRef.current?.click();
    };

    const handleClearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreview(null);
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div
                className={`bg-white shadow-md ${rounded ? 'rounded-full' : ''} flex flex-col items-center justify-center p-2 relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 
                transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ width, height }}
                onClick={triggerFileSelect}
            >
                {/* ورودی فایل همیشه در DOM وجود دارد */}
                <input
                    type="file"
                    accept={accept}
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={disabled}
                />

                {/* نمایش پیش‌نمایش */}
                {preview ? (
                    <div className="w-full h-full">
                        {showPreview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className={`w-full h-full ${rounded ? 'rounded-full' : ''} object-cover`}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full">
                                <span className="text-xs text-gray-500 text-center px-2">
                                    {selectedFile?.name || 'فایل انتخاب شده'}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                        <UploadCloud size={32} />
                        <span className="text-xs mt-1 text-center">{label}</span>
                    </div>
                )}

                {/* دکمه حذف ضربدر */}
                {preview && !disabled && (
                    <button
                        type="button"
                        className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md hover:bg-red-100 transition-colors"
                        onClick={handleClearFile}
                    >
                        <X size={16} className="text-red-500" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FileUploader;