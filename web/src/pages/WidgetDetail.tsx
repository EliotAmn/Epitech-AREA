import { useLocation, useNavigate } from "react-router-dom";

import GlassCardLayout from "@/component/glassCard";
import { getPlatformIcon } from "@/config/platforms";
import Button from "../component/button";

type WidgetLocationState = {
    title?: string;
    color?: string;
    platform?: string;
    oauth_url?: string;
};

export default function WidgetDetail() {
    const navigate = useNavigate();
    const location = useLocation() as { state?: WidgetLocationState };
    const state = location.state ?? {};

    const title = state.title ?? "Widget without title";
    const color = typeof state.color === "string" ? state.color : "#5865F2";
    const platform = state.platform ?? "unknown";
    const oauth_url = state.oauth_url;

    const platformIcon = getPlatformIcon(platform);

    return (
        <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-slate-50">
            <div
                className="absolute inset-0 z-0 opacity-50"
                style={{
                    filter: "blur(100px)",
                    backgroundImage: `
                        radial-gradient(at 0% 0%, ${color} 0px, transparent 70%),
                        radial-gradient(at 100% 0%, ${color} 0px, transparent 70%),
                        radial-gradient(at 50% 50%, ${color} 0px, transparent 70%)
                    `,
                }}
            />

            <GlassCardLayout color={color} onBack={() => navigate(-1)}>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">
                        Connect {platform}
                    </span>
                    <h2 className="text-4xl text-slate-900 font-extrabold mb-10 text-center leading-tight">
                        {title}
                    </h2>
                    <div className="relative mb-12">
                        <div
                            className="absolute inset-0 blur-2xl opacity-30 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        {platformIcon && (
                            <img
                                src={platformIcon}
                                alt={platform}
                                className="relative w-32 h-32 object-contain transition-transform hover:scale-110 duration-300"
                            />
                        )}
                    </div>
                    <div className="w-full max-w-sm flex flex-col items-center gap-6">
                        <Button
                            label={`Connect ${platform}`}
                            onClick={() => {
                                if (oauth_url) {
                                    window.location.href = oauth_url;
                                } else {
                                    navigate("/create");
                                }
                            }}
                        />
                        <p className="text-slate-500 text-sm font-medium text-center leading-relaxed">
                            Connect your <strong>{platform}</strong> account to
                            enable this automation and start using{" "}
                            <strong>{title}</strong>.
                        </p>
                    </div>
                </div>
            </GlassCardLayout>
        </div>
    );
}
