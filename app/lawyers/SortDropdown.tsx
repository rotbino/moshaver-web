// app/lawyers/SortDropdown.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/radix/button';
import {
    ChevronDown,
    ArrowUpDown,
    Star,
    TrendingUp,
    TrendingDown,
    Award,
    FileText,
    Eye,
    MessageSquare,
    StretchHorizontal, Strikethrough, Subscript, SunDim, TimerOff, Timer
} from 'lucide-react';
import { LawyersFilter, LawyerSortBy, SortOrder } from '@/lib/data-service/types';
import * as Popover from '@radix-ui/react-popover';

interface SortDropdownProps {
    sortBy: LawyerSortBy;
    sortOrder: SortOrder;
    onSortChange: (sortBy: LawyerSortBy) => void;
}

export default function SortDropdown({ sortBy, sortOrder, onSortChange }: SortDropdownProps) {
    const [open, setOpen] = useState(false);

    const sortOptions = [
        { id: LawyerSortBy.NEWEST, label: 'جدیدترین',icon: <Timer className="w-3.5 h-3.5" /> },
        { id: LawyerSortBy.RATING, label: 'بیشترین امتیاز کاربران', icon: <Star className="w-3.5 h-3.5" /> },
        { id: LawyerSortBy.EXPERIENCE, label: 'بیشترین سابقه', icon: <Award className="w-3.5 h-3.5" /> },
        { id: LawyerSortBy.PRICE_LOW, label: 'کمترین قیمت', icon: <TrendingDown className="w-3.5 h-3.5" /> },
        { id: LawyerSortBy.PRICE_HIGH, label: 'بیشترین قیمت', icon: <TrendingUp className="w-3.5 h-3.5" /> },
        { id: LawyerSortBy.SUCCESSFUL_CASES, label: 'بیشترین پرونده‌های موفق', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: LawyerSortBy.VIEWS, label: 'بیشترین بازدید', icon: <Eye className="w-3.5 h-3.5" /> },
        { id: LawyerSortBy.COMMENTS_COUNT, label: 'بیشترین نظر', icon: <MessageSquare className="w-3.5 h-3.5" /> },

    ];

    const handleSortOptionClick = (optionId: LawyerSortBy) => {
        onSortChange(optionId);
        setOpen(false);
    };

    // پیدا کردن گزینه انتخاب شده برای نمایش در دکمه
    const selectedOption = sortOptions.find(option => option.id === sortBy);
    const selectedLabel = sortBy ? selectedOption?.label || 'مرتب‌سازی' : 'مرتب‌سازی';

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-1.5 h-8 px-3 border border-gray-200 rounded-full text-sm"
                >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>{selectedLabel}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                </Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="z-50 bg-white rounded-lg shadow-lg p-2 w-64"
                    align="end"
                    sideOffset={5}
                >
                    <div className="flex flex-col gap-1">
                        {sortOptions.map((option) => (
                            <button
                                key={option.id}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm text-right ${
                                    sortBy === option.id
                                        ? 'bg-[#ca2a30] text-white'
                                        : 'hover:bg-gray-100 text-gray-700'
                                }`}
                                onClick={() => handleSortOptionClick(option.id)}
                            >
                                <div className="flex items-center gap-2">
                                    {option.icon}
                                    <span>{option.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}