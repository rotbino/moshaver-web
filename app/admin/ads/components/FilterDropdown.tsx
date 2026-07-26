// app/admin/ads/components/FilterDropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterDropdownProps {
    label: string;
    isActive: boolean;
    children: React.ReactNode;
    onRemove?: () => void;
}

export function FilterDropdown({ label, isActive, children, onRemove }: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, right: 0 });

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (!isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right,
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="flex-shrink-0">
            <button
                ref={triggerRef}
                type="button"
                onClick={handleToggle}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border whitespace-nowrap select-none",
                    isActive
                        ? "bg-primary/10 text-primary border-primary/30 order-first"
                        : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-primary/20"
                )}
            >
                {label}
                {onRemove && isActive ? (
                    <span
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </span>
                ) : (
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
                )}
            </button>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed z-[9999] bg-surface border border-outline-variant/30 rounded-xl shadow-2xl min-w-[180px] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    style={{
                        top: `${position.top}px`,
                        right: `${position.right}px`,
                    }}
                >
                    {children}
                </div>,
                document.body
            )}
        </div>
    );
}