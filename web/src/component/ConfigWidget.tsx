import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import GlassCardLayout from "@/component/glassCard";
import { getPlatformIcon } from "@/config/platforms";
import { getUserServiceStatus } from "@/services/api/userserviceClient";
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
}

export default function ConfigWidget({
    color,
    platform,
    onConnect,
    state,
    onClose,
    params,
    values = {},
    onChange,
}: ConfigWidgetProps) {
    const navigate = useNavigate();
    const [connected, setConnected] = useState<boolean | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getUserServiceStatus(platform);
                if (!mounted) return;
                setConnected(!!res.connected);
            } catch {
                if (!mounted) return;
                setConnected(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [platform]);

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

    const title =
        state === "connect"
            ? `Connect your ${platform} Account`
            : `Configure ${platform}`;
    const platformIcon = getPlatformIcon(platform);
    return (
        <div>
            <GlassCardLayout color={color} onBack={onClose}>
                <div className="flex flex-col items-center">
                    <h3 className="text-[45px] font-semibold text-black mb-8 text-center shrink-0">
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
                            {params && params.length > 0 ? (
                                <div className="space-y-4 text-left text-gray-800">
                                    {params.map((p) => (
                                        <div
                                            key={p.name}
                                            className="flex flex-col"
                                        >
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
                                                        handleChange(
                                                            p.name,
                                                            val
                                                        )
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
                                                            values[
                                                                p.name
                                                            ] as number
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
                                                    <option value="">
                                                        Select
                                                    </option>
                                                    {(p.options || []).map(
                                                        (opt) => {
                                                            if (
                                                                typeof opt ===
                                                                "string"
                                                            ) {
                                                                return (
                                                                    <option
                                                                        key={
                                                                            opt
                                                                        }
                                                                        value={
                                                                            opt
                                                                        }
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
                                                                    value={
                                                                        value
                                                                    }
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
                            ) : (
                                <div className="text-gray-700 text-center text-xl opacity-80 mt-8">
                                    No configuration needed.
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center shrink-0 pb-4">
                            {connected === null ? (
                                <Button
                                    label="Loading..."
                                    onClick={() => {}}
                                    disabled={true}
                                />
                            ) : connected === false ? (
                                <Button
                                    label="Connect..."
                                    onClick={handleConnect}
                                />
                            ) : (
                                <Button label="Save" onClick={handleConnect} />
                            )}
                        </div>
                    </div>
                </div>
            </GlassCardLayout>
        </div>
    );
}
