import React from "react";

interface ButtonProps {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: string | React.ReactNode;
    mode?: "white" | "black" | "grey" | "blue";
    height?: "small" | "normal";
    className?: string;
}

export default function Button({
    label,
    onClick,
    disabled = false,
    icon,
    mode = "black",
    height = "normal",
    className = "",
}: ButtonProps) {
    const base = (() => {
        switch (height) {
            case "small":
                return "inline-flex items-center justify-center px-4 py-2 w-full sm:w-[245px] md:w-[285px] h-12 sm:h-12 hover:font-bold rounded-full border";
            case "normal":
            default:
                return "inline-flex items-center justify-center px-4 py-2 w-full sm:w-[300px] md:w-[340px] h-12 sm:h-14 hover:font-bold rounded-full border";
        }
    })();

    const modeClasses = (() => {
        switch (mode) {
            case "white":
                return "bg-white text-black border-gray-300 hover:scale-105 focus:bg-gray-100";
            case "grey":
                return "bg-gray-500 text-white border-transparent hover:scale-105 focus:bg-gray-600";
            case "blue":
                return "bg-blue-500 text-white border-transparent hover:bg-blue-600 hover:scale-105 focus:bg-blue-700";
            case "black":
            default:
                return "bg-black text-white border-transparent hover:scale-105 focus:bg-gray-800";
        }
    })();

    return (
        <button
            type="button"
            className={`${base} ${modeClasses} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon ? (
                typeof icon === "string" ? (
                    <img
                        src={icon}
                        alt="icon"
                        className="w-4 h-4 object-contain mr-3"
                    />
                ) : (
                    <span className="mr-3 flex items-center">{icon}</span>
                )
            ) : null}
            <span>{label}</span>
        </button>
    );
}
