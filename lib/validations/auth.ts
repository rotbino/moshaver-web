import { z } from "zod";

export const loginSchema = z.object({
    phone: z
        .string()
        .min(11, "شماره موبایل باید 11 رقم باشد")
        .max(11, "شماره موبایل باید 11 رقم باشد"),
    password: z.string().min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
});

export const registerStepOneSchema = z.object({
    contact: z
        .string()
        .length(11, "شماره موبایل باید 11 رقم باشد")
        .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شود و 11 رقم باشد"),
    natId: z
        .string()
        .length(10, "کد ملی باید 10 رقم باشد")
        .regex(/^\d+$/, "کد ملی فقط می‌تواند شامل اعداد باشد"),

    birthDate: z
        .string()
        .min(1, "تاریخ تولد وارد نشده")
        .length(10, "تاریخ تولد باید 10 کاراکتر باشد"), // مثلا 1402/01/01


    hostId: z.string().min(1, "پلتفرم مرجع را انتخاب کنید"),
});

export const registerStepTwoSchema = z.object({
    otp: z
        .string()
        .min(5, "کد تایید باید 5 رقم باشد")
        .max(5, "کد تایید باید 5 رقم باشد"),
});

export const registerStepThreeSchema = z
    .object({

        password: z.string().min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
        confirmPassword: z
            .string()
            .min(6, "تکرار رمز عبور باید حداقل 6 کاراکتر باشد"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "رمز عبور و تکرار آن باید یکسان باشند",
        path: ["confirmPassword"],
    });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterStepOneData = z.infer<typeof registerStepOneSchema>;
export type RegisterStepTwoData = z.infer<typeof registerStepTwoSchema>;
export type RegisterStepThreeData = z.infer<typeof registerStepThreeSchema>;
