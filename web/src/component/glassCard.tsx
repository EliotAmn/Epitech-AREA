interface GlassCardLayoutProps {
    children: React.ReactNode;
    color: string;
    backLabel?: string;
    onBack?: () => void;
}

export default function GlassCardLayout({ children, color, backLabel = "Back", onBack }: GlassCardLayoutProps) {

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-50">
            <div
                className="absolute inset-0 z-0 opacity-40"
                style={{
                    filter: "blur(100px)",
                    backgroundImage: `
                        radial-gradient(at 0% 0%, ${color} 0px, transparent 50%),
                        radial-gradient(at 100% 100%, ${color} 0px, transparent 50%),
                        radial-gradient(at 50% 50%, ${color} 0px, transparent 50%)
                    `
                }}
            />

            {onBack && (
                <button onClick={onBack} className="absolute top-8 left-8 z-20 text-slate-600 hover:text-black font-medium flex items-center gap-2">
                    ← {backLabel}
                </button>
            )}

            <div className="relative z-10 w-full max-w-2xl mx-4 my-8">
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-4xl p-8 md:p-10 shadow-2xl flex flex-col items-center">
                    <div className="w-full">
                        {children}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200/50 w-full flex justify-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <span>🔒 Secure</span>
                        <span>⚡ Instant</span>
                        <span>🛠 No-code</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
