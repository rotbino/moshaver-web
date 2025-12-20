// components/common/SkillTag.tsx
'use client';

import React from 'react';
import { Skill } from '@/lib/data-service/types';
import { X } from 'lucide-react';
import { skillTitles } from '@/lib/data-service/mockData';

interface SkillTagProps {
    skill: Skill;
    onRemove: (skill: Skill) => void;
}

export const SkillTag: React.FC<SkillTagProps> = ({ skill, onRemove }) => {
    // پیدا کردن عنوان مهارت از لیست مهارت‌ها
    const skillTitle = skillTitles.find(s => s.id === skill)?.title || skill;

    return (
        <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full">
            <span className="ml-2 text-sm">{skillTitle}</span>
            <button
                type="button"
                onClick={() => onRemove(skill)}
                className="text-red-800 hover:text-red-900 focus:outline-none"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};