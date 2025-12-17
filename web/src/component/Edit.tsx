import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { getPlatformColor, getPlatformIcon } from "@/config/platforms";
import { fetchCatalogFromAbout } from "@/services/aboutParser";
import { aboutService } from "@/services/api/aboutService";
import { areaService } from "@/services/api/areaService";
import type { CatalogItem } from "../data/catalogData";
import Button from "./button";
import type { ParameterDefinition } from "./ConfigWidget";
import Input from "./input";

type ServiceActionReaction = {
    name: string;
    description: string;
    input_params?: ParameterDefinition[];
};

type ServiceDefinition = {
    name: string;
    actions: ServiceActionReaction[];
    reactions: ServiceActionReaction[];
};

type AboutData = {
    server: {
        services: ServiceDefinition[];
    };
};

interface Area {
    id: string;
    name: string;
    actions: {
        action_name: string;
        params?: Record<string, unknown>;
    }[];
    reactions: {
        reaction_name: string;
        params?: Record<string, unknown>;
    }[];
}

interface EditProps {
    area: Area;
}

export default function Edit({ area }: EditProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [aboutData, setAboutData] = useState<AboutData | null>(null);
    const [catalog, setCatalog] = useState<{
        actions: CatalogItem[];
        reactions: CatalogItem[];
    } | null>(null);

    const [actionParams, setActionParams] = useState<Record<string, unknown>>(
        area?.actions?.[0]?.params || {}
    );
    const [reactionParams, setReactionParams] = useState<
        Record<string, unknown>
    >(area?.reactions?.[0]?.params || {});

    useEffect(() => {
        const load = async () => {
            try {
                const [about, cat] = await Promise.all([
                    aboutService.getAbout(),
                    fetchCatalogFromAbout(),
                ]);
                setAboutData(about as unknown as AboutData);
                setCatalog(cat);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    const getParamsDefinition = (name: string, type: "action" | "reaction") => {
        if (!aboutData?.server?.services) return [];
        for (const svc of aboutData.server.services) {
            const list = type === "action" ? svc.actions : svc.reactions;
            const found = list?.find((x) => x.name === name);
            if (found) return found.input_params || [];
        }
        return [];
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await areaService.deleteArea(area.id);

            const payload = {
                name: area.name,
                actions: [
                    {
                        action_name: area.actions[0].action_name,
                        params: actionParams,
                    },
                ],
                reactions: [
                    {
                        reaction_name: area.reactions[0].reaction_name,
                        params: reactionParams,
                    },
                ],
            };

            await areaService.createArea(payload);
            navigate("/my-areas");
        } catch (err) {
            console.error("Failed to update area", err);
            alert("Failed to update area");
        } finally {
            setLoading(false);
        }
    };

    const renderInputs = (
        params: ParameterDefinition[],
        values: Record<string, unknown>,
        onChange: (val: Record<string, unknown>) => void
    ) => {
        if (!params || params.length === 0) {
            return (
                <div className="text-white/80 italic">
                    No configuration needed
                </div>
            );
        }

        const handleChange = (name: string, value: unknown) => {
            onChange({ ...values, [name]: value });
        };

        return (
            <div className="space-y-4 text-left text-white w-full max-w-md mx-auto">
                {params.map((p) => (
                    <div key={p.name} className="flex flex-col">
                        <label className="text-sm font-bold mb-1">
                            {p.label || p.name}
                        </label>
                        {p.type === "string" && (
                            <Input
                                mode="white"
                                value={(values[p.name] as string) ?? ""}
                                onChange={(val) => handleChange(p.name, val)}
                                placeholder={p.description || ""}
                            />
                        )}
                        {p.type === "number" && (
                            <Input
                                mode="white"
                                value={
                                    (values[p.name] as number)?.toString() ?? ""
                                }
                                onChange={(val) =>
                                    handleChange(p.name, Number(val))
                                }
                                placeholder={p.description || ""}
                            />
                        )}
                        {p.type === "boolean" && (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-6 h-6 rounded text-black border-none focus:ring-2 focus:ring-white/50"
                                    checked={!!(values[p.name] as boolean)}
                                    onChange={(e) =>
                                        handleChange(p.name, e.target.checked)
                                    }
                                />
                            </div>
                        )}
                        {p.type === "select" && (
                            <select
                                className="p-3 rounded-lg text-black w-full border-none outline-none focus:ring-2 focus:ring-white/50"
                                value={(values[p.name] as string) ?? ""}
                                onChange={(e) =>
                                    handleChange(p.name, e.target.value)
                                }
                            >
                                <option value="">Select</option>
                                {(p.options || []).map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (!area || !catalog) return <div>Loading...</div>;

    const actionName = area.actions?.[0]?.action_name || "";
    const reactionName = area.reactions?.[0]?.reaction_name || "";

    const actionItem = catalog.actions.find(
        (a) =>
            a.title === actionName ||
            (a as CatalogItem & { defName?: string }).defName === actionName
    );
    const reactionItem = catalog.reactions.find(
        (r) =>
            r.title === reactionName ||
            (r as CatalogItem & { defName?: string }).defName === reactionName
    );

    const actionColor = actionItem
        ? getPlatformColor(actionItem.platform)
        : "#808080";
    const reactionColor = reactionItem
        ? getPlatformColor(reactionItem.platform)
        : "#808080";

    const actionIcon = actionItem ? getPlatformIcon(actionItem.platform) : null;
    const reactionIcon = reactionItem
        ? getPlatformIcon(reactionItem.platform)
        : null;

    const formatName = (name: string) => {
        const withSpaces = name.replace(/_/g, " ");
        return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
    };

    return (
        <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div
                style={{ backgroundColor: actionColor }}
                className="p-8 flex flex-col items-center gap-6"
            >
                <div className="flex items-center gap-4">
                    {actionIcon && (
                        <img
                            src={actionIcon}
                            alt="icon"
                            className="w-12 h-12 object-contain"
                        />
                    )}
                    <h2 className="text-3xl font-bold text-white">
                        {formatName(actionName)}
                    </h2>
                </div>
                {renderInputs(
                    getParamsDefinition(actionName, "action"),
                    actionParams,
                    setActionParams
                )}
            </div>

            <div
                style={{ backgroundColor: reactionColor }}
                className="p-8 flex flex-col items-center gap-6"
            >
                <div className="flex items-center gap-4">
                    {reactionIcon && (
                        <img
                            src={reactionIcon}
                            alt="icon"
                            className="w-12 h-12 object-contain"
                        />
                    )}
                    <h2 className="text-3xl font-bold text-white">
                        {formatName(reactionName)}
                    </h2>
                </div>
                {renderInputs(
                    getParamsDefinition(reactionName, "reaction"),
                    reactionParams,
                    setReactionParams
                )}
            </div>

            {/* Footer / Save */}
            <div className="bg-white p-6 flex justify-center gap-4">
                <Button
                    label="Cancel"
                    onClick={() => navigate(-1)}
                    mode="white"
                    className="border-gray-300"
                />
                <Button
                    label={loading ? "Saving..." : "Save Changes"}
                    onClick={handleSave}
                    disabled={loading}
                />
            </div>
        </div>
    );
}
