import { useNavigate } from "react-router-dom";

import DiscordIcon from "../assets/discord_icon.webp";
import GmailIcon from "../assets/gmail_icon.webp";
import Button from "./button";
import Input from "./input";

const icons: Record<string, string> = {
    discord: DiscordIcon,
    gmail: GmailIcon,
};

export interface ParameterDefinition {
    name: string;
    type: "string" | "number" | "boolean" | "select";
    label?: string;
    description?: string;
    required?: boolean;
    options?: string[];
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

    return (
        <div
            className="p-8 w-full h-full overflow-hidden flex flex-col items-center relative"
            style={{ backgroundColor: color }}
        >
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-white text-xl font-bold hover:opacity-80"
                >
                    ✕
                </button>
            )}

            <h3 className="text-[45px] font-semibold text-white mb-8 text-center shrink-0">
                {title}
            </h3>

            {state === "connect" ? (
                <div className="flex-1 flex flex-col items-center justify-center w-full gap-32 pb-16">
                    {platform && icons[platform] && (
                        <img
                            src={icons[platform]}
                            alt={`${platform} icon`}
                            className="w-36 h-36 object-contain"
                        />
                    )}
                    <Button
                        label="Connect"
                        mode="white"
                        onClick={handleConnect}
                    />
                </div>
            ) : (
                <div className="w-full max-w-md flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto pr-2 mb-4 p-2">
                        {params && params.length > 0 ? (
                            <div className="space-y-4 text-left text-white">
                                {params.map((p) => (
                                    <div key={p.name} className="flex flex-col">
                                        <label className="text-sm font-bold mb-1">
                                            {p.label || p.name}
                                        </label>
                                        {p.type === "string" && (
                                            <Input
                                                mode="white"
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
                                                mode="white"
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
                                                    (opt) => (
                                                        <option
                                                            key={opt}
                                                            value={opt}
                                                        >
                                                            {opt}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-white text-center text-xl opacity-80 mt-8">
                                No configuration needed.
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center shrink-0 pb-4">
                        <Button
                            label="Save"
                            mode="white"
                            onClick={handleConnect}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
