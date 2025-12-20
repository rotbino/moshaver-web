// components/common/SpecialtySelectorModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Specialty } from '@/lib/data-service/types';
import { Button } from '@/components/radix/button';
import { X, Plus, Check, AlertCircle } from 'lucide-react';
import { specialtyTitles } from '@/lib/data-service/mockData';

interface SpecialtySelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSpecialties: Specialty[];
    onSpecialtiesChange: (specialties: Specialty[]) => void;
    maxSpecialties?: number;
}

export const SpecialtySelectorModal: React.FC<SpecialtySelectorModalProps> = ({
                                                                                  isOpen,
                                                                                  onClose,
                                                                                  selectedSpecialties,
                                                                                  onSpecialtiesChange,
                                                                                  maxSpecialties = 3
                                                                              }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelectedSpecialties, setTempSelectedSpecialties] = useState<Specialty[]>([]);
    const [availableSpecialties, setAvailableSpecialties] = useState<{ id: string; title: string }[]>([]);
    const [showLimitWarning, setShowLimitWarning] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTempSelectedSpecialties([...selectedSpecialties]);
            setSearchTerm('');
            setShowLimitWarning(false);
        }
    }, [isOpen, selectedSpecialties]);

    useEffect(() => {
        let filtered = specialtyTitles;

        // Filter by search term
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(specialty =>
                specialty.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Remove already selected specialties
        filtered = filtered.filter(specialty =>
            !tempSelectedSpecialties.includes(specialty.id)
        );

        setAvailableSpecialties(filtered);
    }, [specialtyTitles, searchTerm, tempSelectedSpecialties]);

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

    const handleSpecialtyAdd = (specialtyId: string) => {
        const specialtyEnum = specialtyId as Specialty;

        if (tempSelectedSpecialties.length >= maxSpecialties) {
            setShowLimitWarning(true);
            setTimeout(() => setShowLimitWarning(false), 3000);
            return;
        }

        if (!tempSelectedSpecialties.some(selected => selected === specialtyEnum)) {
            setTempSelectedSpecialties([...tempSelectedSpecialties, specialtyEnum]);
        }
    };

    const handleSpecialtyRemove = (specialtyId: string) => {
        const specialtyEnum = specialtyId as Specialty;
        setTempSelectedSpecialties(tempSelectedSpecialties.filter(specialty => specialty !== specialtyEnum));
    };

    const handleConfirm = () => {
        onSpecialtiesChange(tempSelectedSpecialties);
        onClose();
    };

    const handleCancel = () => {
        setTempSelectedSpecialties(selectedSpecialties);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col" ref={modalRef}>
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">انتخاب تخصص‌ها</h3>

                    <button
                        onClick={handleCancel}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>
                <span className="text-sm text-gray-500 p-3">ابتدا تخصص اصلی و فقط در صورتی که در سایر حوزه ها تخصص بالایی دارید یک یا دو مورد را بعنوان تخصص فرعی انتخاب کنید.</span>
                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <X className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                        <input
                            type="text"
                            placeholder="جستجوی تخصص..."
                            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b02529]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Selected Specialties */}
                {tempSelectedSpecialties.length > 0 && (
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-700">تخصص‌های انتخاب شده</h4>
                            <span className="text-xs text-gray-500">
                                {tempSelectedSpecialties.length}/{maxSpecialties}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tempSelectedSpecialties.map(specialty => {
                                const specialtyTitle = specialtyTitles.find(s => s.id === specialty)?.title || specialty;
                                return (
                                    <div key={specialty}
                                         className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                        <span className="ml-2 text-sm">{specialtyTitle}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleSpecialtyRemove(specialty)}
                                            className="text-blue-800 hover:text-blue-900 focus:outline-none"
                                        >
                                            <X className="w-4 h-4"/>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Available Specialties */}
                <div className="flex-1 overflow-y-auto p-4">
                    <h4 className="font-medium mb-2 text-gray-700">تخصص‌های موجود</h4>

                    {showLimitWarning && (
                        <div className="flex items-center bg-yellow-100 text-yellow-800 p-2 rounded-lg mb-2">
                            <AlertCircle className="w-4 h-4 ml-2"/>
                            <span className="text-xs">شما نمی‌توانید بیشتر از {maxSpecialties} تخصص انتخاب کنید</span>
                        </div>
                    )}

                    {availableSpecialties.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">تخصصی یافت نشد</p>
                    ) : (
                        <div className="space-y-2">
                            {availableSpecialties.map(specialty => {
                                const specialtyEnum = specialty.id as Specialty;
                                const isSelected = tempSelectedSpecialties.some(selected => selected === specialtyEnum);
                                return (
                                    <div
                                        key={specialty.id}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-blue-100 border border-blue-300'
                                                : 'hover:bg-gray-100'
                                        }`}
                                        onClick={() => isSelected ? handleSpecialtyRemove(specialty.id) : handleSpecialtyAdd(specialty.id)}
                                    >
                                        {isSelected ? (
                                            <Check className="w-4 h-4 text-[#b02529] ml-2"/>
                                        ) : (
                                            <Plus className="w-4 h-4 text-gray-400 ml-2"/>
                                        )}
                                        <span>{specialty.title}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-between">
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
                        تایید ({tempSelectedSpecialties.length})
                    </Button>
                </div>
            </div>
        </div>
    );
};