import { useState } from "react";

import { ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import GlassCardLayout from "@/component/glassCard";
import Toast from "@/component/Toast";
import { getPlatformIcon } from "@/config/platforms";
import { areaService } from "@/services/api/areaService";
import Button from "../component/button";

export default function AreaDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { area, item } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    if (!area || !item) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold mb-4">Area not found</h2>
                <Button label="Back" onClick={() => navigate("/my-areas")} />
            </div>
        );
    }

    const handleDelete = () => {
        // open confirmation toast
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await areaService.deleteArea(area.id);
            navigate("/my-areas");
        } catch (err) {
            console.error(err);
            setLoading(false);
        } finally {
            setShowConfirm(false);
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
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
                        <li
                            key={key}
                            className="text-sm text-gray-700 break-all"
                        >
                            <span className="font-semibold text-gray-900">
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
    console.log("area.actions", area.actions);
    console.log("item", item);
    const actionPlatform =
        (item && item.platform) || area.actions?.[0]?.platform;
    const reactionPlatform =
        (item && (item as any).reactionPlatform) ||
        area.reactions?.[0]?.platform;

    const actionIcon = getPlatformIcon(actionPlatform);
    const reactionIcon = getPlatformIcon(reactionPlatform);
    const samePlatform = actionPlatform === reactionPlatform;

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
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <img
                                src={actionIcon}
                                alt={`${actionIcon} icon`}
                                className={
                                    samePlatform
                                        ? "w-32 h-32 object-contain"
                                        : "w-16 h-16 object-contain"
                                }
                            />
                            {!samePlatform && (
                                <>
                                    <ArrowRight className="w-6 h-6 text-gray-500" />
                                    <img
                                        src={reactionIcon}
                                        alt={`${reactionIcon} icon`}
                                        className="w-16 h-16 object-contain"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-full space-y-6">
                        <div
                            className="relative pl-5 border-l-2 text-left w-full"
                            style={{ borderColor: item.color }}
                        >
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

                        <div
                            className="relative pl-5 border-l-2 text-left w-full"
                            style={{ borderColor: item.color }}
                        >
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
                                onClick={() =>
                                    navigate("/my-areas/edit", {
                                        state: { area },
                                    })
                                }
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

            {/* confirmation toast */}
            <Toast
                visible={showConfirm}
                title={`Supprimer l'area "${area.name}" ?`}
                subtitle="Cette action est irréversible."
                loading={loading}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                confirmLabel={loading ? "Suppression..." : "Confirmer"}
                cancelLabel="Annuler"
            />
        </div>
    );
}
