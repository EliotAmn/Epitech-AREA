import { useState } from "react";

import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import GlassCardLayout from "@/component/glassCard";
import { getPlatformIcon } from "@/config/platforms";
import { areaService } from "@/services/api/areaService";
import Button from "../component/button";

interface SummaryProps {
    actionService: string;
    action: string | null;
    reactionService: string;
    reaction: string | null;
    actionDefName?: string | null;
    reactionDefName?: string | null;
    actionParams?: Record<string, unknown>;
    reactionParams?: Record<string, unknown>;
    onBack?: () => void;
    colors?: string | string[];
}

export default function Summary({
    actionService,
    action,
    reactionService,
    reaction,
    actionDefName,
    reactionDefName,
    actionParams = {},
    reactionParams = {},
    onBack,
    colors = "rgba(99, 102, 241, 0.7)",
}: SummaryProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const actionIcon = getPlatformIcon(actionService);
    const reactionIcon = getPlatformIcon(reactionService);
    const samePlatform = actionService === reactionService;

    const handleConfirm = async () => {
        setLoading(true);

        const payload = {
            name: `If ${action} then ${reaction}`,
            actions: [
                {
                    action_name: actionDefName ?? action ?? "",
                    params: actionParams,
                },
            ],
            reactions: [
                {
                    reaction_name: reactionDefName ?? reaction ?? "",
                    params: reactionParams,
                },
            ],
        };

        try {
            await areaService.createArea(payload);
            navigate("/my-areas");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <GlassCardLayout
                color={Array.isArray(colors) ? colors : [colors]}
                onBack={onBack}
                footer={false}
            >
                <h2 className="text-5xl text-gray-700 font-bold mb-4">
                    Review and finish
                </h2>

                <div className="mb-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <img
                            src={actionIcon}
                            alt={`${actionService} icon`}
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
                                    alt={`${reactionService} icon`}
                                    className="w-16 h-16 object-contain"
                                />
                            </>
                        )}
                    </div>
                    <h3 className="text-xl text-gray-700 font-semibold mb-2 text-left">
                        Area Title
                    </h3>
                    <div className="w-[600px] h-[100px] p-6 bg-white rounded-lg shadow-md flex flex-col text-2xl font-semibold justify-center items-center">
                        If {action} then {reaction}
                    </div>
                    <div className="text-xl font-bold text-gray-700 mt-4">
                        Area params
                    </div>

                    <div className="mb-4">
                        <h4 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1 text-gray-700">
                            {action}
                        </h4>
                        {Object.keys(actionParams).length > 0 ? (
                            <ul className="space-y-1">
                                {Object.entries(actionParams).map(
                                    ([key, value]) => (
                                        <li
                                            key={key}
                                            className="text-sm text-gray-700"
                                        >
                                            <span className="font-semibold">
                                                {key.replace(/_/g, " ")}:
                                            </span>{" "}
                                            {String(value)}
                                        </li>
                                    )
                                )}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 italic">
                                No parameters
                            </p>
                        )}
                    </div>

                    <div>
                        <h4 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1 text-gray-700">
                            {reaction}  
                        </h4>
                        {Object.keys(reactionParams).length > 0 ? (
                            <ul className="space-y-1">
                                {Object.entries(reactionParams).map(
                                    ([key, value]) => (
                                        <li
                                            key={key}
                                            className="text-sm text-gray-700"
                                        >
                                            <span className="font-semibold">
                                                {key.replace(/_/g, " ")}:
                                            </span>{" "}
                                            {String(value)}
                                        </li>
                                    )
                                )}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 italic">
                                No parameters
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Button
                        label="Back"
                        onClick={() => (onBack ? onBack() : navigate(-1))}
                    />
                    <Button
                        label={loading ? "Creating..." : "Confirm"}
                        onClick={handleConfirm}
                        disabled={loading}
                    />
                </div>
            </GlassCardLayout>
        </div>
    );
}
