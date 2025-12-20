// components/XTextInput.tsx
import React from "react";

type KeyboardType = "default" | "mobile-address" | "numeric" | "phone-pad" | "number-pad" | "decimal-pad";

type XTextInputProps = {
    value?: string;
    defaultValue?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardType;
    style?: React.CSSProperties;
    className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>; // همه پراپس‌های input HTML

export default function XTextInput({
                                       value,
                                       defaultValue,
                                       onChangeText,
                                       placeholder,
                                       secureTextEntry = false,
                                       keyboardType = "default",
                                       style,
                                       className,
                                       ...rest
                                   }: XTextInputProps) {
    // Map keyboardType ری‌اکت نیتیو به HTML type
    let inputType = "text";
    switch (keyboardType) {
        case "mobile-address":
            inputType = "mobile";
            break;
        case "numeric":
        case "number-pad":
        case "decimal-pad":
            inputType = "number";
            break;
        case "phone-pad":
            inputType = "tel";
            break;
        default:
            inputType = "text";
    }

    // secureTextEntry → type password
    if (secureTextEntry) inputType = "password";

    return (
        <input
            type={inputType}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={(e) => onChangeText?.(e.target.value)}
            style={style}
            className={className}
            {...rest}
        />
    );
}
