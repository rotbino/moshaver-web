// app/home/BenefitsSection.tsx
import React from 'react';
import { Shield, Clock, Users, CheckCircle, Star, Headphones, Briefcase, FileText, Award, DollarSign, MessageSquare, Calendar, MapPin } from "lucide-react";

const BenefitsSection = () => {
    const lawyerBenefits = [
        {
            id: 1,
            icon: Users,
            title: "هزاران مشتری",
        },
        {
            id: 2,
            icon: Briefcase,
            title: "پنل حرفه ای",
        },
        {
            id: 3,
            icon: Calendar,
            title: "زمانبندی و رزرو آنلاین",
        },
        {
            id: 4,
            icon: DollarSign,
            title: "افزایش درآمد",
        },
    ];

    const clientBenefits = [
        {
            id: 1,
            icon: Shield,
            title: "دسترسی به هزاران وکیل",
        },
        {
            id: 2,
            icon: Clock,
            title: "انتخاب وکیل با نظر مشتریان قبلی",
        },
        {
            id: 3,
            icon: CheckCircle,
            title: "پرداخت در صورت رضایت",
        },
        {
            id: 4,
            icon: Star,
            title: "صرفه‌جویی در زمان و هزینه",
        },
    ];

    return (
        <div className="py-8 bg-white">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
                    مزایای وکیل یاب
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Box for Lawyers */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 pr-2">مزایا برای وکلا</h3>
                        </div>

                        <div className="space-y-3">
                            {lawyerBenefits.map((benefit) => {
                                const Icon = benefit.icon;
                                return (
                                    <div
                                        key={benefit.id}
                                        className="flex items-center p-3 bg-white rounded-lg hover:bg-red-50 transition-colors duration-300"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-red-50 rounded-lg mr-3">
                                            <Icon className="w-5 h-5 text-red-600" />
                                        </div>
                                        <h4 className="text-base font-medium text-gray-800 px-2">
                                            {benefit.title}
                                        </h4>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Box for Clients */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 pr-2">مزایا برای موکلین</h3>
                        </div>

                        <div className="space-y-3">
                            {clientBenefits.map((benefit) => {
                                const Icon = benefit.icon;
                                return (
                                    <div
                                        key={benefit.id}
                                        className="flex items-center p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors duration-300"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg mr-3">
                                            <Icon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h4 className="text-base font-medium text-gray-800 px-2">
                                            {benefit.title}
                                        </h4>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BenefitsSection;