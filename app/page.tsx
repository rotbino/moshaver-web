'use client';

import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import MobileFooter from '@/app/home/MobileFooter';
import DesktopNav from '@/app/home/DesktopNav';
import MobileNav from '@/app/home/MobileNav';
import ProcessStepper from '@/app/home/ProcessStepper';
import LawyerRegistrationCTA from '@/app/lawyers/LawyerRegistrationCTA';
import BenefitsSection from '@/app/home/BenefitsSection';
import LawyersList from '@/app/lawyers/LawyersList';
import {provinces} from "@/lib/api/mockData";

export default function MainPage() {
    const router = useRouter();

    // Set default to Tehran
    const [selectedProvince, setSelectedProvince] = useState<string>(() => {
        const tehranProvince = provinces.find(p => p.name === "تهران");
        return tehranProvince ? tehranProvince.id : "";
    });
    const [selectedCity, setSelectedCity] = useState<string>("تهران");

    // Handle location change
    const handleLocationChange = (provinceId: string, cityName: string) => {
        setSelectedProvince(provinceId);
        setSelectedCity(cityName);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-8">
            {/* Desktop Navigation */}
            <DesktopNav
                selectedProvince={selectedProvince}
                selectedCity={selectedCity}
                onLocationChange={handleLocationChange}
            />

            {/* Mobile Navigation */}
            <MobileNav
                selectedProvince={selectedProvince}
                selectedCity={selectedCity}
                onLocationChange={handleLocationChange}
            />

            <div className="max-w-7xl mx-auto px-4 pt-6">
                {/* Lawyers List */}
                <LawyersList
                    title="لیست وکلا"
                    showViewAllButton={true}
                    limit={6}
                    showOnlineFilter={true}
                    showSearch={false}
                    filters={{
                        //province: selectedProvince,
                        //city: selectedCity,
                        //includeVIP: true
                    }}
                />

                {/* Lawyer Registration CTA */}
                <LawyerRegistrationCTA />

                {/* Recently Registered Lawyers */}
                <LawyersList
                    title="وکلای جدید"
                    showViewAllButton={false}
                    viewAllLink="/lawyers?filter=new"
                    showOnlineFilter={true}
                    filters={{
                        //includeVIP: false
                    }}
                />

                {/* Process Steps */}
                <ProcessStepper currentStep={1} />

                {/* Benefits Section */}
                <BenefitsSection />
            </div>

            {/* Mobile Footer */}
            <MobileFooter />
        </div>
    );
}