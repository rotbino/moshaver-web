import React from "react";

interface NumberInputProps {
    value: number | undefined;
    onChange: (value: number) => void;
    unit?: string; // مثل "ریال" یا "تومان"

}

export const NumberInput: React.FC<NumberInputProps> = ({
                                                            value,
                                                            onChange,
                                                            unit,
                                                            ...rest
                                                        }) => {
    // مقدار رو سه رقمی فرمت کن
    const formatValue = (val: number | undefined) =>
        val ? val.toLocaleString("en-US") : "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // فقط عدد بگیر
        const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
        const num = raw ? Number(raw) : 0;
        onChange(num);
    };

    return (
        <>
            <input
                {...rest}
                dir="ltr"
                inputMode="numeric"
                value={formatValue(value)}
                onChange={handleChange}
            />
            {unit && (
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm"> {unit} </span>
            )}
        </>
    );
};
