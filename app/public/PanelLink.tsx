// components/PanelLink.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/lib/api/useApi";

interface PanelLinkProps {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
}

export default function PanelLink({ children, className = "", ...props }: PanelLinkProps) {
    const { user: currentUser, isAuthenticated } = useAuth();

    if (!isAuthenticated || !currentUser) {
        return null;
    }

    // تعیین مسیر بر اساس نقش کاربر
    const href = currentUser.role === "lawyer" ? "/lawyer-dashboard" : "/user-dashboard";

    return (
        <Link href={href} className={className} {...props}>
            {children}
        </Link>
    );
}