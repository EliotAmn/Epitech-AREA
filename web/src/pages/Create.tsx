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

export default function Create() {
    const location = useLocation();
    const [step, setStep] = useState<number>(location.state?.step ?? 1);

    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

    const [actionService, setActionService] = useState<string>("");
    const [action, setAction] = useState<string | null>(null);
    const [reactionService, setReactionService] = useState<string>("");
    const [reaction, setReaction] = useState<string | null>(null);

    const [actionParams, setActionParams] = useState<Record<string, unknown>>(
        {}
    );
    const [reactionParams, setReactionParams] = useState<
        Record<string, unknown>
    >({});
    const [aboutData, setAboutData] = useState<AboutData | null>(null);

    const goToStep = (s: number) => {
        if (s === 2 && !actionService) s = 1;
        if (s === 3 && !action) s = actionService ? 2 : 1;
        if (s === 4 && !reactionService) s = action ? 3 : actionService ? 2 : 1;

        if (s <= 1) {
            setActionService("");
            setAction(null);
            setReactionService("");
            setReaction(null);
            setActionParams({});
            setReactionParams({});
        } else if (s === 2) {
            setAction(null);
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
        !!action,
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

    const getActionOutputParams = () => {
        if (!aboutData?.server?.services || !action) return [];
        const defName =
            (
                parsedActions.find(
                    (a) => a.label === action && a.platform === actionService
                ) as (CatalogItem & { defName?: string }) | undefined
            )?.defName || action;

        for (const svc of aboutData.server.services) {
            const found = svc.actions?.find((x) => x.name === defName);
            if (found) return found.output_params || [];
        }
        return [];
    };

    const handleSelect = (item: CatalogItem) => {
        setSelectedItem(item);
    };

    const handleCloseWidget = () => {
        setSelectedItem(null);
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
                        "Action",
                        "Service (reaction)",
                        "Reaction",
                    ]}
                    completedSteps={completedSteps}
                />
            </div>

            <div className="flex-1 w-full mt-2 flex flex-col">
                {/* STEP 1: Service Action */}
                {step === 1 && !selectedItem && (
                    <CatalogPage
                        items={parsedServices}
                        description="Choose service for your action"
                        onSelect={handleSelect}
                        noButton={true}
                    />
                )}
                {step === 1 &&
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
                                setActionService(selectedItem.platform);
                                setStep(2);
                                setSelectedItem(null);
                                if (selectedItem.oauth_url) {
                                    window.location.href =
                                        selectedItem.oauth_url;
                                } else {
                                    navigate("/create");
                                }
                            }}
                            onDiscard={() => {
                                setActionService("");
                                setStep(1);
                                setSelectedItem(null);
                            }}
                        />
                    ) : null)}

                {/* STEP 2: Action */}
                {step === 2 && !selectedItem && actionService && (
                    <CatalogPage
                        items={parsedActions.filter(
                            (a) => a.platform === actionService
                        )}
                        description={`Choose an action for ${actionService}`}
                        onSelect={handleSelect}
                        noButton={true}
                    />
                )}
                {step === 2 && selectedItem && (
                    <div>
                        <ConfigWidget
                            state="config"
                            color={selectedItem.color}
                            platform={selectedItem.platform}
                            onConnect={() => {
                                setAction(selectedItem.label);
                                setStep(3);
                                setSelectedItem(null);
                            }}
                            onClose={handleCloseWidget}
                            params={getParams(selectedItem, "action")}
                            values={actionParams}
                            onChange={setActionParams}
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
                            // show action output params on the left when configuring a reaction
                            showOutputCard={!!action}
                            outputParams={getActionOutputParams()}
                        />
                    </div>
                )}

                {/* SUMMARY */}
                {step === 4 && reaction && !selectedItem && (
                    <div className="w-full flex-1 flex flex-col">
                        <Summary
                            actionService={actionService}
                            action={action}
                            reactionService={reactionService}
                            reaction={reaction}
                            actionDefName={
                                (
                                    parsedActions.find(
                                        (a) =>
                                            a.label === action &&
                                            a.platform === actionService
                                    ) as
                                        | (CatalogItem & { defName?: string })
                                        | undefined
                                )?.defName
                            }
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
