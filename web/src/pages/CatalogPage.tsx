import { useMemo, useState } from "react";

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "@/component/button";
import SearchBar from "../component/SearchBar";
import Widget from "../component/widget";
import type { CatalogItem } from "../data/catalogData";

interface CatalogPageProps {
    items: CatalogItem[];
    description?: string;
    onSelect?: (item: CatalogItem) => void;
    noButton?: boolean;
    backButton?: boolean;
    onBack?: () => void;
    showPlatform?: boolean;
}

export default function CatalogPage({
    items,
    description,
    onSelect,
    noButton = false,
    backButton,
    onBack,
    showPlatform = true,
}: CatalogPageProps) {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const itemLabel = useMemo(() => {
        if (!items || items.length === 0) return "Item";
        const id = items[0].id || "";
        if (id.startsWith("service::")) return "Service";
        if (id.startsWith("action::")) return "Action";
        if (id.startsWith("reaction::")) return "Reaction";
        return "Area";
    }, [items]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (it) =>
                it.title.toLowerCase().includes(q) ||
                it.platform.toLowerCase().includes(q)
        );
    }, [items, query]);

    return (
        <div className="flex flex-col w-full bg-slate-50">
            <div className="relative w-full pt-16 pb-20 px-8">
                <div
                    className="absolute inset-0 z-0 opacity-40"
                    style={{
                        filter: "blur(80px)",
                        backgroundImage: `radial-gradient(at 0% 0%, #3b82f6 0px, transparent 50%), radial-gradient(at 100% 0%, #8b5cf6 0px, transparent 50%)`,
                    }}
                />
                <div className="relative z-10 max-w-7xl mx-auto">
                    <div
                        className={`flex flex-col md:flex-row  ${description ? "md:items-end" : "md:items-start"} justify-between gap-6`}
                    >
                        <div className="flex items-center gap-6">
                            {backButton && (
                                <button
                                    onClick={onBack}
                                    className="bg-white p-3 rounded-full shadow-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6 text-slate-900" />
                                </button>
                            )}
                            <div className="text-left">
                                <h1
                                    className={`text-6xl font-black text-slate-900 mb-2 ${description ? "-mt-8" : "mt-0"}`}
                                >
                                    {description}
                                </h1>
                                <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] ml-1">
                                    {items.length} {itemLabel}
                                    {items.length <= 1 ? "" : "s"}
                                </p>
                            </div>
                        </div>
                        {noButton ? null : (
                            <Button
                                label="+ Create new area"
                                onClick={() => navigate("/create")}
                                mode="black"
                                className="shadow-xl shadow-slate-200"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="relative z-20 max-w-7xl w-full mx-auto px-8 -mt-10">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                        <SearchBar
                            value={query}
                            onChange={setQuery}
                            placeholder="Find an automation..."
                        />
                    </div>
                </div>
            </div>

            <div className="w-full mt-8">
                <div className="max-w-7xl mx-auto px-8 pb-12 flex flex-col items-center">
                    <div className="responsiveGrid">
                        {filtered.length === 0 ? (
                            <div className="col-span-full text-center text-slate-400 py-20 bg-white/40 rounded-4xl border border-dashed border-slate-200">
                                <p className="font-bold italic">
                                    No results found.
                                </p>
                            </div>
                        ) : (
                            filtered.map((item) => (
                                <Widget
                                    key={item.id}
                                    title={item.label}
                                    platform={item.platform}
                                    reactionPlatform={item.reactionPlatform}
                                    color={item.color}
                                    showPlatform={showPlatform}
                                    onClick={() => onSelect && onSelect(item)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
