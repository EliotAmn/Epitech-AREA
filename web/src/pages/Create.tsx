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
import { areaService } from "@/services/api/areaService";
import { getUserServiceStatus } from "@/services/api/userserviceClient";
import type { AboutData } from "@/services/types/aboutTypes";
import Button from "../component/button";
import ConfigWidget from "../component/ConfigWidget";
import type { CatalogItem } from "../data/catalogData";
import CatalogPage from "./CatalogPage";

export default function Create() {
    const location = useLocation();
    const [step, setStep] = useState<number>(location.state?.step ?? 0);

    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

    const [actionService, setActionService] = useState<string>("");
    const [actionParams, setActionParams] = useState<Record<string, unknown>>(
        {}
    );

    const [actionsList, setActionsList] = useState<
        {
            service: string;
            action: string;
            params: Record<string, unknown>;
            defName?: string;
        }[]
    >([]);
    const [editingActionIndex, setEditingActionIndex] = useState<number | null>(
        null
    );

    const [reactionService, setReactionService] = useState<string>("");

    const [reactionsList, setReactionsList] = useState<
        {
            service: string;
            reaction: string;
            params: Record<string, unknown>;
            defName?: string;
        }[]
    >([]);
    const [editingReactionIndex, setEditingReactionIndex] = useState<
        number | null
    >(null);

    const [reactionParams, setReactionParams] = useState<
        Record<string, unknown>
    >({});
    const [aboutData, setAboutData] = useState<AboutData | null>(null);

    const handleBack = () => {
        if (step === 1) {
            setStep(0);
            setActionService("");
            setSelectedItem(null);
        } else if (step === 2) {
            setStep(1);
            if (editingActionIndex !== null) {
                setEditingActionIndex(null);
                setStep(0);
            } else {
                setStep(1);
                setActionService("");
                setSelectedServiceConnected(null);
            }
            setSelectedItem(null);
            setActionParams({});
        } else if (step === 3) {
            setStep(0);
            setReactionService("");
            setSelectedItem(null);
        } else if (step === 4) {
            setStep(3);
            if (editingReactionIndex !== null) {
                setEditingReactionIndex(null);
                setStep(0);
            } else {
                setStep(3);
                setSelectedServiceConnected(null);
            }
            setSelectedItem(null);
            setReactionParams({});
        }
    };

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
        if (!aboutData?.server?.services || actionsList.length === 0) return [];
        const action = actionsList[0]?.action;
        const actionSvc = actionsList[0]?.service || actionService;
        const defName =
            (
                parsedActions.find(
                    (a) => a.label === action && a.platform === actionSvc
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

    const editAction = (index: number) => {
        const item = actionsList[index];
        const catalogItem = parsedActions.find(
            (a) => a.platform === item.service && a.label === item.action
        );
        if (catalogItem) {
            setSelectedItem(catalogItem);
            setActionService(item.service);
            setActionParams(item.params);
            setEditingActionIndex(index);
            setStep(2);
        }
    };

    const editReaction = (index: number) => {
        const item = reactionsList[index];
        const catalogItem = parsedReactions.find(
            (r) => r.platform === item.service && r.label === item.reaction
        );
        if (catalogItem) {
            setSelectedItem(catalogItem);
            setReactionService(item.service);
            setReactionParams(item.params);
            setEditingReactionIndex(index);
            setStep(4);
        }
    };

    return (
        <div
            key={location.key}
            className="h-[calc(100vh-80px)] flex flex-col overflow-y-auto text-center"
        >
            {step === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-0 pb-12">
                    <h1 className="text-7xl font-bold mb-8 shrink-0">
                        Create your own area
                    </h1>
                    <div className="flex flex-col items-center justify-center mt-24">
                        <div
                            className="bg-black text-white rounded-2xl w-[500px] p-8 relative z-10 shadow-xl transition-transform hover:scale-[1.01]"
                            onClick={() => setStep(1)}
                        >
                            <div className="relative flex items-center justify-center m-2">
                                <h2 className="text-5xl font-black tracking-tighter">
                                    If This
                                </h2>
                                <button className="absolute right-0 bg-white text-black px-6 py-2 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors">
                                    Add
                                </button>
                            </div>

                            {actionsList.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    {actionsList.map((act, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-gray-900 rounded-xl p-4 flex items-center justify-between group cursor-pointer border border-gray-800 hover:border-gray-600 transition-all"
                                            onClick={() => editAction(idx)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                                    {idx + 1}
                                                </div>
                                                <span className="font-semibold text-lg">
                                                    {act.action}
                                                </span>
                                            </div>
                                            <span className="text-gray-500 text-sm group-hover:text-white transition-colors">
                                                Edit
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 w-2 h-16 bg-[#EEEEEE] -z-10"></div>
                        </div>

                        <div
                            className={`rounded-2xl w-[500px] p-8 relative z-20 mt-14 shadow-inner transition-colors duration-300 bg-[#C2C2C2]`}
                        >
                            <div className="relative flex items-center justify-center m-2">
                                <h2 className="text-5xl font-black tracking-tighter text-white">
                                    Then That
                                </h2>

                                {actionsList.length !== 0 && (
                                    <button
                                        onClick={() => setStep(3)}
                                        className="absolute right-0 bg-white text-black px-6 py-2 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors"
                                        disabled={actionsList.length === 0}
                                    >
                                        Add
                                    </button>
                                )}
                            </div>

                            {reactionsList.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    {reactionsList.map((react, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white rounded-xl p-4 flex items-center justify-between border border-gray-300 group cursor-pointer hover:border-gray-500 transition-all"
                                            onClick={() => editReaction(idx)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gray-200 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                                    {idx + 1}
                                                </div>
                                                <span className="font-semibold text-lg text-gray-800">
                                                    {react.reaction}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-sm group-hover:text-gray-600 transition-colors">
                                                Edit
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {actionsList.length > 0 && reactionsList.length > 0 && (
                        <div className="mt-8">
                            <Button
                                label="Continue"
                                onClick={async () => {
                                    const payload = {
                                        name: `If ${actionsList[0].action} then ${reactionsList[0].reaction}`,
                                        actions: actionsList.map((a) => ({
                                            action_name: a.defName || a.action,
                                            params: a.params,
                                        })),
                                        reactions: reactionsList.map((r) => ({
                                            reaction_name:
                                                r.defName || r.reaction,
                                            params: r.params,
                                        })),
                                    };
                                    try {
                                        await areaService.createArea(payload);
                                        navigate("/my-areas");
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                mode="black"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="flex-1 w-full mt-2 flex flex-col">
                {/* STEP 1: Service Action */}
                {step === 1 && !selectedItem && (
                    <CatalogPage
                        items={parsedServices}
                        description="Choose service for your action"
                        onSelect={handleSelect}
                        noButton={true}
                        onBack={() => {
                            setStep(0);
                        }}
                        backButton={true}
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
                                    navigate("/create", { state: { step: 2 } });
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
                        onBack={() => {
                            setStep(1);
                        }}
                        backButton={true}
                    />
                )}
                {step === 2 && selectedItem && (
                    <div>
                        <ConfigWidget
                            state="config"
                            color={selectedItem.color}
                            platform={selectedItem.platform}
                            onConnect={() => {
                                const defName =
                                    (
                                        selectedItem as CatalogItem & {
                                            defName?: string;
                                        }
                                    ).defName || selectedItem.label;
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
                                setActionService("");
                                setStep(0);
                                setSelectedItem(null);
                            }}
                            onClose={handleBack}
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
                            // Handle reaction service selection
                            setReactionService(item.platform);
                            setStep(4);
                        }}
                        noButton={true}
                        onBack={() => {
                            setStep(2);
                        }}
                        backButton={true}
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
                                    navigate("/create", { state: { step: 4 } });
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
                {step === 4 && !selectedItem && (
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
                        onBack={() => {
                            setStep(3);
                        }}
                        backButton={true}
                    />
                )}
                {step === 4 && selectedItem && (
                    <div className="w-full flex-1 flex flex-col">
                        <ConfigWidget
                            state="config"
                            color={selectedItem.color}
                            platform={selectedItem.platform}
                            onConnect={() => {
                                const defName =
                                    (
                                        selectedItem as CatalogItem & {
                                            defName?: string;
                                        }
                                    ).defName || selectedItem.label;
                                const newReaction = {
                                    service: selectedItem.platform,
                                    reaction: selectedItem.label,
                                    defName: defName,
                                    params: reactionParams,
                                };

                                if (editingReactionIndex !== null) {
                                    const updated = [...reactionsList];
                                    updated[editingReactionIndex] = newReaction;
                                    setReactionsList(updated);
                                    setEditingReactionIndex(null);
                                } else {
                                    setReactionsList([
                                        ...reactionsList,
                                        newReaction,
                                    ]);
                                }

                                setReactionParams({});
                                setSelectedItem(null);
                                setStep(0);
                            }}
                            onClose={handleCloseWidget}
                            params={getParams(selectedItem, "reaction")}
                            values={reactionParams}
                            onChange={setReactionParams}
                            // show action output params on the left when configuring a reaction
                            showOutputCard={actionsList.length > 0}
                            outputParams={getActionOutputParams()}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
