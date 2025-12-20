// app/home/MobileNav.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/api/useApi";
import Link from "next/link";
import LocationSelector from "@/app/public/LocationSelector";
import { Input } from "@/components/radix/input";
import { Search, MapPin, User, MessageSquare, Phone, ShieldQuestion } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { Button } from "@/components/radix/button";
import PanelLink from "@/app/public/PanelLink";

interface MobileNavProps {
    selectedProvince: string;
    selectedCity: string;
    onLocationChange: (provinceId: string, cityName: string) => void;
}

export default function MobileNav({
                                      selectedProvince,
                                      selectedCity,
                                      onLocationChange
                                  }: MobileNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, logout } = useAuth();
    const dispatch = useDispatch();
    const location = useSelector((state: RootState) => state.location);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const { user: currentUser } = useAuth();

    // به‌روزرسانی مکان از استور در صورت عدم وجود
    useEffect(() => {
        if (!selectedProvince && !selectedCity && location.province) {
            onLocationChange(location.province, location.city);
        }
    }, [selectedProvince, selectedCity, location, onLocationChange]);

    const handleSearch = (word?: string) => {
        const params = new URLSearchParams();
        if (word || searchTerm) params.append('search', word || searchTerm);

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="md:hidden">
            {/* Header */}
            <div className="flex flex-col p-4 bg-white shadow-sm">
                {/* Logo and Title */}
                <div className="flex items-center justify-between mb-3">
                    <Link href="/" className="flex items-center">
                        <div className="flex items-center">
                            <img
                                src="/images/logo.png"
                                alt="وکیل یاب"
                                className="h-14 w-14 ml-2"
                                onError={(e) => {
                                    // اگر لوگو بارگذاری نشد، از یک placeholder استفاده کن
                                    e.currentTarget.src = "https://via.placeholder.com/40x40?text=V";
                                }}
                            />
                            <div>
                                <div className="text-lg font-bold text-[#ca2a30]">وکیل یاب</div>
                                <div className="text-xs font-bold text-[#666]">پلتفرم ارتباط با بهترین وکلا</div>
                            </div>
                        </div>
                    </Link>

                    {/* User Profile Button */}
                    <div className="flex items-center gap-2">
                        <PanelLink>
                            <Button variant="outline" className="flex items-center justify-center rounded-full w-10 h-10">
                                <User className="w-4 h-4" />
                            </Button>
                        </PanelLink>
                    </div>
                </div>

                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="جستجوی نام وکیل یا تخصص..."
                        className="pl-10 h-10 border-gray-300 focus:border-[#ca2a30] focus:ring-[#ca2a30] w-full"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            handleSearch(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
            </div>
        </div>
    );
}