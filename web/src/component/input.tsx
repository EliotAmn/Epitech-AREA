import { forwardRef, useState } from "react";

import EyeIcon from "./icons/EyeIcon";
import EyeOffIcon from "./icons/EyeOffIcon";

interface InputProps {
    placeholder?: string;
    value: string;
    onChange?: (newValue: string) => void;
    isFixed?: boolean;
    showToggle?: boolean;
    isHidden?: boolean;
    mode?: "default" | "white";
    fullWidth?: boolean;
    className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            placeholder = "",
            value,
            onChange,
            isFixed = false,
            showToggle = false,
            isHidden,
            mode = "default",
            fullWidth = false,
            className = "",
        },
        ref
    ) => {
        const [visible, setVisible] = useState<boolean>(false);

        let type = "text";

        if (
            (showToggle && !visible) ||
            (typeof isHidden === "boolean" && isHidden)
        ) {
            type = "password";
        }

        const modeClasses = (() => {
            switch (mode) {
                case "white":
                    return "text-white border-gray-200 focus:ring-white";
                case "default":
                default:
                    return "text-[#A7A7A7] border-gray-200 focus:ring-blue-500";
            }
        })();

        return (
            <div
                className={`relative w-full ${fullWidth ? "max-w-none" : "max-w-[480px]"}`}
            >
                <input
                    ref={ref}
                    type={type}
                    className={`w-full h-12 sm:h-[50px] px-4 sm:px-[15px] font-bold py-2 border-2 rounded-xl ${className ?? "text-sm sm:text-[18px]"} focus:outline-none focus:ring-2 ${modeClasses}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) =>
                        !isFixed && onChange && onChange(e.target.value)
                    }
                    disabled={isFixed}
                />
                {showToggle && (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded text-gray-600 hover:text-gray-800"
                        aria-label={visible ? "Hide content" : "Show content"}
                    >
                        {visible ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
