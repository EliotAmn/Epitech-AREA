import { useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { getPlatformIcon } from "@/config/platforms";
import { areaService } from "@/services/api/areaService";
import Button from "../component/button";

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

    const actionName = area.actions?.[0]?.action_name || "Unknown";
    const reactionName = area.reactions?.[0]?.reaction_name || "Unknown";
    const platformIcon = getPlatformIcon(item.platform);

    const actionParams = area.actions?.[0]?.params || {};
    const reactionParams = area.reactions?.[0]?.params || {};

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

    return (
        <div
            className="p-8 w-full h-full overflow-hidden flex flex-col items-center relative"
            style={{ backgroundColor: item.color }}
        >
            <button
                onClick={() => navigate("/my-areas")}
                className="absolute top-8 left-8 text-white text-xl font-bold hover:opacity-80"
            >
                ← Back
            </button>

            <h2 className="text-5xl text-white font-bold mb-8 mt-8 text-center shrink-0">
                {area.name}
            </h2>

            <div className="flex-1 flex flex-col items-center w-full max-w-3xl overflow-y-auto min-h-0 no-scrollbar">
                <div className="rounded-lg p-8 w-full mb-8 shrink-0 border border-white shadow-lg">
                    <div className="flex items-center justify-center mb-6">
                        {platformIcon && (
                            <img
                                src={platformIcon}
                                alt="icon"
                                className="w-24 h-24 object-contain"
                            />
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-1">
                                Action
                            </h3>
                            <p className="text-2xl font-semibold text-white">
                                {actionName}
                            </p>
                            {renderParams(actionParams)}
                        </div>

                        <div className="pt-6">
                            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-1">
                                Reaction
                            </h3>
                            <p className="text-2xl font-semibold text-white">
                                {reactionName}
                            </p>
                            {renderParams(reactionParams)}
                        </div>
                    </div>
                </div>

                <div className="mt-auto mb-8 flex gap-4">
                    <Button
                        label="Edit Area"
                        onClick={() =>
                            navigate("/my-areas/edit", { state: { area } })
                        }
                        mode="white"
                    />
                    <Button
                        label={loading ? "Deleting..." : "Delete Area"}
                        onClick={handleDelete}
                        disabled={loading}
                        mode="white"
                    />
                </div>
            </div>
        </div>
    );
}
