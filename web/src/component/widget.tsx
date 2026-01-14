import { useState } from "react";

import { ArrowRight } from "lucide-react";

import { getPlatformColor, getPlatformIcon } from "@/config/platforms";

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
    reactionPlatform?: string;
    color?: string;
    onClick?: () => void;
    showPlatform?: boolean;
}

export default function Widget({
    title,
    color = "#ffffff",
    platform,
    reactionPlatform,
    onClick,
    showPlatform = true,
}: WidgetProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const iconSrc = getPlatformIcon(platform);
    const samePlatform = !reactionPlatform || platform === reactionPlatform;

    const reactionColor = reactionPlatform
        ? getPlatformColor(reactionPlatform)
        : undefined;
    const primaryColor = color;
    const primaryHover = lightenColor(primaryColor, 5);
    const reactionHover = reactionColor
        ? lightenColor(reactionColor, 5)
        : undefined;

    const primaryClicked = lightenColor(primaryColor, 20);
    const reactionClicked = reactionColor
        ? lightenColor(reactionColor, 20)
        : undefined;
    const backgroundStyle =
        !reactionColor || samePlatform
            ? {
                  backgroundColor: isPressed
                      ? primaryClicked
                      : isHovered
                        ? primaryHover
                        : primaryColor,
              }
            : {
                  backgroundImage: `linear-gradient(135deg, ${isPressed ? primaryClicked : isHovered ? primaryHover : primaryColor} 0%, ${isPressed ? reactionClicked : isHovered ? reactionHover : reactionColor} 100%)`,
              };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-pressed={isPressed}
            className={`w-full sm:w-[340px] h-auto sm:h-[401px] rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 ease-out flex flex-col items-start justify-between shrink-0 ${onClick ? "cursor-pointer" : ""}`}
            style={{
                ...backgroundStyle,
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => {
                if (isPressed) {
                    setIsPressed(false);
                    onClick?.();
                }
            }}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => {
                if (isPressed) {
                    setIsPressed(false);
                    onClick?.();
                }
            }}
            onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
                    e.preventDefault();
                    setIsPressed(true);
                }
            }}
            onKeyUp={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (isPressed) {
                        setIsPressed(false);
                        onClick?.();
                    }
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                if (isPressed) setIsPressed(false);
            }}
        >
            <div
                className="w-full flex-none flex items-center justify-center gap-4 mb h-64"
                role="img"
                aria-label={`Action ${platform}${!samePlatform ? ` and reaction ${platform[1]}` : ""}`}
            >
                <img
                    src={iconSrc}
                    alt={
                        Array.isArray(platform)
                            ? `${platform[0]} icon`
                            : "action icon"
                    }
                    className={
                        samePlatform
                            ? "w-32 h-32 object-contain"
                            : "w-18 h-18 object-contain"
                    }
                />
                {!samePlatform && reactionPlatform ? (
                    <>
                        <ArrowRight
                            className="w-6 h-6 text-gray-500"
                            aria-hidden
                        />
                        <img
                            src={getPlatformIcon(reactionPlatform)}
                            alt={iconSrc ? `${iconSrc} icon` : "reaction icon"}
                            className="w-18 h-18 object-contain"
                        />
                    </>
                ) : null}
            </div>
            <div className="w-full">
                <h2 className="w-full text-3xl text-center text-[#ffffff] font-semibold mb-2">
                    {title}
                </h2>
                {showPlatform ? (
                    <p className="w-full text-center text-sm sm:text-md text-[#ffffff]">
                        {platform}{" "}
                        {reactionPlatform && !samePlatform
                            ? `& ${reactionPlatform}`
                            : ""}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
