// ProcessSteps.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, CreditCard, Phone, ArrowRight, ArrowLeft } from "lucide-react";

export default function ProcessSteps() {
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Check if user has selected "don't show again"
    useEffect(() => {
        const savedPreference = localStorage.getItem('dontShowProcessSteps');
        if (savedPreference === 'true') {
           // setIsVisible(false);
        }
    }, []);

    const handleDontShowAgainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setDontShowAgain(isChecked);

        if (isChecked) {
            localStorage.setItem('dontShowProcessSteps', 'true');
            setIsVisible(false); // بلافاصله کامپوننت را مخفی کن
        } else {
            localStorage.removeItem('dontShowProcessSteps');
        }
    };

    if (!isVisible) {
        return null;
    }

    const steps = [
        {
            id: 1,
            title: "انتخاب وکیل",
            icon: <Search className="w-5 h-5 md:w-6 md:h-6" />,
        },
        {
            id: 2,
            title: "رزرو و پرداخت",
            icon: <CreditCard className="w-5 h-5 md:w-6 md:h-6" />,
        },
        {
            id: 3,
            title: "تماس وکیل",
            icon: <Phone className="w-5 h-5 md:w-6 md:h-6" />,
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm my-6">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-800">مراحل استفاده از سایت</h2>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="dontShowAgain"
                        className="h-4 w-4 text-[#ca2a30] border-gray-300 rounded focus:ring-[#ca2a30]"
                        checked={dontShowAgain}
                        onChange={handleDontShowAgainChange}
                    />
                  {/*  <label htmlFor="dontShowAgain" className="mr-2 text-sm text-gray-700">
                        دیگر نشان نده
                    </label>*/}
                </div>
            </div>

            {/* Steps Container */}
            <div className="rounded-lg p-3">
                {/* Desktop View */}
                <div className="hidden md:flex justify-between items-center">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center text-center px-4 py-3 bg-gray-50 rounded-lg shadow-sm flex-1 mx-1">
                                <div className="relative mb-2">
                                    <div className="w-12 h-12 rounded-full bg-[#ca2a30]/10 flex items-center justify-center">
                                        <div className="text-[#ca2a30]">
                                            {step.icon}
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#ca2a30] flex items-center justify-center text-white text-xs font-bold">
                                        {step.id}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-800">{step.title}</h3>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="flex items-center justify-center mx-1">
                                    <ArrowLeft className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Mobile View */}
                <div className="md:hidden flex items-center justify-center overflow-x-auto no-scrollbar">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center text-center px-2 py-2 bg-gray-100 rounded-lg shadow-sm min-w-[90px] mx-1">
                                <div className="relative mb-1">
                                    <div className="w-10 h-10 rounded-full bg-[#ca2a30]/10 flex items-center justify-center">
                                        <div className="text-[#ca2a30]">
                                            {step.icon}
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ca2a30] flex items-center justify-center text-white text-[10px] font-bold">
                                        {step.id}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-800 text-xs">{step.title}</h3>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}