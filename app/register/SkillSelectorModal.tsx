// components/common/SkillSelectorModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/radix/button';
import { X, Search, Plus, Check, AlertCircle } from 'lucide-react';

import {skillTitlesWithCategories, skillCategories, Skill} from "@/lib/data-transfer/data-types";

interface SkillSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSkills: Skill[];
    onSkillsChange: (skills: Skill[]) => void;
    maxSkills?: number;
}

export const SkillSelectorModal: React.FC<SkillSelectorModalProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          selectedSkills,
                                                                          onSkillsChange,
                                                                          maxSkills = 10
                                                                      }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelectedSkills, setTempSelectedSkills] = useState<Skill[]>([]);
    const [availableSkills, setAvailableSkills] = useState<{ id: Skill; title: string; category: string }[]>([]);
    const [showLimitWarning, setShowLimitWarning] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const modalRef = useRef<HTMLDivElement>(null);

    // تابع کمکی برای دریافت عنوان مهارت
    const getSkillTitle = (skillId: Skill) => {
        const skill = skillTitlesWithCategories.find(s => s.id === skillId);
        return skill ? skill.title : skillId;
    };

    useEffect(() => {
        if (isOpen) {
            setTempSelectedSkills([...selectedSkills]);
            setSearchTerm('');
            setShowLimitWarning(false);
            setSelectedCategory('all');
        }
    }, [isOpen, selectedSkills]);

    useEffect(() => {
        let filtered = skillTitlesWithCategories;

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(skill => skill.category === selectedCategory);
        }

        // Filter by search term
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(skill =>
                skill.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Remove already selected skills
        filtered = filtered.filter(skill =>
            !tempSelectedSkills.includes(skill.id)
        );

        setAvailableSkills(filtered);
    }, [searchTerm, selectedCategory, tempSelectedSkills]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleSkillAdd = (skillId: Skill) => {
        if (tempSelectedSkills.length >= maxSkills) {
            setShowLimitWarning(true);
            setTimeout(() => setShowLimitWarning(false), 3000);
            return;
        }

        if (!tempSelectedSkills.some(selected => selected === skillId)) {
            setTempSelectedSkills([...tempSelectedSkills, skillId]);
        }
    };

    const handleSkillRemove = (skillId: Skill) => {
        setTempSelectedSkills(tempSelectedSkills.filter(skill => skill !== skillId));
    };

    const handleConfirm = () => {
        onSkillsChange(tempSelectedSkills);
        onClose();
    };

    const handleCancel = () => {
        setTempSelectedSkills(selectedSkills);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col" ref={modalRef}>
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">انتخاب مهارت‌ها</h3>
                    <button
                        onClick={handleCancel}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="جستجوی مهارت..."
                            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b02529]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category Tabs - Horizontal Scrollable */}
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedCategory === 'all'
                                    ? 'bg-[#ca2a30] text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            همه مهارت‌ها
                        </button>
                        {skillCategories.map(category => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedCategory === category.id
                                        ? 'bg-[#ca2a30] text-white shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {category.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Skills - Horizontal Scrollable */}
                {tempSelectedSkills.length > 0 && (
                    <div className="p-4 border-b bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-gray-700">مهارت‌های انتخاب شده</h4>
                            <span className="text-xs text-gray-500">
                                {tempSelectedSkills.length}/{maxSkills}
                            </span>
                        </div>
                        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                            {tempSelectedSkills.map(skill => (
                                <div
                                    key={skill}
                                    className="flex-shrink-0 flex items-center bg-[#ca2a30] text-white px-4 py-2 rounded-full"
                                >
                                    <span className="text-sm font-medium">
                                        {getSkillTitle(skill)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleSkillRemove(skill)}
                                        className="mr-2 text-white hover:text-gray-200 focus:outline-none"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Skills */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-700">
                            {selectedCategory === 'all' ? 'همه مهارت‌ها' :
                                skillCategories.find(c => c.id === selectedCategory)?.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                            {availableSkills.length} مورد یافت شد
                        </span>
                    </div>

                    {showLimitWarning && (
                        <div className="flex items-center bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-4">
                            <AlertCircle className="w-5 h-5 ml-2" />
                            <span className="text-sm">شما نمی‌توانید بیشتر از {maxSkills} مهارت انتخاب کنید</span>
                        </div>
                    )}

                    {availableSkills.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                                <Search className="w-12 h-12 mx-auto" />
                            </div>
                            <p className="text-gray-500">مهارتی یافت نشد</p>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="mt-2 text-sm text-[#ca2a30] hover:underline"
                                >
                                    پاک کردن جستجو
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableSkills.map(skill => {
                                const isSelected = tempSelectedSkills.some(selected => selected === skill.id);
                                return (
                                    <div
                                        key={skill.id}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border ${
                                            isSelected
                                                ? 'bg-red-50 border-red-300 shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                        onClick={() => isSelected ? handleSkillRemove(skill.id) : handleSkillAdd(skill.id)}
                                    >
                                        {isSelected ? (
                                            <Check className="w-5 h-5 text-[#ca2a30] ml-3" />
                                        ) : (
                                            <Plus className="w-5 h-5 text-gray-400 ml-3" />
                                        )}
                                        <span className="text-sm">{skill.title}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {tempSelectedSkills.length} مهارت انتخاب شده
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                        >
                            انصراف
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="bg-[#ca2a30] hover:bg-[#b02529]"
                        >
                            تایید و ادامه
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};