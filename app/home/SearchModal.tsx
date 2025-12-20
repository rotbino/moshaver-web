"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/radix/dialog";
import { Input } from "@/components/radix/input";
import { Button } from "@/components/radix/button";
import { LawyerList, lawyersData } from "@/lib/api/mockData";
import LawyerCard from "@/app/lawyers/LawyerCard";


interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProvince: string;
    selectedCity: string;
    selectedSpecialty: string;
}

export default function SearchModal({
                                        isOpen,
                                        onClose,
                                        selectedProvince,
                                        selectedCity,
                                        selectedSpecialty
                                    }: SearchModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<LawyerList[]>([]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setResults([]);
            return;
        }

        const filtered = lawyersData.filter(lawyer =>
            lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lawyer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lawyer.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setResults(filtered);
    }, [searchTerm]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl mx-4 p-0 max-h-[90vh] overflow-hidden">
                <DialogHeader className="border-b p-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5 text-[#ca2a30]" />
                            جستجوی وکیل
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="نام وکیل، تخصص یا شهر را وارد کنید..."
                            className="pl-10 h-12 border-gray-300 focus:border-[#ca2a30] focus:ring-[#ca2a30]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {results.length > 0 ? (
                            <div className="space-y-4">
                                {/* Desktop Grid */}
                                <div className="md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.map(lawyer => (
                                        <LawyerCard key={lawyer.id} lawyer={lawyer} />
                                    ))}
                                </div>

                                {/* Mobile List */}

                            </div>
                        ) : searchTerm ? (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-4">
                                    <Search className="w-16 h-16 mx-auto" />
                                </div>
                                <p className="text-gray-500">نتیجه‌ای برای جستجوی شما یافت نشد</p>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-4">
                                    <Search className="w-16 h-16 mx-auto" />
                                </div>
                                <p className="text-gray-500">برای جستجو، عبارت مورد نظر را وارد کنید</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}