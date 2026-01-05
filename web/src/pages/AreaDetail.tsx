import { useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { getPlatformIcon } from "@/config/platforms";
import { areaService } from "@/services/api/areaService";
import Button from "../component/button";
import GlassCardLayout from "@/component/glassCard";

export default function AreaDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { area, item } = location.state || {};
    const [loading, setLoading] = useState(false);

    if (!area || !item) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold mb-4">Area not found</h2>
                <Button label="Back" onClick={() => navigate("/my-areas")} />
            </div>
        );
    }

    const handleDelete = async () => {
        if (!window.confirm(`Delete area "${area.name}"?`)) return;
        setLoading(true);
        try {
            await areaService.deleteArea(area.id);
            navigate("/my-areas");
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const renderParams = (params: Record<string, unknown>) => {
        if (Object.keys(params).length === 0) {
            return (
                <p className="text-gray-400 italic text-sm mt-1">
                    No parameters
                </p>
            );
        }
        return (
            <div className="mt-2 rounded p-3">
                <ul className="space-y-1">
                    {Object.entries(params).map(([key, value]) => (
                        <li key={key} className="text-sm text-white break-all">
                            <span className="font-semibold text-white">
                                {key.replace(/_/g, " ")}:
                            </span>{" "}
                            {String(value)}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const actionName = area.actions?.[0]?.action_name || "Unknown";
    const reactionName = area.reactions?.[0]?.reaction_name || "Unknown";
    const platformIcon = getPlatformIcon(item.platform);

    const actionParams = area.actions?.[0]?.params || {};
    const reactionParams = area.reactions?.[0]?.params || {};

    return (
        <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-slate-50">
            <GlassCardLayout color={item.color} onBack={() => navigate(-1)}>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">
                        Resume Area
                    </span>

                    <h2 className="text-4xl text-slate-900 font-extrabold mb-10 text-center leading-tight">
                            {item.title}
                    </h2>

                    <div className="relative mb-12">
                        <div
                            className="absolute inset-0 blur-2xl opacity-30 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        {platformIcon && (
                            <img
                                src={platformIcon}
                                alt={item.platform}
                                className="relative w-32 h-32 object-contain transition-transform hover:scale-110 duration-300"
                            />
                        )}
                    </div>
                </div>
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-full space-y-6">
                        <div className="relative pl-5 border-l-2 text-left w-full" style={{ borderColor: item.color }}>
                            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                Action
                            </h3>
                            <p className="text-xl md:text-2xl font-bold text-slate-800 wrap-break-words leading-tight">
                                {actionName}
                            </p>
                            <div className="overflow-x-hidden">
                                {renderParams(actionParams)}
                            </div>
                        </div>

                        <div className="relative pl-5 border-l-2 text-left w-full" style={{ borderColor: item.color }}>
                            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                Reaction
                            </h3>
                            <p className="text-xl md:text-2xl font-bold text-slate-800 wrap-break-words leading-tight">
                                {reactionName}
                            </p>
                            <div className="overflow-x-hidden">
                                {renderParams(reactionParams)}
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-wrap gap-4 justify-center mt-10">
                        <div className="flex-1 min-w-[140px]">
                            <Button
                                label="Edit Area"
                                onClick={() => navigate("/my-areas/edit", { state: { area } })}
                                mode="black"
                                height="small"
                            />
                        </div>
                        <div className="flex-1 min-w-[140px]">
                            <Button
                                label={loading ? "Deleting..." : "Delete Area"}
                                onClick={handleDelete}
                                disabled={loading}
                                mode="black"
                                height="small"
                            />
                        </div>
                    </div>
                </div>
            </GlassCardLayout>
        </div>
    );
}
