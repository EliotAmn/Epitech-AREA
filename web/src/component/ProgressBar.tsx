import { ChevronLeft, Check } from "lucide-react";

interface ProgressBarProps {
    steps: number;
    current: number;
    onStepClick?: (n: number) => void;
    labels?: string[];
    completedSteps?: boolean[];
}

export default function ProgressBar({
    steps,
    current,
    onStepClick,
    labels = ["Service", "Action", "Reaction", "Finalize"],
    completedSteps,
}: ProgressBarProps) {
    const denom = Math.max(1, steps - 1);
    const percent = Math.max(0, Math.min(100, ((current - 1) / denom) * 100));

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
            <div
                className="relative h-12"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={steps}
                aria-valuenow={current}
            >
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full" />

                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-linear-to-r from-blue-500 to-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    style={{
                        width: `${percent}%`,
                        transition: "width 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                />

                {Array.from({ length: steps }).map((_, i) => {
                    const n = i + 1;
                    const left = (i / denom) * 100;
                    const isCompleted = current > n || (completedSteps && completedSteps[i]);
                    const isActive = current === n;

                    return (
                        <div
                            key={n}
                            className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                            style={{ left: `${left}%` }}
                        >
                            <button
                                type="button"
                                onClick={() => onStepClick?.(n)}
                                className={`
                                    relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                                    ${isCompleted
                                        ? "bg-blue-600 text-white"
                                        : isActive
                                            ? "bg-white border-4 border-blue-600 text-blue-600 scale-110 shadow-lg shadow-blue-200"
                                            : "bg-white border-2 border-slate-200 text-slate-400"}
                                    hover:border-blue-400
                                `}
                            >
                                {isCompleted ? (
                                    <Check size={18} strokeWidth={3} />
                                ) : (
                                    <span>{n}</span>
                                )}
                            </button>

                            <span className={`
                                absolute top-12 whitespace-nowrap text-[11px] font-black uppercase tracking-widest transition-colors duration-300
                                ${isActive ? "text-blue-600" : isCompleted ? "text-slate-800" : "text-slate-300"}
                            `}>
                                {labels[i] || `Step ${n}`}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-7 flex justify-start">
                {current > 1 && (
                    <button
                        type="button"
                        onClick={() => onStepClick?.(Math.max(1, current - 1))}
                        className="group flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                    >
                        <div className="mr-2 p-1 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors">
                            <ChevronLeft size={14} />
                        </div>
                        Back
                    </button>
                )}
            </div>
        </div>
    );
}
