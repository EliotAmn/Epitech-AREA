import { useEffect, useState } from "react";

import { InfoIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import GlassCardLayout from "@/component/glassCard";
import TransformationsList from "@/component/TransformationsList";
import { getPlatformIcon } from "@/config/platforms";
import Button from "./button";
import Input from "./input";

export interface SelectOption {
    label?: string;
    value: string;
}

export interface ParameterDefinition {
    name: string;
    type: "string" | "number" | "boolean" | "select";
    label?: string;
    description?: string;
    required?: boolean;
    options?: (string | SelectOption)[];
}

interface ConfigWidgetProps {
    color?: string;
    platform: string;
    onConnect?: () => void;
    state?: string;
    onClose?: () => void;
    params?: ParameterDefinition[];
    values?: Record<string, unknown>;
    onChange?: (values: Record<string, unknown>) => void;
    showOutputCard?: boolean;
    outputParams?: ParameterDefinition[];
}

export default function ConfigWidget({
    color,
    platform,
    onConnect,
    state,
    onClose,
    params = [],
    values = {},
    onChange,
    showOutputCard = false,
    outputParams = [],
}: ConfigWidgetProps) {
    const navigate = useNavigate();

    const handleConnect = () => {
        if (onConnect) {
            onConnect();
        } else {
            navigate("/create", { state: { step: 2 } });
        }
    };

    const handleChange = (name: string, value: unknown) => {
        if (onChange) {
            onChange({ ...values, [name]: value });
        }
    };

    useEffect(() => {
        let timer: number | null = null;
        if (params == null || params.length === 0) {
            timer = window.setTimeout(() => {
                if (onConnect) onConnect();
                else navigate("/create", { state: { step: 2 } });
            }, 0);
        }
        return () => {
            if (timer !== null) window.clearTimeout(timer);
        };
    }, [params, onConnect, navigate]);

    const title =
        state === "connect"
            ? `Connect your ${platform} Account`
            : `Configure ${platform}`;
    const platformIcon = getPlatformIcon(platform);
    const leftCard =
        showOutputCard && outputParams && outputParams.length > 0 ? (
            <div className="flex flex-col items-center m-2">
                <div className="flex flex-col items-center gap-2 mb-3">
                    <InfoIcon className="w-6 h-6 text-slate-700" />
                    <h4 className="text-lg font-semibold text-black text-center">
                        Available Variables & Transformations
                    </h4>
                </div>
                
                {/* Usage Instructions */}
                <div className="text-[12px] text-gray-600 text-left font-semibold mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="mb-2">
                        Use <span className="font-mono bg-white px-1 rounded">$(variable_name)</span> to insert values
                    </p>
                    <p>
                        Use <span className="font-mono bg-white px-1 rounded">{"{{variable | transformation}}"}</span> to transform values
                    </p>
                </div>

                {/* Available Variables */}
                <div className="w-full mb-4">
                    <h5 className="text-sm font-bold text-gray-700 mb-2">Variables</h5>
                    <div className="bg-white/80 border border-white/30 rounded-xl p-3 shadow-sm">
                        <div className="w-full text-left text-gray-800 space-y-2">
                            {outputParams.map((p) => (
                                <div key={p.name} className="flex flex-col border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Insert variable syntax at cursor - we'll handle this in the parent
                                                const event = new CustomEvent('insertVariable', { 
                                                    detail: { variable: p.name } 
                                                });
                                                window.dispatchEvent(event);
                                            }}
                                            className="font-mono text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                        >
                                            $({p.name})
                                        </button>
                                    </div>
                                    {p.description && (
                                        <span className="text-xs text-gray-600 mt-1 ml-1">
                                            {p.description}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transformation Functions */}
                <TransformationsList />
            </div>
        ) : undefined;

    return (
        <div className="w-full flex justify-center">
            <GlassCardLayout color={color} onBack={onClose} leftCard={leftCard}>
                <div className="flex flex-col items-center">
                    <h3 className="text-3xl md:text-[45px] font-semibold text-black mb-8 text-center shrink-0 leading-tight">
                        {title}
                    </h3>
                    <div className="relative mb-8">
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

                    <div className="w-full max-w-md flex flex-col">
                        <div className="pr-2 mb-4 p-2">
                            <div className="space-y-4 text-left text-gray-800">
                                {params.map((p) => (
                                    <div key={p.name} className="flex flex-col">
                                        <label className="text-sm font-bold mb-1">
                                            {p.label || p.name}
                                        </label>
                                        {p.type === "string" && (
                                            <Input
                                                value={
                                                    (values[
                                                        p.name
                                                    ] as string) ?? ""
                                                }
                                                onChange={(val) =>
                                                    handleChange(p.name, val)
                                                }
                                                placeholder={
                                                    p.description || ""
                                                }
                                            />
                                        )}
                                        {p.type === "number" && (
                                            <Input
                                                value={
                                                    (
                                                        values[p.name] as number
                                                    )?.toString() ?? ""
                                                }
                                                onChange={(val) =>
                                                    handleChange(
                                                        p.name,
                                                        Number(val)
                                                    )
                                                }
                                                placeholder={
                                                    p.description || ""
                                                }
                                            />
                                        )}
                                        {p.type === "boolean" && (
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-6 h-6 rounded text-black border-none focus:ring-2 focus:ring-white/50"
                                                    checked={
                                                        !!(values[
                                                            p.name
                                                        ] as boolean)
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            p.name,
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                        {p.type === "select" && (
                                            <select
                                                className="p-3 rounded-lg text-black w-full border-none outline-none focus:ring-2 focus:ring-white/50"
                                                value={
                                                    (values[
                                                        p.name
                                                    ] as string) ?? ""
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        p.name,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">Select</option>
                                                {(p.options || []).map(
                                                    (opt) => {
                                                        if (
                                                            typeof opt ===
                                                            "string"
                                                        ) {
                                                            return (
                                                                <option
                                                                    key={opt}
                                                                    value={opt}
                                                                >
                                                                    {opt}
                                                                </option>
                                                            );
                                                        }
                                                        const selectOpt =
                                                            opt as SelectOption;
                                                        const label =
                                                            selectOpt.label ??
                                                            selectOpt.value;
                                                        const value =
                                                            selectOpt.value ??
                                                            label;
                                                        return (
                                                            <option
                                                                key={value}
                                                                value={value}
                                                            >
                                                                {label}
                                                            </option>
                                                        );
                                                    }
                                                )}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center shrink-0 pb-4">
                            <Button label="Save" onClick={handleConnect} />
                        </div>
                    </div>
                </div>
            </GlassCardLayout>
        </div>
    );
}
