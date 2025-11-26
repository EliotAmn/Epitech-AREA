import React from "react";

interface ProgressBarProps {
  steps: number;
  current: number;
  onStepClick?: (n: number) => void;
  labels?: string[];
  completedSteps?: boolean[];
}

export default function ProgressBar({ steps, current, onStepClick, labels = [], completedSteps }: ProgressBarProps) {
  const denom = Math.max(1, steps - 1);
  const percent = Math.max(0, Math.min(100, ((current - 1) / denom) * 100));

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="relative h-10">
        <div className="absolute left-0 right-0 top-4 h-2 bg-gray-200 rounded" />
        <div
          className="absolute left-0 top-4 h-2 bg-blue-600 rounded"
          style={{
            width: `${percent}%`,
            transition: "width 500ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {Array.from({ length: steps }).map((_, i) => {
          const n = i + 1;
          const left = (i / denom) * 100;

          const completed = Array.isArray(completedSteps)
            ? !!completedSteps[i]
            :
              (n === 1 && percent >= 0 && current > 1) ||
              (n > 1 && percent >= ((n - 1) / denom) * 100);

          const active = current === n;
          const dotClass = completed ? "bg-blue-600" : active ? "bg-white border-4 border-blue-600" : "bg-gray-200";
            return (
                <button
                key={n}
                type="button"
                onClick={() => onStepClick?.(n)}
                className={`absolute top-2 w-6 h-6 rounded-full transform -translate-x-1/2 focus:outline-none ${dotClass}`}
                style={{ left: `${left}%` }}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${n}${labels[i] ? `: ${labels[i]}` : ""}`}
                />
            );
        }
        )}
        </div>
    </div>
    );
}
