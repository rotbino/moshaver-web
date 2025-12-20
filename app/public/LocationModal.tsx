// LocationSelector.tsx
"use client";

import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/radix/dialog";
import { Button } from "@/components/radix/button";
import { provinces } from "@/lib/api/mockData";

interface LocationSelectorProps {
    selectedProvince: string;
    selectedCity: string;
    onLocationChange: (provinceId: string, cityName: string) => void;
    onDontShowAgainChange?: (dontShowAgain: boolean) => void;
    className?: string;
    isMobile?: boolean;
}

export default function LocationSelector({
                                             selectedProvince,
                                             selectedCity,
                                             onLocationChange,
                                             onDontShowAgainChange,
                                             className = "",
                                             isMobile = false
                                         }: LocationSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"province" | "city">("province");
    const [searchTerm, setSearchTerm] = useState("");
    const [tempSelectedProvince, setTempSelectedProvince] = useState(selectedProvince);
    const [tempSelectedCity, setTempSelectedCity] = useState(selectedCity);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const selectedProvinceData = provinces.find(p => p.id === tempSelectedProvince);
    const cities = selectedProvinceData ? selectedProvinceData.cities : [];

    const filteredProvinces = provinces.filter(province =>
        province.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCities = cities.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApply = () => {
        onLocationChange(tempSelectedProvince, tempSelectedCity);
        if (onDontShowAgainChange) {
            onDontShowAgainChange(dontShowAgain);
        }
        setIsOpen(false);
    };

    const handleProvinceClick = (provinceId: string) => {
        setTempSelectedProvince(provinceId);
        setTempSelectedCity("");
        setActiveTab("city");
    };

    const handleCityClick = (city: string) => {
        setTempSelectedCity(city);
    };

    const getSelectedProvinceName = () => {
        const province = provinces.find(p => p.id === tempSelectedProvince);
        return province ? province.name : "";
    };

    const getDisplayText = () => {
        if (selectedCity) return selectedCity;
        if (selectedProvince) return getSelectedProvinceName();
        return isMobile ? "انتخاب شهر" : "انتخاب موقعیت";
    };

    const resetSelection = () => {
        setTempSelectedProvince("");
        setTempSelectedCity("");
        setActiveTab("province");
        setSearchTerm("");
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className={`h-10 flex items-center gap-1 ${className} ${selectedCity ? 'text-[#ca2a30]' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <MapPin className="w-5 h-5" />
                <span className="truncate max-w-[100px]">{getDisplayText()}</span>
                {!isMobile && <ChevronDown className="w-4 h-4" />}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md mx-4 p-0">
                    <DialogHeader className="border-b p-4">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#ca2a30]" />
                                انتخاب موقعیت مکانی
                            </DialogTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                ×
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="p-4">
                        {/* Tabs */}
                        <div className="flex border-b mb-4">
                            <button
                                className={`px-4 py-2 font-medium ${
                                    activeTab === "province"
                                        ? "text-[#ca2a30] border-b-2 border-[#ca2a30]"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                onClick={() => setActiveTab("province")}
                            >
                                استان‌ها
                            </button>
                            <button
                                className={`px-4 py-2 font-medium ${
                                    activeTab === "city"
                                        ? "text-[#ca2a30] border-b-2 border-[#ca2a30]"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                onClick={() => setActiveTab("city")}
                                disabled={!tempSelectedProvince}
                            >
                                شهرها
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder={activeTab === "province" ? "جستجوی استان..." : "جستجوی شهر..."}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ca2a30]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* List */}
                        <div className="max-h-60 overflow-y-auto pr-2">
                            {activeTab === "province" && (
                                <div className="space-y-1">
                                    {filteredProvinces.map(province => (
                                        <button
                                            key={province.id}
                                            className={`w-full text-right px-4 py-3 rounded-lg flex items-center justify-between ${
                                                tempSelectedProvince === province.id
                                                    ? "bg-[#ca2a30]/10 border border-[#ca2a30]/20"
                                                    : "hover:bg-gray-50"
                                            }`}
                                            onClick={() => handleProvinceClick(province.id)}
                                        >
                                            <span>{province.name}</span>
                                            {tempSelectedProvince === province.id && (
                                                <div className="w-5 h-5 rounded-full bg-[#ca2a30] flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === "city" && (
                                <div className="space-y-1">
                                    {tempSelectedProvince && (
                                        <div className="mb-3">
                                            <div className="inline-block px-3 py-1 bg-[#ca2a30]/10 text-[#ca2a30] rounded-full text-sm">
                                                {getSelectedProvinceName()}
                                            </div>
                                        </div>
                                    )}

                                    {filteredCities.map(city => (
                                        <button
                                            key={city}
                                            className={`w-full text-right px-4 py-3 rounded-lg flex items-center justify-between ${
                                                tempSelectedCity === city
                                                    ? "bg-[#ca2a30]/10 border border-[#ca2a30]/20"
                                                    : "hover:bg-gray-50"
                                            }`}
                                            onClick={() => handleCityClick(city)}
                                        >
                                            <span>{city}</span>
                                            {tempSelectedCity === city && (
                                                <div className="w-5 h-5 rounded-full bg-[#ca2a30] flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected item info */}
                        <div className="mt-4 pt-4 border-t">
                            {tempSelectedProvince && tempSelectedCity && (
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-600">موقعیت انتخاب شده:</span>
                                    <span className="font-medium">
                    {tempSelectedCity}، {getSelectedProvinceName()}
                  </span>
                                </div>
                            )}

                            {/* Don't show again checkbox */}
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    id="dontShowAgain"
                                    className="h-4 w-4 text-[#ca2a30] border-gray-300 rounded focus:ring-[#ca2a30]"
                                    checked={dontShowAgain}
                                    onChange={(e) => setDontShowAgain(e.target.checked)}
                                />
                                <label htmlFor="dontShowAgain" className="mr-2 text-sm text-gray-700">
                                    دیگر نشان نده
                                </label>
                            </div>

                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={resetSelection}
                                >
                                    بازنشانی
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        انصراف
                                    </Button>
                                    <Button
                                        onClick={handleApply}
                                        className="bg-[#ca2a30] hover:bg-[#ca2a30]/90"
                                    >
                                        اعمال
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}