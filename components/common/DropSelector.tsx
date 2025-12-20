"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

type Option = {
    value?: string;
    label?: string;
    extra?: any; // هر اطلاعات اضافه مثل پرچم یا کد تلفن
    className?: string;
    disabled?: boolean;

};

export default function DropSelector({
                                         value,
                                         options,
                                         placeholder = "Select an option...",
                                         onChange,
                                         renderOption, // چطور هر آیتم رندر بشه
                                         className,
                                         disabled = false,
                                     }: {
    value: string;
    options: Option[];
    placeholder?: string;
    onChange: (value: string, option: Option) => void;
    renderOption?: (option: Option) => React.ReactNode;
    disabled?: boolean;
    className?: string;
}) {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const haveSearch = options.length > 10;

    // همیشه مطمئن شو label و value پر شده
    const normalizedOptions = options.map((o) => ({
        value: o.value ?? "",
        label: o.label ?? "",
        ...o,
    }));

    const selectedOption = normalizedOptions.find((o) => o.value === value);

    const filtered = normalizedOptions.filter(
        (o) =>
            o.label.toLowerCase().includes(search.toLowerCase()) ||
            o.value.toLowerCase().includes(search.toLowerCase())
    );

    // بستن منو بیرون
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearch("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // فوکوس روی اینپوت
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSelect = (option: { value: string; label: string }) => {
        onChange(option.value, option);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex w-full items-center justify-between px-3 py-3 border rounded-md ${
                    disabled
                        ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                        : "border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                } ${className || ""}`}
            >
                {selectedOption ? (
                    <span className="truncate">{selectedOption.label}</span>
                ) : (
                    <span className="text-gray-500">{placeholder}</span>
                )}
                <ChevronDown
                    size={20}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""} ${disabled ? "text-gray-400" : ""}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-hidden">
                    {/* Search */}
                    {haveSearch && (
                        <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="جستجو..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ca2a30]"
                            />
                        </div>
                    )}

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filtered.length > 0 ? (
                            filtered.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => !option.disabled && handleSelect(option)}
                                    className={`flex items-center justify-between w-full px-3 py-2 text-left transition-colors ${
                                        option.disabled
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "hover:bg-gray-50"
                                    } ${
                                        value === option.value ? "bg-[#ca2a30]/10" : ""
                                    }`}
                                    disabled={option.disabled}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {renderOption ? renderOption(option) : option.label}
                                    </div>
                                    {value === option.value && !option.disabled && (
                                        <Check size={16} className="text-[#ca2a30] flex-shrink-0" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-gray-500 text-center">
                                نتیجه ای پیدا نشد
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}