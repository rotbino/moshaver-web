// components/XActivityIndicator.tsx
import React from "react";

type XActivityIndicatorProps = {
    animating?: boolean;
    size?: "small" | "large" | number;
    color?: string;
    style?: React.CSSProperties;
};

export default function XActivityIndicator({
                                               animating = true,
                                               size = "small",
                                               color = "#000",
                                               style,
                                           }: XActivityIndicatorProps) {
    if (!animating) return null;

    const dimension = size === "large" ? 40 : size === "small" ? 20 : size;

    return (
        <div
            style={{
                width: dimension,
                height: dimension,
                border: `${dimension / 8}px solid #f3f3f3`,
                borderTop: `${dimension / 8}px solid ${color}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                ...style,
            }}
        />
    );
}
