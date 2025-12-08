import { useNavigate } from "react-router-dom";

import Button from "../component/button";

interface SummaryProps {
    actionService: string | null;
    action: string | null;
    reactionService: string | null;
    reaction: string | null;
}

export default function Summary({
    actionService,
    action,
    reactionService,
    reaction,
}: SummaryProps) {
    const navigate = useNavigate();

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow text-center">
            <h2 className="text-3xl font-bold mb-4">Configuration</h2>

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

            <div className="flex justify-center gap-4">
                <Button label="Back" onClick={() => navigate(-1)} />
                <Button label="Confirm" onClick={() => navigate("/explore")} />
            </div>
        </div>
    );
}
