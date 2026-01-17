interface GlassCardLayoutProps {
    children: React.ReactNode;
    color?: string | string[];
    backLabel?: string;
    onBack?: () => void;
    maxWidthClass?: string;
    leftCard?: React.ReactNode;
    leftColor?: string | string[];
    leftWidthClass?: string;
}

export default function GlassCardLayout({
    children,
    color,
    backLabel = "Back",
    onBack,
    maxWidthClass = "max-w-2xl",
    leftCard,
    leftWidthClass = "w-2/4",
}: GlassCardLayoutProps) {
    const colors = Array.isArray(color) ? color : [color, color];
    return (
        <div className="relative w-full min-h-full flex flex-col items-center justify-center bg-slate-50 py-10">
            <div
                className="absolute inset-0 z-0 opacity-70"
                style={{
                    filter: "blur(100px)",
                    backgroundImage: `
                        radial-gradient(at 0% 0%, ${colors[0]} 0px, transparent 75%),
                        radial-gradient(at 100% 100%, ${colors[1]} 0px, transparent 75%),
                        radial-gradient(at 50% 50%, ${colors[0]} 0px, transparent 75%)
                    `,
                }}
            />

            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    aria-label={backLabel}
                    className="absolute top-8 left-8 z-20 text-slate-600 hover:text-black font-medium flex items-center gap-2"
                >
                    ← {backLabel}
                </button>
            )}

            <div
                className={`relative z-10 w-full ${leftCard ? "max-w-6xl" : maxWidthClass} mx-4 my-8 px-4`}
            >
                {leftCard ? (
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-start justify-center gap-6 lg:gap-10">
                        <div className="w-full lg:w-1/3 z-20">
                            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-4xl p-6 md:p-8 shadow-2xl h-full">
                                <div className="w-full">{leftCard}</div>
                            </div>
                        </div>

                        <div className="w-full lg:flex-1 max-w-4xl">
                            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-4xl p-8 md:p-12 shadow-2xl flex flex-col items-center h-full">
                                <div className="w-full">{children}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-4xl p-8 md:p-10 shadow-2xl flex flex-col items-center">
                        <div className="w-full">{children}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
