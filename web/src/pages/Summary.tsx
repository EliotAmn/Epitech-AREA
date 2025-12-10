import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { aboutService } from "@/services/api/aboutService";
import { areaService } from "@/services/api/areaService";
import Button from "../component/button";

interface ParameterDefinition {
    name: string;
    type: "string" | "number" | "boolean" | "select";
    label?: string;
    description?: string;
    required?: boolean;
    options?: string[];
}

interface SummaryProps {
    actionService: string | null;
    action: string | null;
    reactionService: string | null;
    reaction: string | null;
    // raw definition names from service definitions (used to persist to backend)
    actionDefName?: string | null;
    reactionDefName?: string | null;
}

export default function Summary({
    actionService,
    action,
    reactionService,
    reaction,
    actionDefName,
    reactionDefName,
}: SummaryProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionParams, setActionParams] = useState<Record<string, unknown>>(
        {}
    );
    const [reactionParamsState, setReactionParamsState] = useState<
        Record<string, unknown>
    >({});
    const [actionInputs, setActionInputs] = useState<
        ParameterDefinition[] | null
    >(null);
    const [reactionInputs, setReactionInputs] = useState<
        ParameterDefinition[] | null
    >(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const about = (await aboutService.getAbout()) as {
                    server?: {
                        services?: Array<{
                            name?: string;
                            actions?: Array<{
                                name?: string;
                                input_params?: ParameterDefinition[];
                            }>;
                            reactions?: Array<{
                                name?: string;
                                input_params?: ParameterDefinition[];
                            }>;
                        }>;
                    };
                };
                if (!mounted) return;

                // find action definition (actions expose output_params)
                if (actionDefName) {
                    for (const svc of about?.server?.services || []) {
                        const act = (svc.actions || []).find(
                            (a) => a.name === actionDefName
                        );
                        if (act) {
                            setActionInputs(act.input_params || []);
                            break;
                        }
                    }
                }

                if (reactionDefName) {
                    for (const svc of about?.server?.services || []) {
                        const react = (svc.reactions || []).find(
                            (r) => r.name === reactionDefName
                        );
                        if (react) {
                            setReactionInputs(react.input_params || []);
                            break;
                        }
                    }
                }
            } catch {
                // ignore
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [actionDefName, reactionDefName]);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);

        // Build area payload. Use definition names when available, fallback to displayed title.
        const payload = {
            name: `${action ?? "Action"} → ${reaction ?? "Reaction"}`,
            actions: [
                {
                    action_name: actionDefName ?? action ?? "",
                    params: actionParams || {},
                },
            ],
            reactions: [
                {
                    reaction_name: reactionDefName ?? reaction ?? "",
                    params: reactionParamsState || {},
                },
            ],
        };

        try {
            await areaService.createArea(payload);
            // After creation go to my areas
            navigate("/my-areas");
        } catch (err: unknown) {
            let message = "Failed to create area";
            if (err instanceof Error) message = err.message;
            else if (typeof err === "string") message = err;
            setError(message);
            // keep user on summary
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow text-center">
            <h2 className="text-3xl font-bold mb-4">Configuration</h2>

            <div className="text-left space-y-3 mb-6">
                {actionInputs && actionInputs.length > 0 ? (
                    <div>
                        <h3 className="font-semibold">Action parameters</h3>
                        <div className="space-y-2 mt-2">
                            {actionInputs.map((p: ParameterDefinition) => (
                                <div key={p.name} className="flex flex-col">
                                    <label className="text-sm font-medium text-left">
                                        {p.label || p.name}
                                    </label>
                                    {p.type === "string" /* STRING */ && (
                                        <input
                                            className="border p-2 rounded"
                                            value={
                                                (actionParams[
                                                    p.name
                                                ] as string) ?? ""
                                            }
                                            onChange={(e) =>
                                                setActionParams({
                                                    ...actionParams,
                                                    [p.name]: e.target.value,
                                                })
                                            }
                                            placeholder={p.description || ""}
                                        />
                                    )}
                                    {p.type === "number" /* NUMBER */ && (
                                        <input
                                            type="number"
                                            className="border p-2 rounded"
                                            value={
                                                (actionParams[
                                                    p.name
                                                ] as number) ?? ""
                                            }
                                            onChange={(e) =>
                                                setActionParams({
                                                    ...actionParams,
                                                    [p.name]: Number(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    )}
                                    {p.type === "boolean" /* BOOLEAN */ && (
                                        <input
                                            type="checkbox"
                                            checked={
                                                !!(actionParams[
                                                    p.name
                                                ] as boolean)
                                            }
                                            onChange={(e) =>
                                                setActionParams({
                                                    ...actionParams,
                                                    [p.name]: e.target.checked,
                                                })
                                            }
                                        />
                                    )}
                                    {p.type === "select" /* SELECT */ && (
                                        <select
                                            className="border p-2 rounded"
                                            value={
                                                (actionParams[
                                                    p.name
                                                ] as string) ?? ""
                                            }
                                            onChange={(e) =>
                                                setActionParams({
                                                    ...actionParams,
                                                    [p.name]: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Select</option>
                                            {(p.options || []).map(
                                                (opt: string) => (
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
                    </div>
                ) : null}

                {reactionInputs && reactionInputs.length > 0 ? (
                    <div>
                        <h3 className="font-semibold mt-4">
                            Reaction parameters
                        </h3>
                        <div className="space-y-2 mt-2">
                            {reactionInputs.map((p: ParameterDefinition) => (
                                <div key={p.name} className="flex flex-col">
                                    <label className="text-sm font-medium text-left">
                                        {p.label || p.name}
                                    </label>
                                    {p.type === "string" /* STRING */ && (
                                        <input
                                            className="border p-2 rounded"
                                            value={
                                                (reactionParamsState[
                                                    p.name
                                                ] as string) ?? ""
                                            }
                                            onChange={(e) =>
                                                setReactionParamsState({
                                                    ...reactionParamsState,
                                                    [p.name]: e.target.value,
                                                })
                                            }
                                            placeholder={p.description || ""}
                                        />
                                    )}
                                    {p.type === "number" /* NUMBER */ && (
                                        <input
                                            type="number"
                                            className="border p-2 rounded"
                                            value={
                                                (reactionParamsState[
                                                    p.name
                                                ] as number) ?? ""
                                            }
                                            onChange={(e) =>
                                                setReactionParamsState({
                                                    ...reactionParamsState,
                                                    [p.name]: Number(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    )}
                                    {p.type === "boolean" /* BOOLEAN */ && (
                                        <input
                                            type="checkbox"
                                            checked={
                                                !!(reactionParamsState[
                                                    p.name
                                                ] as boolean)
                                            }
                                            onChange={(e) =>
                                                setReactionParamsState({
                                                    ...reactionParamsState,
                                                    [p.name]: e.target.checked,
                                                })
                                            }
                                        />
                                    )}
                                    {p.type === "select" /* SELECT */ && (
                                        <select
                                            className="border p-2 rounded"
                                            value={
                                                (reactionParamsState[
                                                    p.name
                                                ] as string) ?? ""
                                            }
                                            onChange={(e) =>
                                                setReactionParamsState({
                                                    ...reactionParamsState,
                                                    [p.name]: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Select</option>
                                            {(p.options || []).map(
                                                (opt: string) => (
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
                    </div>
                ) : null}
            </div>
            <div className="text-left space-y-3 mb-6">
                <div>
                    <strong>Service (action) :</strong> {actionService ?? "—"}
                </div>
                <div>
                    <strong>Action :</strong> {action ?? "—"}
                </div>
                <div>
                    <strong>Service (reaction) :</strong>{" "}
                    {reactionService ?? "—"}
                </div>
                <div>
                    <strong>Reaction :</strong> {reaction ?? "—"}
                </div>
            </div>

            {error ? <div className="text-red-600 mb-4">{error}</div> : null}

            <div className="flex justify-center gap-4">
                <Button label="Back" onClick={() => navigate(-1)} />
                <Button
                    label={loading ? "Creating..." : "Confirm"}
                    onClick={handleConfirm}
                    disabled={loading}
                />
            </div>
        </div>
    );
}
