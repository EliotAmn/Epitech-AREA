import { useState } from "react";

import { getPlatformIcon } from "@/config/platforms";

function lightenColor(color: string, percent: number): string {
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        console.error("Invalid color format. Expected a valid hex color code.");
        return color;
    }

    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    const newColor =
        "#" +
        (
            0x1000000 +
            (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 0 ? 0 : B) : 255)
        )
            .toString(16)
            .slice(1)
            .toUpperCase();

    return newColor;
}

interface WidgetProps {
    title: string;
    platform: string;
    color?: string;
    onClick?: () => void;
}

export default function Widget({
    title,
    color = "#ffffff",
    platform,
    onClick,
}: WidgetProps) {
    const [isHovered, setIsHovered] = useState(false);
    const iconSrc = getPlatformIcon(platform);

    return (
        <div
            className={`w-full sm:w-[340px] h-auto sm:h-[401px] rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 ease-out flex flex-col items-start justify-start shrink-0`}
            style={{
                backgroundColor: isHovered ? lightenColor(color, 5) : color,
            }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {platform && iconSrc && (
                <div className="flex-1 w-full flex items-center justify-center">
                    <img
                        src={iconSrc}
                        alt={`${platform} icon`}
                        className="w-32 h-32 object-contain"
                    />
                </div>
            )}
            <h2 className="w-full text-3xl text-center text-[#ffffff] font-semibold mb-2">
                {title}
            </h2>
            <p className="w-full text-center text-sm sm:text-md text-[#ffffff]">
                {platform}
            </p>
        </div>
    );
}
