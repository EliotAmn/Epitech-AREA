import React from "react";

interface ButtonProps {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: string | React.ReactNode;
    mode?: "white" | "black";
    className?: string;
}

export default function Button({
    label,
    onClick,
    disabled = false,
    icon,
    mode = "black",
    className = "",
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center px-4 py-2 w-full sm:w-[300px] md:w-[340px] h-12 sm:h-14 hover:font-bold rounded-full border";

    const modeClasses = (() => {
        switch (mode) {
            case "white":
                return "bg-white text-black border-gray-300 hover:scale-105 focus:bg-gray-100";
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
