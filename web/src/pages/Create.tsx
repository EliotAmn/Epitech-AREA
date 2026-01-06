import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import Button from "@/component/button";
import GlassCardLayout from "@/component/glassCard";
import { getPlatformColor, getPlatformIcon } from "@/config/platforms";
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

const ConnectCard = ({
    item,
    onConnect,
    onBack,
    onDiscard,
}: {
    item: CatalogItem;
    onConnect: () => void;
    onBack?: () => void;
    onDiscard?: () => void;
}) => {
    const icon = getPlatformIcon(item.platform);
    return (
        <div className="w-full flex-1 flex flex-col">
            <GlassCardLayout color={item.color} onBack={onBack} footer={false}>
                <div className="flex flex-col w-full max-w-md mx-auto items-center">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">
                            Connect your {item.platform} account
                        </h1>
                    </div>
                    <div className="relative mb-8">
                        <div
                            className="absolute inset-0 blur-2xl opacity-30 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        {icon && (
                            <img
                                src={icon}
                                alt={item.platform}
                                className="relative w-32 h-32 object-contain transition-transform hover:scale-110 duration-300"
                            />
                        )}
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-3">
                        <Button
                            label="Connect"
                            onClick={onConnect}
                            mode="black"
                            className="w-full py-4"
                        />
                        <button
                            onClick={() => onDiscard && onDiscard()}
                            className="text-slate-400 text-xs font-bold uppercase hover:text-slate-600 transition-colors py-2 text-center"
                        >
                            Discard
                        </button>
                    </div>
                </div>
            </GlassCardLayout>
        </div>
    );
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
    const navigate = useNavigate();

    // compute selected colors for action/reaction to pass to Summary
    const actionColor =
        parsedActions.find(
            (a) => a.title === action && a.platform === actionService
        )?.color ||
        parsedServices.find((s) => s.platform === actionService)?.color ||
        "#000000";

    const reactionColor =
        parsedReactions.find(
            (r) => r.title === reaction && r.platform === reactionService
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
                {step === 1 && selectedItem && (
                    <ConnectCard
                        item={selectedItem}
                        onBack={handleCloseWidget}
                        onConnect={() => {
                            setActionService(selectedItem.platform);
                            setStep(2);
                            setSelectedItem(null);
                        }}
                        onDiscard={() => navigate(-1)}
                    />
                )}

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
                        noButton={true}
                    />
                )}
                {step === 3 && selectedItem && (
                    <ConnectCard
                        item={selectedItem}
                        onBack={handleCloseWidget}
                        onConnect={() => {
                            setReactionService(selectedItem.platform);
                            setStep(4);
                            setSelectedItem(null);
                        }}
                        onDiscard={() => navigate(-1)}
                    />
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
                            colors={[actionColor, reactionColor]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
