"use client";

import { LoginForm } from "@/app/login/login-form";
import {ChangePasswordForm} from "@/app/change-password/change-password-form";

export default function LoginPage() {
    return (
        <div className="max-w-[1000px] mx-auto p-4 min-h-screen bg-white">
            <ChangePasswordForm />
        </div>
    );
}
