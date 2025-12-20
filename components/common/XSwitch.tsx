// components/XSwitch.tsx
import React from "react";

type XSwitchProps = {
    value: boolean;
    onValueChange?: (value: boolean) => void;
    disabled?: boolean;
    trackColor?: { false: string; true: string };
    thumbColor?: string;
    style?: React.CSSProperties;
};

export default function XSwitch({
                                    value,
                                    onValueChange,
                                    disabled = false,
                                    trackColor = { false: "#ccc", true: "#4caf50" },
                                    thumbColor = "#fff",
                                    style,
                                }: XSwitchProps) {
    return (
        <label style={{ display: "inline-flex", alignItems: "center", ...style }}>
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onValueChange?.(e.target.checked)}
                disabled={disabled}
                style={{ display: "none" }}
            />
            <span
                style={{
                    width: 40,
                    height: 20,
                    borderRadius: 20,
                    backgroundColor: value ? trackColor.true : trackColor.false,
                    position: "relative",
                    transition: "background-color 0.2s",
                }}
            >
        <span
            style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: thumbColor,
                position: "absolute",
                top: 1,
                left: value ? 20 : 2,
                transition: "left 0.2s",
            }}
        />
      </span>
        </label>
    );
}
