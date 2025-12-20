// app/lawyer-dashboard/components/LadderSteps.tsx
"use client";

import React from 'react';
import { Crown } from "lucide-react";

interface LadderStepsProps {
    selectedStep: number;
    onStepSelect: (step: number) => void;
}

export default function LadderSteps({ selectedStep, onStepSelect }: LadderStepsProps) {
    const steps = [1, 2, 3, 4, 5];

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {/* Ladder container */}
            <div className="relative h-64 w-48 flex-shrink-0">
                {/* Left rail */}
                <div className="absolute left-6 top-0 bottom-0 w-3 bg-gray-600 rounded-full"></div>
                {/* Right rail */}
                <div className="absolute right-6 top-0 bottom-0 w-3 bg-gray-600 rounded-full"></div>

                {/* Rungs container - reversed so step 1 is at the bottom */}
                <div className="absolute inset-0 flex flex-col-reverse justify-between py-6">
                    {steps.map((step) => (
                        <div key={step} className="flex items-center justify-center">
                            {/* Rung */}
                            <div className="w-36 h-3 bg-gray-500 rounded-full relative">
                                {/* Step number circle */}
                                <button
                                    onClick={() => onStepSelect(step)}
                                    className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                        selectedStep >= step
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg transform scale-110'
                                            : 'bg-white text-gray-700 border-2 border-gray-400 hover:bg-gray-100'
                                    }`}
                                >
                                    {step}
                                </button>

                                {/* Price label outside the ladder */}
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full pl-2">
                                    <span className={`text-sm font-bold whitespace-nowrap ${
                                        selectedStep >= step ? 'text-orange-600' : 'text-gray-700'
                                    }`}>
                                        {(step * 100000).toLocaleString('fa-IR')} تومان
                                    </span>
                                </div>
                            </div>

                            {/* Crown for selected steps */}
                            {selectedStep >= step && (
                                <div className="absolute -right-8 flex items-center justify-center">
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Info panel - responsive positioning */}
            <div className="flex-1 space-y-3 min-w-0 max-w-sm md:pr-16">
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-2">تعداد پله صعود را انتخاب کنید</h3>

                </div>

                {/* Price note */}
                <div className="text-sm text-gray-700">
                    قیمت هر پله برای یک ماه 100,000 تومان
                </div>
            </div>
        </div>
    );
}