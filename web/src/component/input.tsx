import React, { forwardRef, useState } from "react";

interface InputProps {
    placeholder?: string;
    value: string;
    onChange?: (newValue: string) => void;
    isFixed?: boolean;
    showToggle?: boolean;
    isHidden?: boolean;
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
        },
        ref
    ) => {
        const [visible, setVisible] = useState<boolean>(false);

        const type = showToggle
            ? visible
                ? "text"
                : "password"
            : typeof isHidden === "boolean"
              ? isHidden
                  ? "password"
                  : "text"
              : "text";

        return (
            <div className="relative w-[480px]">
                <input
                    ref={ref}
                    type={type}
                    className="w-full h-[50px] px-[15px] text-[#A7A7A7] font-bold py-2 border-gray-200 border-2 rounded-xl text-[18px] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        {visible ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.223-3.555M6.1 6.1A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.965 9.965 0 01-2.045 3.468M3 3l18 18"
                                />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
