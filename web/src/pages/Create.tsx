import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

import { getPlatformColor } from "@/config/platforms";
import { fetchCatalogFromAbout } from "@/services/aboutParser";
import { aboutService } from "@/services/api/aboutService";
import ConfigWidget from "../component/ConfigWidget";
import type { ParameterDefinition } from "../component/ConfigWidget";
import ProgressBar from "../component/ProgressBar";
import type { CatalogItem } from "../data/catalogData";
import CatalogPage from "./CatalogPage";
import Summary from "./Summary";

type ServiceActionReaction = {
    name: string;
    description: string;
    input_params?: ParameterDefinition[];
};

type ServiceDefinition = {
    name: string;
    actions: ServiceActionReaction[];
    reactions: ServiceActionReaction[];
};

type AboutData = {
    client: { host: string };
    server: {
        current_time: number;
        services: ServiceDefinition[];
    };
};

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
                items.map((item) => ({
                    ...item,
                    color: getPlatformColor(item.platform),
                }));

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
    };

    return (
        <div
            key={location.key}
            className="h-[calc(100vh-80px)] flex flex-col overflow-hidden text-center"
        >
            <h1 className="text-7xl font-bold m-4 shrink-0">
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

            <div className="flex-1 w-full mt-6 overflow-hidden flex flex-col min-h-0">
                {/* STEP 1: Service Action */}
                {step === 1 && !selectedItem && (
                    <CatalogPage
                        items={parsedServices}
                        description="Choose service for your action"
                        onSelect={handleSelect}
                    />
                )}
                {step === 1 && selectedItem && (
                    <div className="w-full flex-1 overflow-hidden flex flex-col min-h-0">
                        <ConfigWidget
                            state="connect"
                            color={selectedItem.color}
                            platform={selectedItem.platform}
                            onConnect={() => {
                                setActionService(selectedItem.platform);
                                setStep(2);
                                setSelectedItem(null);
                            }}
                            onClose={handleCloseWidget}
                        />
                    </div>
                )}

                {/* STEP 2: Action */}
                {step === 2 && !selectedItem && actionService && (
                    <CatalogPage
                        items={parsedActions.filter(
                            (a) => a.platform === actionService
                        )}
                        description={`Choose an action for ${actionService}`}
                        onSelect={handleSelect}
                    />
                )}
                {step === 2 && selectedItem && (
                    <div className="w-full flex-1 overflow-hidden flex flex-col min-h-0">
                        <ConfigWidget
                            state="config"
                            color={selectedItem.color}
                            platform={selectedItem.platform}
                            onConnect={() => {
                                setAction(selectedItem.title);
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
                    />
                )}
                {step === 3 && selectedItem && (
                    <div className="w-full flex-1 overflow-hidden flex flex-col min-h-0">
                        <ConfigWidget
                            state="connect"
                            color={selectedItem.color}
                            platform={selectedItem.platform}
                            onConnect={() => {
                                setReactionService(selectedItem.platform);
                                setStep(4);
                                setSelectedItem(null);
                            }}
                            onClose={handleCloseWidget}
                        />
                    </div>
                )}

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
                    />
                )}
                {step === 4 && selectedItem && (
                    <div className="w-full flex-1 overflow-hidden flex flex-col min-h-0">
                        <ConfigWidget
                            state="config"
                            color={selectedItem.color}
                            platform={selectedItem.platform}
                            onConnect={() => {
                                setReaction(selectedItem.title);
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
                    <div className="w-full flex-1 overflow-hidden flex flex-col min-h-0">
                        <Summary
                            actionService={actionService}
                            action={action}
                            reactionService={reactionService}
                            reaction={reaction}
                            actionDefName={
                                (
                                    parsedActions.find(
                                        (a) =>
                                            a.title === action &&
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
                                            r.title === reaction &&
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
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
