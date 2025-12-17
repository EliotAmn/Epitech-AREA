import { useState } from "react";

import { useNavigate } from "react-router-dom";

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
}: SummaryProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const actionIcon = getPlatformIcon(actionService);
    const reactionIcon = getPlatformIcon(reactionService);

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
        <div className="p-8 w-full h-full overflow-hidden flex flex-col items-center relative bg-[#282322]">
            <h2 className="text-5xl text-white font-bold mb-4">
                Review and finish
            </h2>

            <div className="text-left space-y-3 mb-6">
                <img
                    src={actionIcon}
                    alt={`${actionService} icon`}
                    className="w-12 h-12 object-contain inline-block mr-2"
                />
                {actionService !== reactionService && (
                    <img
                        src={reactionIcon}
                        alt={`${reactionService} icon`}
                        className="w-12 h-12 object-contain inline-block mr-2"
                    />
                )}
                <h3 className="text-xl text-white font-semibold mb-2 text-left">
                    Area Title
                </h3>
                <div className="w-[600px] h-[100px] p-6 bg-white rounded-lg shadow-md flex flex-col text-2xl font-semibold justify-center items-center">
                    If {action} then {reaction}
                </div>
                <div className="text-xl font-bold text-white mt-4">
                    Area params
                </div>
                <div className="mb-4">
                    <h4 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1 text-white">
                        {action}
                    </h4>
                    {Object.keys(actionParams).length > 0 ? (
                        <ul className="space-y-1">
                            {Object.entries(actionParams).map(
                                ([key, value]) => (
                                    <li
                                        key={key}
                                        className="text-sm text-white"
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
                        <p className="text-sm text-gray-200 italic">
                            No parameters
                        </p>
                    )}
                </div>

                <div>
                    <h4 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1 text-white">
                        Reaction Config
                    </h4>
                    {Object.keys(reactionParams).length > 0 ? (
                        <ul className="space-y-1">
                            {Object.entries(reactionParams).map(
                                ([key, value]) => (
                                    <li
                                        key={key}
                                        className="text-sm text-white"
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
                        <p className="text-sm text-gray-200 italic">
                            No parameters
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <Button
                    label="Back"
                    onClick={() => (onBack ? onBack() : navigate(-1))}
                    mode="white"
                />
                <Button
                    label={loading ? "Creating..." : "Confirm"}
                    onClick={handleConfirm}
                    disabled={loading}
                    mode="white"
                />
            </div>
        </div>
    );
}
