type ToastProps = {
    visible?: boolean;
    title?: string;
    subtitle?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    className?: string;
};

export default function Toast({
    visible = true,
    title = "Confirm action",
    subtitle,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    loading = false,
    onConfirm,
    onCancel,
    className = "",
}: ToastProps) {
    if (!visible) return null;
    return (
        <div
            className={`fixed right-6 bottom-6 z-50 ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="toast-title"
        >
            <div className="w-[340px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-4 flex flex-col gap-3">
                <div
                    id="toast-title"
                    className="text-sm text-slate-800 font-semibold"
                >
                    {title}
                </div>
                {subtitle && (
                    <div className="text-xs text-slate-500">{subtitle}</div>
                )}
                <div className="flex gap-3 justify-end mt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {loading ? "..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
