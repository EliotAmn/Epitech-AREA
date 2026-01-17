import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import CatalogPage from "@/component/CatalogPage";
import { getPlatformColor } from "@/config/platforms";
import {
    fetchCatalogFromAbout,
    sortCatalogItemsByLabel,
} from "@/services/aboutParser";
import type { CatalogItem } from "../data/catalogData";

export default function Explore() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<
        "all" | "actions" | "reactions" | "services"
    >("all");
    const [parsedActions, setParsedActions] = useState<CatalogItem[]>([]);
    const [parsedReactions, setParsedReactions] = useState<CatalogItem[]>([]);
    const [parsedServices, setParsedServices] = useState<CatalogItem[]>([]);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            const parsed = await fetchCatalogFromAbout();
            if (!mounted) return;

            const applyColors = (items: CatalogItem[]) =>
                sortCatalogItemsByLabel(
                    items.map((item) => ({
                        ...item,
                        color: getPlatformColor(item.platform),
                    }))
                );

            setParsedActions(applyColors(parsed.actions));
            setParsedReactions(applyColors(parsed.reactions));
            setParsedServices(applyColors(parsed.services));
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const itemsToShow =
        filter === "all"
            ? [...parsedActions, ...parsedReactions, ...parsedServices].sort(
                  (a, b) =>
                      (a.label || a.title || "")
                          .toLowerCase()
                          .localeCompare(
                              (b.label || b.title || "").toLowerCase()
                          )
              )
            : filter === "actions"
              ? parsedActions
              : filter === "reactions"
                ? parsedReactions
                : parsedServices;

    return (
        <div className="h-screen flex flex-col items-center justify-start">
            <h1 className="text-5xl text-black font-bold m-5 shrink-0">
                Explore
            </h1>
            <div className="w-3/4 mx-auto pt-4 shrink-0">
                <div className="flex items-center justify-center gap-8 mb-4">
                    <button
                        className={`cursor-pointer text-xl md:text-2xl font-semibold text-center ${filter === "all" ? "underline" : "text-black"}`}
                        onClick={() => setFilter("all")}
                    >
                        All
                    </button>
                    <button
                        className={`cursor-pointer text-xl md:text-2xl font-semibold text-center ${filter === "actions" ? "underline" : "text-black"}`}
                        onClick={() => setFilter("actions")}
                    >
                        Actions
                    </button>
                    <button
                        className={`cursor-pointer text-xl md:text-2xl font-semibold text-center ${filter === "reactions" ? "underline" : "text-black"}`}
                        onClick={() => setFilter("reactions")}
                    >
                        Reactions
                    </button>
                    <button
                        className={`cursor-pointer text-xl md:text-2xl font-semibold text-center ${filter === "services" ? "underline" : "text-black"}`}
                        onClick={() => setFilter("services")}
                    >
                        Services
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <CatalogPage
                    items={itemsToShow}
                    onSelect={(item) =>
                        navigate(item.path ?? `/widget/${item.id}`, {
                            state: {
                                title: item.label,
                                color: item.color,
                                platform: item.platform,
                                oauth_url: item.oauth_url,
                                description: item.description,
                            },
                        })
                    }
                    showPlatform={filter !== "services"}
                />
            </div>
        </div>
    );
}
