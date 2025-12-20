// components/XSlider.tsx
import React from "react";

type XSliderProps = {
    minimumValue?: number;
    maximumValue?: number;
    value?: number;
    step?: number;
    onValueChange?: (val: number) => void;
};

export default function XSlider({
                                    minimumValue = 0,
                                    maximumValue = 100,
                                    value = 0,
                                    step = 1,
                                    onValueChange,
                                }: XSliderProps) {
    return (
        <input
            type="range"
            min={minimumValue}
            max={maximumValue}
            step={step}
            defaultValue={value}
            onChange={(e) => onValueChange?.(Number(e.target.value))}
        />
    );
}
