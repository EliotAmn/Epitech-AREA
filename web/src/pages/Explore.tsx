import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { fetchCatalogFromAbout } from "@/services/aboutParser";
import Button from "../component/button";
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
            setParsedReactions(parsed.reactions);
            setParsedServices(parsed.services);
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
        <div className="min-h-screen flex flex-col items-center justify-start">
            <h1 className="text-5xl text-black font-bold m-5">Explore</h1>
            <div className="mb-6">
                <Button
                    label="Create my own area"
                    mode="white"
                    onClick={() => navigate("/create")}
                />
            </div>
            <div className="w-3/4 mx-auto pt-4">
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

            <CatalogPage items={itemsToShow} />
        </div>
    );
}
