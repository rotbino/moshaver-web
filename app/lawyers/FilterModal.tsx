// components/common/FilterModal.tsx - اصلاح شده برای پویا کردن پلیس‌هولدر جستجو

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '@/components/radix/input';
import { Search, X, ArrowLeft, ChevronLeft, Close } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterModalItem {
    id: string;
    name: string;
    children?: FilterModalItem[];
}

interface FilterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    items: FilterModalItem[];
    selectedItems: string[];
    onItemSelect: (itemTitle: string, itemId: string) => void;
    multiSelect?: boolean;
    maxSelect?: number;
    placeholder?: string;
    isMobile?: boolean;
    showMultiSelectToggle?: boolean;
    onMultiSelectToggle?: (enabled: boolean) => void;
    onApply?: () => void;
    minSelect?: number;
    multipleTitle?: string;
    showSelectedItems?: boolean;
    onRemoveSelectedItem?: (item: string) => void;
}

export default function FilterModal({
                                        open,
                                        onOpenChange,
                                        title,
                                        items,
                                        selectedItems,
                                        onItemSelect,
                                        multiSelect = false,
                                        maxSelect,
                                        placeholder = 'جستجو...',
                                        placeholder2='جستجو...',
                                        isMobile = false,
                                        showMultiSelectToggle = false,
                                        onMultiSelectToggle,
                                        onApply,
                                        minSelect = 1,
                                        multipleTitle = "انتخاب همزمان",
                                        showSelectedItems = false,
                                        onRemoveSelectedItem
                                    }: FilterModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentItems, setCurrentItems] = useState<FilterModalItem[]>(items);
    const [history, setHistory] = useState<{ items: FilterModalItem[]; title: string }[]>([]);
    const [currentTitle, setCurrentTitle] = useState(title);
    const [currentStep, setCurrentStep] = useState(1);
    const [internalMultiSelect, setInternalMultiSelect] = useState(multiSelect);
    const [error, setError] = useState<string>('');

    // State برای مدیریت انتخاب‌های داخلی
    const [internalSelectedItems, setInternalSelectedItems] = useState<string[]>(selectedItems);

    // Ref برای جلوگیری از ریست شدن state هنگام به‌روزرسانی‌های کامپوننت والد
    const isInitialized = useRef(false);

    // Initialize internal state only when modal opens
    useEffect(() => {
        if (open) {
            if (!isInitialized.current) {
                setCurrentItems(items);
                setHistory([]);
                setCurrentTitle(title);
                setSearchTerm('');
                setCurrentStep(1);
                setInternalMultiSelect(multiSelect);
                setError('');
                setInternalSelectedItems(selectedItems);
                isInitialized.current = true;
            }
        } else {
            isInitialized.current = false;
        }
    }, [open, items, title, multiSelect, selectedItems]);

    // Update internal selected items when prop changes
    useEffect(() => {
        if (open) {
            setInternalSelectedItems(selectedItems);
        }
    }, [selectedItems, open]);

    // فیلتر کردن آیتم‌ها بر اساس عبارت جستجو
    const filteredItems = useMemo(() => {
        return currentItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [currentItems, searchTerm]);

    // مدیریت کلیک روی آیتم‌ها
    const handleItemClick = useCallback((item: FilterModalItem) => {
        // اگر آیتم فرزند دارد (مثل شهرها که زیر مجموعه استان‌ها هستند)
        if (item.children && item.children.length > 0) {
            // ذخیره وضعیت فعلی در تاریخچه
            setHistory(prev => [...prev, { items: currentItems, title: currentTitle }]);
            setCurrentItems(item.children);
            setCurrentTitle(item.name);
            setSearchTerm('');
            setCurrentStep(prev => prev + 1);
        } else {
            // آیتم پایانی - انتخاب یا عدم انتخاب
            if (internalMultiSelect) {
                // در حالت چند انتخابی، state داخلی را آپدیت می‌کنیم
                setInternalSelectedItems(prev => {
                    if (prev.includes(item.name)) {
                        return prev.filter(name => name !== item.name);
                    } else {
                        return [...prev, item.name];
                    }
                });

                // فراخوانی onItemSelect برای به‌روزرسانی state در FilterBar
                // این مهم است که برای تخصص و مهارت در حالت چند انتخابی نیز فراخوانی شود
                onItemSelect(item.name, item.id);
            } else {
                // در حالت تک انتخابی، مستقیماً به والد اطلاع می‌دهیم
                onItemSelect(item.name, item.id);
                onOpenChange(false);
            }
        }
    }, [currentItems, currentTitle, internalMultiSelect, onItemSelect, onOpenChange]);

    // بازگشت به مرحله قبلی
    const handleBack = useCallback(() => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setCurrentItems(lastState.items);
            setCurrentTitle(lastState.title);
            setHistory(prev => prev.slice(0, -1));
            setSearchTerm('');
            setCurrentStep(prev => prev - 1);
        }
    }, [history]);

    // بررسی آیا آیتم انتخاب شده است
    const isSelected = useCallback((itemName: string) => {
        return internalSelectedItems.includes(itemName);
    }, [internalSelectedItems]);

    // بررسی آیا به محدودیت انتخاب رسیده‌ایم
    const isMaxSelected = useCallback(() => {
        return maxSelect && internalSelectedItems.length >= maxSelect;
    }, [maxSelect, internalSelectedItems.length]);

    // مدیریت تغییر حالت چند انتخابی
    const handleMultiSelectToggle = useCallback(() => {
        const newState = !internalMultiSelect;
        setInternalMultiSelect(newState);
        onMultiSelectToggle?.(newState);
        setError('');
    }, [internalMultiSelect, onMultiSelectToggle]);

    // مدیریت اعمال انتخاب‌ها
    const handleApply = useCallback(() => {
        if (internalSelectedItems.length < minSelect) {
            setError(`حداقل ${minSelect} مورد باید انتخاب کنید`);
            return;
        }

        // به‌روزرسانی والد با انتخاب‌های نهایی
        internalSelectedItems.forEach(itemName => {
            const item = findItemByName(items, itemName);
            if (item) {
                onItemSelect(item.name, item.id);
            }
        });

        if (onApply) {
            onApply();
        }
    }, [internalSelectedItems, minSelect, items, onItemSelect, onApply]);

    // تابع کمکی برای پیدا کردن آیتم بر اساس نام
    const findItemByName = (items: FilterModalItem[], name: string): FilterModalItem | null => {
        for (const item of items) {
            if (item.name === name) return item;
            if (item.children) {
                const found = findItemByName(item.children, name);
                if (found) return found;
            }
        }
        return null;
    };

    // تابع کمکی برای پیدا کردن آیتم بر اساس ID
    const findItemById = (items: FilterModalItem[], id: string): FilterModalItem | null => {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.children) {
                const found = findItemById(item.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    // تابع برای تعیین پلیس‌هولدر پویا
    const getDynamicPlaceholder = useCallback(() => {
        // اگر در سطح اول هستیم (لیست استان‌ها)
        if (history.length === 0) {
            return placeholder;
        }
        // اگر در سطح دوم هستیم (لیست شهرها)
        else {
            return placeholder2;
        }
    }, [history.length]);

    // حذف آیتم انتخاب شده
    const handleRemoveSelectedItem = useCallback((itemName: string) => {
        setInternalSelectedItems(prev => prev.filter(name => name !== itemName));
        if (onRemoveSelectedItem) {
            onRemoveSelectedItem(itemName);
        }
    }, [onRemoveSelectedItem]);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                <Dialog.Content
                    className={cn(
                        "fixed z-50 bg-white rounded-t-2xl p-5 max-h-[60vh] overflow-hidden flex flex-col shadow-lg",
                        "bottom-0 left-0 right-0",
                        "md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:transform md:-translate-x-1/2 md:-translate-y-1/2",
                        "md:max-w-md md:max-h-[70vh] md:rounded-2xl md:w-full md:shadow-xl"
                    )}
                >
                    <div className="flex justify-between items-center mb-3">
                        {history.length > 0 ? (
                            <button
                                onClick={handleBack}
                                className="flex items-center text-red-600 text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4 ml-1 rotate-180 text-red-600" />
                                بازگشت
                            </button>
                        ) : (
                            <Dialog.Title className="text-lg font-semibold">
                                {currentTitle}
                            </Dialog.Title>
                        )}
                        <Dialog.Close asChild>
                            <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* نمایش آیتم‌های انتخاب شده در نوار افقی */}
                    {showSelectedItems && internalSelectedItems.length > 0 && (
                        <div className="mb-3">
                            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
                                {internalSelectedItems.map((itemName, index) => {
                                    const item = findItemByName(items, itemName);
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            <span>{item?.name || itemName}</span>
                                            <button
                                                onClick={() => handleRemoveSelectedItem(itemName)}
                                                className="mr-1 text-red-600 hover:text-red-800"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* گزینه چند انتخابی */}
                    {showMultiSelectToggle && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleMultiSelectToggle}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${internalMultiSelect ? 'bg-red-700 border-red-700' : 'border-gray-300'}`}>
                                        {internalMultiSelect && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-red-700">{multipleTitle}</span>
                                </button>
                            </div>
                            {internalMultiSelect && maxSelect && (
                                <span className="text-xs text-gray-500">
                                    حداکثر {maxSelect} مورد
                                </span>
                            )}
                        </div>
                    )}

                    {/* نمایش خطا */}
                    {error && (
                        <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {/* جستجو با پلیس‌هولدر پویا */}
                    {currentItems.length > 8 && (
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder={getDynamicPlaceholder()}
                                className="pl-9 w-full h-10 border border-gray-200 rounded-full text-sm focus:border-[#ca2a30] focus:ring-[#ca2a30]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="overflow-y-auto flex-1">
                        {filteredItems.length > 0 ? (
                            <div className="space-y-1">
                                {filteredItems.map((item, index) => (
                                    <div key={item.id}>
                                        <div
                                            className={cn(
                                                "p-3 rounded-xl cursor-pointer flex items-center transition-colors",
                                                isSelected(item.name) && "bg-red-50 text-red-800 border border-red-100",
                                                !isSelected(item.name) && "hover:bg-gray-50",
                                                isMaxSelected() && !isSelected(item.name) && !item.children && "opacity-50 cursor-not-allowed"
                                            )}
                                            onClick={() => {
                                                if (!isMaxSelected() || isSelected(item.name) || item.children) {
                                                    handleItemClick(item);
                                                    setError('');
                                                }
                                            }}
                                        >
                                            {internalMultiSelect && !item.children && (
                                                <div className="ml-3">
                                                    {isSelected(item.name) ? (
                                                        <div className="w-5 h-5 rounded bg-red-700 flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="w-5 h-5 rounded border border-gray-300"></div>
                                                    )}
                                                </div>
                                            )}
                                            <span className="flex-1 text-sm">{item.name}</span>
                                            {item.children && item.children.length > 0 && (
                                                <ChevronLeft className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                        {index < filteredItems.length - 1 && (
                                            <div className="border-b border-gray-100 mx-3" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">موردی یافت نشد</div>
                        )}
                    </div>

                    {internalMultiSelect && (
                        <div className="mt-3 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                {internalSelectedItems.length} مورد انتخاب شده
                                {maxSelect && ` از ${maxSelect}`}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                                    onClick={() => onOpenChange(false)}
                                >
                                    انصراف
                                </button>
                                <button
                                    className={cn(
                                        "px-5 py-2 bg-[#ca2a30] text-white rounded-full text-sm font-medium transition-colors",
                                        internalSelectedItems.length < minSelect && "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={handleApply}
                                    disabled={internalSelectedItems.length < minSelect}
                                >
                                    اعمال
                                </button>
                            </div>
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}