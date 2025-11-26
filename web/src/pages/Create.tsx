import { useState } from "react";
import Actions from "./Actions";
import Reactions from "./Reactions";
import Summary from "./Summary";

export default function Create() {
    const [completedAction, setCompletedAction] = useState<{ service: string | null; action: string | null } | null>(null);
    const [completedReaction, setCompletedReaction] = useState<{ service: string | null; reaction: string | null } | null>(null);

    return (
        <div className="text-center justify-center">
            <h1 className="text-7xl font-bold m-4">Create your own area</h1>

            <div className="flex flex-col items-center justify-center gap-6 mt-6 w-full">
              {!completedAction ? (
                <Actions onFinish={(service, action) => setCompletedAction({ service, action })} />
              ) : !completedReaction ? (
                <Reactions
                  onFinish={(service, reaction) => setCompletedReaction({ service, reaction })}
                />
              ) : (
                <Summary
                  actionService={completedAction.service}
                  action={completedAction.action}
                  reactionService={completedReaction.service}
                  reaction={completedReaction.reaction}
                />
              )}
            </div>
        </div>
    );
}
