import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { getPlatformColor } from "@/config/platforms";
import { fetchCatalogFromAbout } from "@/services/aboutParser";
import type { CatalogItem } from "../data/catalogData";
import CatalogPage from "./CatalogPage";

export default function Explore() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<"all" | "reactions" | "services">(
        "all"
    );
    const [parsedReactions, setParsedReactions] = useState<CatalogItem[]>([]);
    const [parsedServices, setParsedServices] = useState<CatalogItem[]>([]);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            const parsed = await fetchCatalogFromAbout();
            if (!mounted) return;

            const applyColors = (items: CatalogItem[]) =>
                items.map((item) => ({
                    ...item,
                    color: getPlatformColor(item.platform),
                }));

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
            ? [...parsedReactions, ...parsedServices]
            : filter === "reactions"
              ? parsedReactions
              : parsedServices;

    return (
        <div className="h-screen flex flex-col items-center justify-start overflow-hidden">
            <h1 className="text-5xl text-black font-bold m-5 shrink-0">
                Explore
            </h1>
            <div className="w-3/4 mx-auto pt-4 shrink-0">
                <div className="flex items-center justify-center gap-20 mb-4">
                    <button
                        className={`cursor-pointer text-2xl font-semibold text-center ${filter === "all" ? "underline" : "text-black"}`}
                        onClick={() => setFilter("all")}
                    >
                        All
                    </button>
                    <button
                        className={`cursor-pointer text-2xl font-semibold text-center ${filter === "reactions" ? "underline" : "text-black"}`}
                        onClick={() => setFilter("reactions")}
                    >
                        Reactions
                    </button>
                    <button
                        className={`cursor-pointer text-2xl font-semibold text-center ${filter === "services" ? "underline" : "text-black"}`}
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
                        navigate(item.path ?? `/widget/${item.id}`,
                            { state: { title: item.title, color: item.color, platform: item.platform, oauth_url: item.oauth_url } }
                        )
                    }
                />
            </div>
        </div>
    );
}
