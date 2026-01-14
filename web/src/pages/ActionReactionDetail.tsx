import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";

import type { ParameterDefinition } from "@/component/ConfigWidget";
import GlassCardLayout from "@/component/glassCard";
import { getPlatformColor, getPlatformIcon } from "@/config/platforms";
import { fetchCatalogFromAbout } from "@/services/aboutParser";
import { aboutService } from "@/services/api/aboutService";
import type {
    AboutData,
    ServiceActionReaction,
} from "@/services/types/aboutTypes";
import type { CatalogItem } from "../data/catalogData";

export default function ActionReactionDetail() {
    const navigate = useNavigate();
    const location = useLocation() as Location & { state?: CatalogItem };
    const navItem = location.state;

    const [item, setItem] = useState<CatalogItem | null>(navItem ?? null);
    const [inputs, setInputs] = useState<ParameterDefinition[] | null>(null);
    const [outputs, setOutputs] = useState<ParameterDefinition[] | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (item) return;
            try {
                const catalog = await fetchCatalogFromAbout();
                const all = [
                    ...catalog.actions,
                    ...catalog.reactions,
                    ...catalog.services,
                ];
                const found = all.find((it) => it.path === location.pathname);
                if (!mounted) return;
                if (found) setItem(found);
            } catch (err) {
                console.error("Failed to load catalog", err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [item, location.pathname]);

    useEffect(() => {
        let mounted = true;

        const resolveParams = async (
            itm: CatalogItem
        ): Promise<{
            input_params: ParameterDefinition[];
            output_params: ParameterDefinition[];
        }> => {
            try {
                const about = await aboutService.getAbout();
                const services = (about as AboutData).server?.services;
                const defName =
                    (itm as CatalogItem & { defName?: string }).defName ||
                    itm.title;

                for (const svc of services ?? []) {
                    const svcName = svc?.name;
                    if (!svcName) continue;
                    // match by service platform/name
                    if (
                        svcName.toLowerCase() !==
                        (itm.platform || "").toLowerCase()
                    )
                        continue;
                    const list = svc.actions.concat(svc.reactions);
                    const found = list?.find(
                        (
                            x: ServiceActionReaction & {
                                title?: string;
                                label?: string;
                                output_params?: ParameterDefinition[];
                            }
                        ) =>
                            x.name === defName ||
                            x.title === itm.title ||
                            x.label === itm.title
                    );
                    if (found) {
                        return {
                            input_params: found.input_params || [],
                            output_params: found.output_params || [],
                        };
                    }
                }
            } catch (err) {
                console.error("resolveParams failed", err);
            }
            return { input_params: [], output_params: [] };
        };

        (async () => {
            if (!item) return;
            try {
                const res = await resolveParams(item);
                if (!mounted) return;
                setInputs(res.input_params.length ? res.input_params : null);
                setOutputs(res.output_params.length ? res.output_params : null);
            } catch (err) {
                console.error("Failed to resolve params", err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [item]);

    const color = getPlatformColor(item?.platform || "");
    const icon = getPlatformIcon(item?.platform || "");

    const displayTitle = item ? item.label || item.title : "Unknown Item";

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="max-w-4xl mx-auto mt-8">
                <GlassCardLayout color={color} onBack={() => navigate(-1)}>
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            {icon && (
                                <img
                                    src={icon}
                                    alt={item?.platform}
                                    className="w-16 h-16"
                                />
                            )}
                            <div>
                                <h1 className="text-2xl font-extrabold">
                                    {displayTitle}
                                </h1>
                                {item?.description && (
                                    <div className="text-sm text-slate-600 mt-2 max-w-prose">
                                        {item.description}
                                    </div>
                                )}
                                <div className="text-sm text-slate-500 pt-2">
                                    Service: <strong>{item?.platform}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 bg-white p-6 rounded-lg">
                            <div>
                                <h3 className="text-lg font-bold mb-2">
                                    Input Parameters
                                </h3>
                                {inputs === null ? (
                                    <div className="text-sm text-slate-400">
                                        No input parameters defined.
                                    </div>
                                ) : (
                                    inputs.map((p) => (
                                        <div key={p.name} className="mb-3">
                                            <div className="font-semibold">
                                                {p.label || p.name}{" "}
                                                <span className="text-xs text-slate-400">
                                                    ({p.type})
                                                </span>
                                            </div>
                                            {p.description && (
                                                <div className="text-sm text-slate-500">
                                                    {p.description}
                                                </div>
                                            )}
                                            {p.type === "select" &&
                                                p.options && (
                                                    <div className="text-sm text-slate-600">
                                                        Options:{" "}
                                                        {(
                                                            p.options as (
                                                                | string
                                                                | {
                                                                      label?: string;
                                                                      value?: string;
                                                                  }
                                                            )[]
                                                        )
                                                            .map((o) =>
                                                                typeof o ===
                                                                "string"
                                                                    ? o
                                                                    : o.label ||
                                                                      o.value
                                                            )
                                                            .join(", ")}
                                                    </div>
                                                )}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">
                                    Output Parameters
                                </h3>
                                {outputs === null ? (
                                    <div className="text-sm text-slate-400">
                                        No output parameters defined.
                                    </div>
                                ) : (
                                    outputs.map((p) => (
                                        <div key={p.name} className="mb-3">
                                            <div className="font-semibold">
                                                {p.label || p.name}{" "}
                                                <span className="text-xs text-slate-400">
                                                    ({p.type})
                                                </span>
                                            </div>
                                            {p.description && (
                                                <div className="text-sm text-slate-500">
                                                    {p.description}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </GlassCardLayout>
            </div>
        </div>
    );
}
