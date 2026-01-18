import { useState } from "react";

import { ArrowRight, Check } from "lucide-react";

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
    disabled?: boolean;
    areaId?: string;
    enabled?: boolean;
    onToggleEnabled?: (areaId: string) => void;
    onTest?: (areaId: string) => Promise<void>;
}

export default function Widget({
    title,
    color = "#ffffff",
    platform,
    reactionPlatform,
    onClick,
    showPlatform = true,
    disabled = false,
    areaId,
    enabled = true,
    onToggleEnabled,
    onTest,
}: WidgetProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [testState, setTestState] = useState<"idle" | "loading" | "success">("idle");
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

    const handleTest = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!areaId || !onTest || testState !== "idle" || !enabled) return;

        setTestState("loading");
        try {
            await onTest(areaId);
            setTestState("success");
            setTimeout(() => setTestState("idle"), 500);
        } catch (error) {
            console.error("Test failed:", error);
            setTestState("idle");
        }
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (!areaId || !onToggleEnabled) return;
        onToggleEnabled(areaId);
    };

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
            className={`relative w-full sm:w-[340px] h-auto sm:h-[401px] rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 ease-out flex flex-col items-start justify-between shrink-0 ${onClick ? "cursor-pointer" : ""} ${disabled ? "opacity-50 grayscale" : ""}`}
            style={{
                ...backgroundStyle,
            }}
            onMouseDown={() => !disabled && setIsPressed(true)}
            onMouseUp={() => {
                if (isPressed && !disabled) {
                    setIsPressed(false);
                    onClick?.();
                }
            }}
            onTouchStart={() => !disabled && setIsPressed(true)}
            onTouchEnd={() => {
                if (isPressed && !disabled) {
                    setIsPressed(false);
                    onClick?.();
                }
            }}
            onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !e.repeat && !disabled) {
                    e.preventDefault();
                    setIsPressed(true);
                }
            }}
            onKeyUp={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !disabled) {
                    e.preventDefault();
                    if (isPressed) {
                        setIsPressed(false);
                        onClick?.();
                    }
                }
            }}
            onMouseEnter={() => !disabled && setIsHovered(true)}
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
            {(areaId && onToggleEnabled) || (areaId && onTest) ? (
                <div 
                    className="absolute top-3 right-3 flex items-center gap-2 z-20"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                >
                    {areaId && onToggleEnabled && (
                        <label
                            className="relative inline-flex items-center cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={handleToggle}
                                className="sr-only peer"
                            />
                            <div className="w-7 h-7 bg-white/90 border-2 border-white rounded-md peer-checked:bg-green-500 peer-checked:border-green-500 transition-all duration-200 flex items-center justify-center shadow-lg">
                                {enabled && (
                                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                )}
                            </div>
                        </label>
                    )}
                    {areaId && onTest && enabled && (
                        <button
                            onClick={handleTest}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            disabled={testState !== "idle"}
                            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                                testState === "success"
                                    ? "bg-green-500"
                                    : "bg-white/90 border-2 border-white"
                            } ${testState !== "idle" ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
                            aria-label="Test area"
                        >
                            {testState === "loading" && (
                                <svg
                                    className="absolute inset-0 w-full h-full -rotate-90"
                                    viewBox="0 0 36 36"
                                >
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="16"
                                        fill="none"
                                        stroke="#22c55e"
                                        strokeWidth="3"
                                        strokeDasharray="100"
                                        strokeDashoffset="0"
                                        strokeLinecap="round"
                                        className="animate-spin-progress"
                                    />
                                </svg>
                            )}
                            <div className="relative z-10">
                                {testState === "idle" && (
                                    <ArrowRight className="w-4 h-4 text-slate-700" />
                                )}
                                {testState === "loading" && (
                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                )}
                                {testState === "success" && (
                                    <Check className="w-5 h-5 text-white animate-scale-in" />
                                )}
                            </div>
                        </button>
                    )}
                </div>
            ) : null}
            <div className="w-full">
                <h2 className="w-full text-2xl text-center text-[#ffffff] font-extrabold mb-2 line-clamp-3">
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
