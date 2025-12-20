// app/auth-guard.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/api/useApi";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { sessionId } = useAuth();

    useEffect(() => {
        if (!sessionId) {
            router.replace("/login");
        }
    }, [sessionId, router]);

    return <>{children}</>;
}
