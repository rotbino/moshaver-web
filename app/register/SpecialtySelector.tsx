// components/common/SpecialtySelector.tsx
'use client';

import React, { useState } from 'react';
import { Specialty } from '@/lib/data-service/types';
import { Button } from '@/components/radix/button';
import { Plus, Edit } from 'lucide-react';
import { SpecialtySelectorModal } from './SpecialtySelectorModal';
import { specialtyTitles } from '@/lib/data-service/mockData';

interface SpecialtySelectorProps {
    selectedSpecialties: Specialty[];
    onSpecialtiesChange: (specialties: Specialty[]) => void;
    maxSpecialties?: number;
}

export const SpecialtySelector: React.FC<SpecialtySelectorProps> = ({
                                                                        selectedSpecialties,
                                                                        onSpecialtiesChange,
                                                                        maxSpecialties = 3
                                                                    }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getSpecialtyTitle = (specialty: Specialty) => {
        return specialtyTitles.find(s => s.id === specialty)?.title || specialty;
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">تخصص‌ها</label>

                {/* نمایش تخصص‌های انتخاب شده */}
                {selectedSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedSpecialties.map((specialty, index) => (
                            <div
                                key={specialty}
                                className={`flex items-center px-3 py-1 rounded-full ${
                                    index === 0
                                        ? 'bg-[#ca2a30] text-white'
                                        : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                                <span className="ml-2 text-sm">
                                    {index === 0 ? 'اصلی: ' : 'فرعی: '}
                                    {getSpecialtyTitle(specialty)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* دکمه افزودن/ویرایش */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {selectedSpecialties.length > 0
                            ? `${selectedSpecialties.length}/${maxSpecialties} تخصص انتخاب شده`
                            : 'حداقل یک تخصص را انتخاب کنید'
                        }
                    </span>
                    <Button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                    >
                        {selectedSpecialties.length > 0 ? (
                            <>
                                <Edit className="w-4 h-4" />
                                ویرایش تخصص‌ها
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                انتخاب تخصص‌ها
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* مدال انتخاب تخصص‌ها */}
            <SpecialtySelectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedSpecialties={selectedSpecialties}
                onSpecialtiesChange={onSpecialtiesChange}
                maxSpecialties={maxSpecialties}
            />
        </div>
    );
};