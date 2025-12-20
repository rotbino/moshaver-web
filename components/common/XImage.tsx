// components/XImage.tsx
import React from "react";
import NextImage from "next/image";

type RNImageSource =
    | { uri: string }
    | number; // مثل require("...") در RN

type ResizeMode = "cover" | "contain" | "stretch" | "repeat" | "center";

type XImageProps = {
    source: RNImageSource;
    resizeMode?: ResizeMode;
    style?: React.CSSProperties;
    defaultSource?: RNImageSource;
    onLoad?: () => void;
    onError?: () => void;
    onLoadStart?: () => void;
    onLoadEnd?: () => void;
};

const resizeModeMap: Record<ResizeMode, "cover" | "contain" | "fill" | "none" | "scale-down"> = {
    cover: "cover",
    contain: "contain",
    stretch: "fill",
    repeat: "fill",
    center: "contain",
};

export default function XImage({
                                   source,
                                   resizeMode = "cover",
                                   style,
                                   defaultSource,
                                   onLoad,
                                   onError,
                                   onLoadStart,
                                   onLoadEnd,
                               }: XImageProps) {
    if (typeof source === "number") {
        // برای وب require(...) پشتیبانی نمی‌کنیم
        throw new Error("Static require images not supported in web version yet");
    }

    const uri = source.uri;

    // شبیه‌سازی defaultSource (Placeholder)
    const placeholderUri = defaultSource && typeof defaultSource !== "number" ? defaultSource.uri : undefined;

    return (
        <NextImage
            src={uri}
            alt=""
            width={style?.width ? Number(style.width) : 100}
            height={style?.height ? Number(style.height) : 100}
            style={{ ...style, objectFit: resizeModeMap[resizeMode] } as React.CSSProperties}
            placeholder={placeholderUri ? "blur" : undefined}
            blurDataURL={placeholderUri}
            onLoad={onLoad}
            onError={onError}
        />
    );
}
