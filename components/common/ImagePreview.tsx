import { useState } from 'react';
import Image from 'next/image';
import { getMainFilePath, getSmallFilePath } from "@/lib/utils/utils";

export default function ImageView({
                                      imagId = "",
                                      small = false,
                                      zoomable = false,
                                      alt = "Image",
                                      width = 100,
                                      height = 100,
                                      round = false,
                                      objectFit = "cover",
                                      className = "",
                                      style = {},
                                      priority = false,
                                      loading = "lazy",
                                      rounded=false,
                                      ...props
                                  }) {
    const [isOpen, setIsOpen] = useState(false);

    const src = small ? getSmallFilePath(imagId) : getMainFilePath(imagId);

    const handleClick = () => {
        if (zoomable) setIsOpen(true);
    };

    const imageStyle = {
        borderRadius: round ? "50%" : "8px", // پیش‌فرض کمی گرد
        ...style,
    };

    return (
        <>
            <div onClick={handleClick} style={{ cursor: zoomable ? "pointer" : "default" }}>
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    style={{ ...imageStyle,
                        //objectFit
                    }}
                    className={className}
                    priority={priority}
                    //loading={loading}
                    {...props}
                />
            </div>

            {isOpen && zoomable && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.8)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                        cursor: "pointer",
                    }}
                >
                    <Image
                        src={getMainFilePath(imagId)}
                        alt={alt}
                        width={800}
                        height={800}
                        style={{ objectFit: "contain" }}
                    />
                </div>
            )}
        </>
    );
}
