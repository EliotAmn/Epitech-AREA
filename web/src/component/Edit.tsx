import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import GlassCardLayout from "@/component/glassCard";
import TestButton from "@/component/TestButton";
import Toast from "@/component/Toast";
import { getPlatformColor } from "@/config/platforms";
import { fetchCatalogFromAbout } from "@/services/aboutParser";
import { aboutService } from "@/services/api/aboutService";
import { areaService } from "@/services/api/areaService";
import type { AboutData } from "@/services/types/aboutTypes";
import type { CatalogItem } from "../data/catalogData";
import Button from "./button";
import type { ParameterDefinition, SelectOption } from "./ConfigWidget";
import Input from "./input";

interface Area {
    id: string;
    name: string;
    enabled?: boolean;
    actions: {
        id?: string;
        action_name: string;
        service: string;
        params?: Record<string, unknown>;
    }[];
    reactions: {
        id?: string;
        reaction_name: string;
        service: string;
        params?: Record<string, unknown>;
    }[];
}

interface EditProps {
    area: Area;
}

interface UpdateAreaDTO {
    name?: string;
    actions?: { id: string; params?: Record<string, unknown> }[];
    reactions?: { id: string; params?: Record<string, unknown> }[];
}

export default function Edit({ area }: EditProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [aboutData, setAboutData] = useState<AboutData | null>(null);
    const [catalog, setCatalog] = useState<{
        actions: CatalogItem[];
        reactions: CatalogItem[];
    } | null>(null);

    const [name, setName] = useState(area?.name || "");
    const [enabled, setEnabled] = useState(area?.enabled ?? true);
    const [actionsParams, setActionsParams] = useState<
        Record<number, Record<string, unknown>>
    >(
        area?.actions?.reduce(
            (acc, a, idx) => {
                acc[idx] = a.params || {};
                return acc;
            },
            {} as Record<number, Record<string, unknown>>
        ) || {}
    );
    const [reactionsParams, setReactionsParams] = useState<
        Record<number, Record<string, unknown>>
    >(
        area?.reactions?.reduce(
            (acc, r, idx) => {
                acc[idx] = r.params || {};
                return acc;
            },
            {} as Record<number, Record<string, unknown>>
        ) || {}
    );

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await areaService.deleteArea(area.id);
            navigate("/my-areas");
        } catch (err) {
            console.error(err);
            setDeleting(false);
        } finally {
            setShowConfirmDelete(false);
        }
    };

    const handleToggleEnabled = async () => {
        try {
            await areaService.toggleEnabled(area.id);
            setEnabled(!enabled);
        } catch (err) {
            console.error("Failed to toggle enabled state:", err);
        }
    };

    const handleTestArea = async () => {
        await areaService.testArea(area.id);
    };

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
            const dto: UpdateAreaDTO = {};

            if (name !== area.name) dto.name = name;

            dto.actions = area.actions
                .map((a, idx) => {
                    if (!a.id) return null;
                    return {
                        id: a.id,
                        params: actionsParams[idx],
                    };
                })
                .filter(
                    (a): a is { id: string; params: Record<string, unknown> } =>
                        a !== null
                );

            dto.reactions = area.reactions
                .map((r, idx) => {
                    if (!r.id) return null;
                    return {
                        id: r.id,
                        params: reactionsParams[idx],
                    };
                })
                .filter(
                    (r): r is { id: string; params: Record<string, unknown> } =>
                        r !== null
                );

            // Send a single PATCH request to update name and/or params
            if (Object.keys(dto).length > 0) {
                await areaService.updateParams(area.id, dto);
            }

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
                        <label className="text-xs font-bold uppercase tracking-wider mb-1 ml-1">
                            {p.label || p.name}
                        </label>
                        {p.type === "string" && (
                            <Input
                                value={(values[p.name] as string) ?? ""}
                                onChange={(val) => handleChange(p.name, val)}
                                placeholder={p.description || ""}
                                className="text-black border-gray-400"
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
                                className="text-black border-gray-400"
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
                                    const selectOpt = opt as SelectOption;
                                    const label =
                                        selectOpt.label ?? selectOpt.value;
                                    const value = selectOpt.value ?? label;
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

    const getBrandColor = (itemName: string, type: "action" | "reaction") => {
        type CatalogItemWithDef = CatalogItem & { defName?: string };
        const list = type === "action" ? catalog.actions : catalog.reactions;
        const found = list.find(
            (a: CatalogItemWithDef) =>
                a.title === itemName || a.defName === itemName
        );
        return found ? getPlatformColor(found.platform) : "#5865F2";
    };

    const primaryColor = getBrandColor(
        area.actions?.[0]?.action_name || "",
        "action"
    );

    const formatName = (name: string) => {
        const withoutService = name.split(".")[1] || name;
        const withSpaces = withoutService.replace(/_/g, " ");
        return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
    };

    return (
        <GlassCardLayout
            color={primaryColor}
            onBack={() => navigate(-1)}
            backLabel="Cancel"
        >
            <div className="flex flex-col w-full max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">
                            Edit Area
                        </h1>
                        <p className="text-slate-500 text-sm mt-2">
                            Adjust your automation parameters
                        </p>
                    </div>
                    <TestButton onTest={handleTestArea} disabled={!enabled} />
                </div>

                <div className="mb-6 max-w-md mx-auto w-full">
                    <label className="text-xs font-bold uppercase tracking-wide mb-1 ml-1 block">
                        Area name
                    </label>
                    <Input
                        value={name}
                        onChange={(v) => setName(v)}
                        placeholder="Area name"
                        className="text-black border-gray-400"
                    />
                </div>

                <div className="mb-6 max-w-md mx-auto w-full flex items-center justify-between p-4 bg-white/50 rounded-xl">
                    <div className="flex flex-col">
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                            Area Status
                        </label>
                        <span className="text-sm text-slate-500 mt-1">
                            {enabled ? "Enabled" : "Disabled"}
                        </span>
                    </div>
                    <button
                        onClick={handleToggleEnabled}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            enabled ? "bg-green-500" : "bg-slate-300"
                        }`}
                        aria-label="Toggle area enabled state"
                    >
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                enabled ? "translate-x-7" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>

                <div className="space-y-10">
                    {area.actions.map((action, idx) => (
                        <div key={action.id || `action-${idx}`}>
                            {idx > 0 && (
                                <div className="flex items-center justify-center my-6">
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">
                                        Or
                                    </span>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>
                            )}
                            <div
                                className="relative pl-6 border-l-4"
                                style={{
                                    borderColor: getBrandColor(
                                        action.action_name,
                                        "action"
                                    ),
                                }}
                            >
                                <span className="text-[10px] uppercase tracking-widest font-bold block mb-1 text-slate-400">
                                    Action{" "}
                                    {area.actions.length > 1
                                        ? `#${idx + 1}`
                                        : ""}
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 mb-4">
                                    {formatName(action.action_name)}
                                </h3>
                                {renderInputs(
                                    getParamsDefinition(
                                        action.action_name,
                                        "action"
                                    ),
                                    actionsParams[idx] || {},
                                    (newVals) =>
                                        setActionsParams({
                                            ...actionsParams,
                                            [idx]: newVals,
                                        })
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center justify-center my-8">
                        <div className="h-0.5 bg-slate-900 flex-1"></div>
                        <span className="px-6 text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                            Then
                        </span>
                        <div className="h-0.5 bg-slate-900 flex-1"></div>
                    </div>

                    {area.reactions.map((reaction, idx) => (
                        <div key={reaction.id || `reaction-${idx}`}>
                            {idx > 0 && (
                                <div className="flex items-center justify-center my-6">
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        And
                                    </span>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>
                            )}
                            <div
                                className="relative pl-6 border-l-4"
                                style={{
                                    borderColor: getBrandColor(
                                        reaction.reaction_name,
                                        "reaction"
                                    ),
                                }}
                            >
                                <span className="text-[10px] uppercase tracking-widest font-bold block mb-1 text-slate-400">
                                    Reaction{" "}
                                    {area.reactions.length > 1
                                        ? `#${idx + 1}`
                                        : ""}
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 mb-4">
                                    {formatName(reaction.reaction_name)}
                                </h3>
                                {renderInputs(
                                    getParamsDefinition(
                                        reaction.reaction_name,
                                        "reaction"
                                    ),
                                    reactionsParams[idx] || {},
                                    (newVals) =>
                                        setReactionsParams({
                                            ...reactionsParams,
                                            [idx]: newVals,
                                        })
                                )}
                            </div>
                        </div>
                    ))}
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
                        onClick={() => setShowConfirmDelete(true)}
                        className="text-red-500 text-xs font-bold uppercase hover:text-red-700 transition-colors py-2 text-center"
                    >
                        Delete Area
                    </button>
                </div>

                <Toast
                    visible={showConfirmDelete}
                    title={`Are you sure you want to delete "${area.name}" ?`}
                    subtitle="This action is irreversible"
                    loading={deleting}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowConfirmDelete(false)}
                    confirmLabel={deleting ? "Deletion..." : "Confirm"}
                    cancelLabel="Cancel"
                />
            </div>
        </GlassCardLayout>
    );
}
