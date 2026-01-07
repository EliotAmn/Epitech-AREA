import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import GlassCardLayout from "@/component/glassCard";
import { getPlatformColor } from "@/config/platforms";
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
            console.error(err);
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
                <p className="text-slate-400 italic text-sm mt-2">
                    No configuration needed
                </p>
            );
        }

        const handleChange = (name: string, value: unknown) => {
            onChange({ ...values, [name]: value });
        };

        return (
            <div className="space-y-4 w-full">
                {params.map((p) => (
                    <div key={p.name} className="flex flex-col">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                            {p.label || p.name}
                        </label>
                        {p.type === "string" && (
                            <Input
                                value={(values[p.name] as string) ?? ""}
                                onChange={(val) => handleChange(p.name, val)}
                                placeholder={p.description || ""}
                            />
                        )}
                        {p.type === "number" && (
                            <Input
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
                            <div className="flex items-center p-2">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-slate-300 text-black focus:ring-slate-400"
                                    checked={!!(values[p.name] as boolean)}
                                    onChange={(e) =>
                                        handleChange(p.name, e.target.checked)
                                    }
                                />
                            </div>
                        )}
                        {p.type === "select" && (
                            <select
                                className="p-3 rounded-xl bg-slate-100 border-none text-black w-full outline-none focus:ring-2 focus:ring-slate-200"
                                value={(values[p.name] as string) ?? ""}
                                onChange={(e) =>
                                    handleChange(p.name, e.target.value)
                                }
                            >
                                <option value="">Select</option>
                                {(p.options || []).map((opt) => {
                                    if (typeof opt === "string") {
                                        return (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        );
                                    }
                                    const label =
                                        (opt as any).label ??
                                        (opt as any).value;
                                    const value = (opt as any).value ?? label;
                                    return (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (!area || !catalog)
        return (
            <div className="w-full h-full flex items-center justify-center font-bold">
                Loading...
            </div>
        );

    const actionName = area.actions?.[0]?.action_name || "";
    const reactionName = area.reactions?.[0]?.reaction_name || "";

    type CatalogItemWithDef = CatalogItem & { defName?: string };
    const actionItem = catalog.actions.find(
        (a: CatalogItemWithDef) =>
            a.title === actionName || a.defName === actionName
    );
    const brandColor = actionItem
        ? getPlatformColor(actionItem.platform)
        : "#5865F2";

    const formatName = (name: string) => {
        const withSpaces = name.replace(/_/g, " ");
        return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
    };

    return (
        <GlassCardLayout
            color={brandColor}
            onBack={() => navigate(-1)}
            backLabel="Cancel"
            footer={false}
        >
            <div className="flex flex-col w-full max-w-md mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 leading-tight">
                        Edit Area
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        Adjust your automation parameters
                    </p>
                </div>

                <div className="space-y-10">
                    <div
                        className="relative pl-6 border-l-4"
                        style={{ borderColor: brandColor }}
                    >
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1">
                            Trigger
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">
                            {formatName(actionName)}
                        </h3>
                        {renderInputs(
                            getParamsDefinition(actionName, "action"),
                            actionParams,
                            setActionParams
                        )}
                    </div>

                    <div
                        className="relative pl-6 border-l-4"
                        style={{ borderColor: brandColor }}
                    >
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1">
                            Reaction
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">
                            {formatName(reactionName)}
                        </h3>
                        {renderInputs(
                            getParamsDefinition(reactionName, "reaction"),
                            reactionParams,
                            setReactionParams
                        )}
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center gap-3">
                    <Button
                        label={loading ? "Saving..." : "Save Changes"}
                        onClick={handleSave}
                        disabled={loading}
                        mode="black"
                        className="w-full py-4"
                    />
                    <button
                        onClick={() => navigate(-1)}
                        className="text-slate-400 text-xs font-bold uppercase hover:text-slate-600 transition-colors py-2 text-center"
                    >
                        Discard
                    </button>
                    <button
                        onClick={() => navigate("/my-areas")}
                        className="text-red-500 text-xs font-bold uppercase hover:text-red-700 transition-colors py-2 text-center"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </GlassCardLayout>
    );
}
