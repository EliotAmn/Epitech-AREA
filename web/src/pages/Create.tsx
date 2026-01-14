import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import ConnectCard from "@/component/ConnectCard";
import GlassCardLayout from "@/component/glassCard";
import { getPlatformColor } from "@/config/platforms";
import {
    fetchCatalogFromAbout,
    sortCatalogItemsByLabel,
} from "@/services/aboutParser";
import { aboutService } from "@/services/api/aboutService";
import { getUserServiceStatus } from "@/services/api/userserviceClient";
import type { AboutData } from "@/services/types/aboutTypes";
import ConfigWidget from "../component/ConfigWidget";
import ProgressBar from "../component/ProgressBar";
import type { CatalogItem } from "../data/catalogData";
import CatalogPage from "./CatalogPage";
import Summary from "./Summary";

// `ConnectCard` extracted to `@/component/ConnectCard`

export default function Create() {
    const location = useLocation();
    const [step, setStep] = useState<number>(location.state?.step ?? 1);

    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

    const [actionService, setActionService] = useState<string>("");
    // Current action being configured
    const [action, setAction] = useState<string | null>(null);
    const [actionParams, setActionParams] = useState<Record<string, unknown>>(
        {}
    );

    // List of configured actions
    const [actionsList, setActionsList] = useState<
        {
            service: string;
            action: string;
            params: Record<string, unknown>;
            defName?: string;
        }[]
    >([]);

    // Index of the action currently being edited (null if creating new)
    const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);

    const [reactionService, setReactionService] = useState<string>("");
    const [reaction, setReaction] = useState<string | null>(null);

    const [reactionParams, setReactionParams] = useState<
        Record<string, unknown>
    >({});
    const [aboutData, setAboutData] = useState<AboutData | null>(null);

    const goToStep = (s: number) => {
        // Intercept Back button logic (from Step 2 to Step 1)
        if (step === 2 && s === 1) {
            // If editing, cancel edit
            if (editingActionIndex !== null) {
                setEditingActionIndex(null);
                setSelectedItem(null);
                setActionParams({});
                setActionService(""); // Go back to overview/add new
                return;
            }

            // If we have actions in the list...
            if (actionsList.length > 0) {
                // If we are currently "in a flow" (actionService is selected, trying to add a NEW action),
                // "Back" should cancel this attempt and return to Service Selection,
                // INSTEAD of undoing the previously committed action.
                if (actionService) {
                    setActionService("");
                    setSelectedItem(null);
                    setActionParams({});
                    return;
                }

                // Otherwise, if we are at the root (Service Selection), "Back" means "Undo last action"
                const lastAction = actionsList[actionsList.length - 1];
                const newActionList = actionsList.slice(0, -1);

                setActionsList(newActionList);

                // Restore context for the popped action
                setActionService(lastAction.service);
                setActionParams(lastAction.params);

                const item = parsedActions.find(
                    (a) =>
                        a.platform === lastAction.service &&
                        a.label === lastAction.action
                );
                if (item) {
                    setSelectedItem(item);
                }
                // Stay on Step 2
                return;
            }
        }

        if (s === 2 && !actionService && actionsList.length === 0) s = 1;

        // Step 2 is valid if we have at least one action configured OR if we are currently configuring one?
        // Actually goToStep logic usually checks if previous step is complete to allow jumping.
        // If s=3, Step 2 must be complete (at least one action).
        if (s === 3 && actionsList.length === 0 && !action) s = actionService ? 2 : 1;
        if (s === 4 && !reactionService)
            s = actionsList.length > 0 ? 3 : actionService ? 2 : 1;

        if (s <= 1) {
            setActionService("");
            setAction(null);
            setActionsList([]);
            setEditingActionIndex(null);
            setReactionService("");
            setReaction(null);
            setActionParams({});
            setReactionParams({});
        } else if (s === 2) {
            // When going back to step 2, we might want to edit?
            // For now, let's just keep the list.
            setAction(null);
            setEditingActionIndex(null);
            setReactionService("");
            setReaction(null);
            setActionParams({});
            setReactionParams({});
        } else if (s === 3) {
            setReactionService("");
            setReaction(null);
            setReactionParams({});
        }

        setStep(s);
        setSelectedItem(null);
    };

    const completedSteps = [
        !!actionService,
        actionsList.length > 0,
        !!reactionService,
        !!reaction,
    ];

    const [parsedActions, setParsedActions] = useState<CatalogItem[]>([]);
    const [parsedServices, setParsedServices] = useState<CatalogItem[]>([]);
    const [parsedReactions, setParsedReactions] = useState<CatalogItem[]>([]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const parsed = await fetchCatalogFromAbout();
            const about = await aboutService.getAbout();
            if (!mounted) return;

            const applyColors = (items: CatalogItem[]) =>
                sortCatalogItemsByLabel(
                    items.map((item) => ({
                        ...item,
                        color: getPlatformColor(item.platform),
                    }))
                );

            setParsedActions(applyColors(parsed.actions));
            setParsedServices(applyColors(parsed.services));
            setParsedReactions(applyColors(parsed.reactions));
            setAboutData(about as unknown as AboutData);
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const getParams = (item: CatalogItem, type: "action" | "reaction") => {
        if (!aboutData?.server?.services) return [];
        const defName =
            (item as CatalogItem & { defName?: string }).defName || item.title;
        for (const svc of aboutData.server.services) {
            const list = type === "action" ? svc.actions : svc.reactions;
            const found = list?.find((x) => x.name === defName);
            if (found) return found.input_params || [];
        }
        return [];
    };

    const handleSelect = (item: CatalogItem) => {
        setSelectedItem(item);
    };

    const handleCloseWidget = () => {
        setSelectedItem(null);
        setEditingActionIndex(null);
        setActionParams({});
    };
    const navigate = useNavigate();

    const [selectedServiceConnected, setSelectedServiceConnected] = useState<
        boolean | null
    >(null);

    useEffect(() => {
        let mounted = true;
        let timer: number | null = null;

        if (!selectedItem) {
            timer = window.setTimeout(() => {
                if (mounted) setSelectedServiceConnected(null);
            }, 0);

            return () => {
                mounted = false;
                if (timer !== null) window.clearTimeout(timer);
            };
        }

        (async () => {
            try {
                const res = await getUserServiceStatus(selectedItem.platform);
                if (!mounted) return;
                setSelectedServiceConnected(!!res.connected);
            } catch {
                if (!mounted) return;
                setSelectedServiceConnected(false);
            }
        })();

        return () => {
            mounted = false;
            if (timer !== null) window.clearTimeout(timer);
        };
    }, [selectedItem]);

    useEffect(() => {
        if (!selectedItem) return () => {};

        let timer: number | null = null;

        const scheduleAdvance = () => {
            timer = window.setTimeout(() => {
                if (step === 1) {
                    setActionService(selectedItem.platform);
                    setStep(2);
                    setSelectedItem(null);
                } else if (step === 2 && !actionService) {
                    setActionService(selectedItem.platform);
                    // Stay on Step 2 to pick action
                    setSelectedItem(null);
                } else if (step === 3) {
                    setReactionService(selectedItem.platform);
                    setStep(4);
                    setSelectedItem(null);
                }
            }, 0);
        };

        // If service has no oauth_url, no connection step is required — auto-advance
        if (!selectedItem.oauth_url) {
            scheduleAdvance();
            return () => {
                if (timer !== null) window.clearTimeout(timer);
            };
        }

        if (selectedServiceConnected !== true) return () => {};

        scheduleAdvance();
        return () => {
            if (timer !== null) window.clearTimeout(timer);
        };
    }, [selectedServiceConnected, selectedItem, step]);

    // compute selected colors for action/reaction to pass to Summary
    const actionColor =
        parsedActions.find(
            (a) => a.label === action && a.platform === actionService
        )?.color ||
        parsedServices.find((s) => s.platform === actionService)?.color ||
        "#000000";

    const reactionColor =
        parsedReactions.find(
            (r) => r.label === reaction && r.platform === reactionService
        )?.color ||
        parsedServices.find((s) => s.platform === reactionService)?.color ||
        "#282322";

    return (
        <div
            key={location.key}
            className="h-[calc(100vh-80px)] flex flex-col overflow-y-auto text-center"
        >
            <h1 className="text-5xl font-bold m-2 shrink-0">
                Create your own area
            </h1>

            <div className="shrink-0 w-full flex justify-center">
                <ProgressBar
                    steps={4}
                    current={step}
                    onStepClick={(n) => goToStep(n)}
                    labels={[
                        "Service (action)",
                        "Actions",
                        "Service (reaction)",
                        "Reaction",
                    ]}
                    completedSteps={completedSteps}
                />
            </div>

            <div className="flex-1 w-full mt-2 flex flex-col">
                {/* STEP 2: Action - Sub Navigation (Always visible in step 2) */}
                {step === 2 && actionsList.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {actionsList.map((act, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    // Find CatalogItem to populate widget
                                    const item = parsedActions.find(
                                        (a) =>
                                            a.platform === act.service &&
                                            a.label === act.action
                                    );
                                    if (item) {
                                        setActionService(act.service);
                                        setSelectedItem(item);
                                        setActionParams(act.params);
                                        setEditingActionIndex(idx);
                                    }
                                }}
                                className="bg-white/80 px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors"
                            >
                                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                </span>
                                {act.action}
                            </button>
                        ))}
                    </div>
                )}

                {/* STEP 1: Service Action */}
                {step === 1 && !selectedItem && (
                    <CatalogPage
                        items={parsedServices}
                        description="Choose service for your action"
                        onSelect={handleSelect}
                        noButton={true}
                    />
                )}
                {/* STEP 2: Choose Service (if needed) */}
                {step === 2 && !selectedItem && !actionService && (
                    <div className="flex flex-col items-center">
                        <CatalogPage
                            items={parsedServices}
                            description="Choose service for your next action"
                            onSelect={handleSelect}
                            noButton={true}
                        />
                        {actionsList.length > 0 && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setStep(3)}
                                    className="mb-4 bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105"
                                >
                                    Done & Continue to Reactions
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {(step === 1 || (step === 2 && !actionService && !!selectedItem)) &&
                    selectedItem &&
                    (selectedServiceConnected === null ? (
                        <GlassCardLayout
                            color={selectedItem.color}
                            onBack={handleCloseWidget}
                        >
                            <div className="flex flex-col w-full max-w-md mx-auto items-center py-12">
                                <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full mb-4" />
                                <div>Checking connection status...</div>
                            </div>
                        </GlassCardLayout>
                    ) : selectedServiceConnected === false ? (
                        <ConnectCard
                            item={selectedItem}
                            onBack={handleCloseWidget}
                            onConnect={() => {
                                if (step === 1) {
                                    setActionService(selectedItem.platform);
                                    setStep(2);
                                } else {
                                    // Step 2 service selection
                                    setActionService(selectedItem.platform);
                                }
                                setSelectedItem(null);
                                if (selectedItem.oauth_url) {
                                    window.location.href =
                                        selectedItem.oauth_url;
                                } else {
                                    navigate("/create");
                                }
                            }}
                            onDiscard={() => {
                                if (step === 1) {
                                    setActionService("");
                                    setStep(1);
                                }
                                // If step 2, we just clear service/item and return to service list
                                setSelectedItem(null);
                            }}
                        />
                    ) : null)}

                {/* STEP 2: Action Content */}
                {step === 2 && !selectedItem && actionService && (
                    <div className="flex flex-col items-center">
                        <CatalogPage
                            items={parsedActions.filter(
                                (a) => a.platform === actionService
                            )}
                            description={
                                actionsList.length > 0
                                    ? "Add another action or continue"
                                    : `Choose an action for ${actionService}`
                            }
                            onSelect={handleSelect}
                            noButton={true}
                        />
                        {actionsList.length > 0 && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setStep(3)}
                                    className="bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105"
                                >
                                    Done & Continue to Reactions
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {step === 2 && selectedItem && actionService && (
                    <div>
                        <ConfigWidget
                            state="config"
                            color={selectedItem.color}
                            platform={selectedItem.platform}
                            onConnect={() => {
                                const defName =
                                    (selectedItem as any).defName ||
                                    selectedItem.label;
                                const newAction = {
                                    service: selectedItem.platform,
                                    action: selectedItem.label,
                                    defName: defName,
                                    params: actionParams,
                                };

                                if (editingActionIndex !== null) {
                                    const updated = [...actionsList];
                                    updated[editingActionIndex] = newAction;
                                    setActionsList(updated);
                                    setEditingActionIndex(null);
                                } else {
                                    setActionsList([...actionsList, newAction]);
                                }

                                // Set the single 'action' for compatibility
                                setAction(selectedItem.label);

                                setActionParams({});
                                setStep(3);
                                setSelectedItem(null);
                            }}
                            onAddAnother={() => {
                                const defName =
                                    (selectedItem as any).defName ||
                                    selectedItem.label;
                                const newAction = {
                                    service: selectedItem.platform,
                                    action: selectedItem.label,
                                    defName: defName,
                                    params: actionParams,
                                };

                                if (editingActionIndex !== null) {
                                    const updated = [...actionsList];
                                    updated[editingActionIndex] = newAction;
                                    setActionsList(updated);
                                    setEditingActionIndex(null);
                                } else {
                                    setActionsList([...actionsList, newAction]);
                                }

                                setActionParams({});
                                setSelectedItem(null);
                                setActionService(""); // Clear service to allow choosing a new one
                                // Stay on Step 2
                            }}
                            onClose={handleCloseWidget}
                            params={getParams(selectedItem, "action")}
                            values={actionParams}
                            onChange={setActionParams}
                            isAction={true}
                        />
                    </div>
                )}

                {/* STEP 3: Service Reaction */}
                {step === 3 && !selectedItem && (
                    <CatalogPage
                        items={parsedServices}
                        description="Choose service for your reaction"
                        onSelect={(item) => {
                            if (item.platform === actionService) {
                                setReactionService(item.platform);
                                setStep(4);
                            } else {
                                handleSelect(item);
                            }
                        }}
                        noButton={true}
                    />
                )}
                {step === 3 &&
                    selectedItem &&
                    (selectedServiceConnected === null ? (
                        <GlassCardLayout
                            color={selectedItem.color}
                            onBack={handleCloseWidget}
                        >
                            <div className="flex flex-col w-full max-w-md mx-auto items-center py-12">
                                <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full mb-4" />
                                <div>Checking connection status...</div>
                            </div>
                        </GlassCardLayout>
                    ) : selectedServiceConnected === false ? (
                        <ConnectCard
                            item={selectedItem}
                            onBack={handleCloseWidget}
                            onConnect={() => {
                                setReactionService(selectedItem.platform);
                                setStep(4);
                                setSelectedItem(null);
                                if (selectedItem.oauth_url) {
                                    window.location.href =
                                        selectedItem.oauth_url;
                                } else {
                                    navigate("/create");
                                }
                            }}
                            onDiscard={() => {
                                setReactionService("");
                                setStep(3);
                                setSelectedItem(null);
                            }}
                        />
                    ) : null)}

                {/* STEP 4: Reaction */}
                {step === 4 && !selectedItem && !reaction && (
                    <CatalogPage
                        items={parsedReactions.filter(
                            (r) => r.platform === (reactionService ?? "")
                        )}
                        description={
                            reactionService
                                ? `Choose a reaction for ${reactionService}`
                                : "Choose a reaction"
                        }
                        onSelect={handleSelect}
                        noButton={true}
                    />
                )}
                {step === 4 && selectedItem && (
                    <div className="w-full flex-1 flex flex-col">
                        <ConfigWidget
                            state="config"
                            color={selectedItem.color}
                            platform={selectedItem.platform}
                            onConnect={() => {
                                setReaction(selectedItem.label);
                                setSelectedItem(null);
                            }}
                            onClose={handleCloseWidget}
                            params={getParams(selectedItem, "reaction")}
                            values={reactionParams}
                            onChange={setReactionParams}
                        />
                    </div>
                )}

                {/* SUMMARY */}
                {step === 4 && reaction && !selectedItem && (
                    <div className="w-full flex-1 flex flex-col">
                        <Summary
                            actionService={actionService}
                            action={action}
                            actionsList={actionsList}
                            reactionService={reactionService}
                            reaction={reaction}
                            actionDefName={null} // Handled via actionsList
                            reactionDefName={
                                (
                                    parsedReactions.find(
                                        (r) =>
                                            r.label === reaction &&
                                            r.platform === reactionService
                                    ) as
                                        | (CatalogItem & { defName?: string })
                                        | undefined
                                )?.defName
                            }
                            actionParams={actionParams}
                            reactionParams={reactionParams}
                            onBack={() => {
                                setReaction(null);
                                setReactionParams({});
                            }}
                            colors={[actionColor, reactionColor]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
