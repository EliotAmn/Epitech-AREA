import { useEffect } from "react";

import { useNotificationContext } from "@/context/NotificationContext";

export default function NotificationCenter() {
    const { notifications, dismiss } = useNotificationContext();

    useEffect(() => {
        return () => {};
    }, []);

    if (!notifications || notifications.length === 0) return null;

    return (
        <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-3">
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className={`w-[320px] rounded-lg p-3 shadow-lg border flex items-start gap-3 transition-transform bg-white ${
                        n.type === "success"
                            ? "border-green-100"
                            : n.type === "error"
                              ? "border-red-100"
                              : "border-slate-100"
                    }`}
                    role="status"
                >
                    <div className="flex-0 mt-0.5">
                        {n.type === "success" ? (
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4"
                                />
                            </svg>
                        ) : n.type === "error" ? (
                            <svg
                                className="w-6 h-6 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-6 h-6 text-slate-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01"
                                />
                            </svg>
                        )}
                    </div>

                    <div className="flex-1 text-left">
                        <div className="font-semibold text-sm text-slate-900">
                            {n.title}
                        </div>
                        {n.message && (
                            <div className="text-xs text-slate-500 mt-1">
                                {n.message}
                            </div>
                        )}
                    </div>

                    <div className="flex-none ml-2">
                        <button
                            onClick={() => dismiss(n.id)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                            aria-label="close notification"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
