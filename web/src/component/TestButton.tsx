import { useState } from "react";

import { ArrowRight, Check } from "lucide-react";

type TestButtonState = "idle" | "loading" | "success";

interface TestButtonProps {
    onTest: () => Promise<void>;
    disabled?: boolean;
}

export default function TestButton({ onTest, disabled = false }: TestButtonProps) {
    const [state, setState] = useState<TestButtonState>("idle");

    const handleClick = async () => {
        if (state !== "idle" || disabled) return;

        setState("loading");

        try {
            await onTest();
            setState("success");

            // Reset after 0.5 seconds
            setTimeout(() => {
                setState("idle");
            }, 500);
        } catch (error) {
            console.error("Test failed:", error);
            setState("idle");
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || state !== "idle"}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                state === "success"
                    ? "bg-green-500"
                    : "bg-white border-2 border-slate-300 hover:border-slate-400"
            } ${disabled || state !== "idle" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            aria-label="Test area"
        >
            {/* Circular progress border */}
            {state === "loading" && (
                <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 48 48"
                >
                    <circle
                        cx="24"
                        cy="24"
                        r="22"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="3"
                        strokeDasharray="138"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        className="animate-spin-progress"
                    />
                </svg>
            )}

            {/* Icon content */}
            <div className="relative z-10">
                {state === "idle" && (
                    <ArrowRight className="w-5 h-5 text-slate-700" />
                )}
                {state === "loading" && (
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                )}
                {state === "success" && (
                    <Check className="w-6 h-6 text-white animate-scale-in" />
                )}
            </div>
        </button>
    );
}
