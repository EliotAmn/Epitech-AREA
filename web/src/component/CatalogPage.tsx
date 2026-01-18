import { useMemo, useState } from "react";

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "@/component/button";
import SearchBar from "@/component/SearchBar";
import Widget from "@/component/widget";
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
        <div className="flex flex-col w-full">
            <div className="relative z-10 max-w-7xl p-8 mx-auto">
                <div
                    className={`flex flex-col md:flex-row ${description ? "md:items-end" : "md:items-start"} justify-between gap-6`}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        {backButton && (
                            <button
                                onClick={onBack}
                                className="bg-white p-3 rounded-full shadow-lg border border-slate-100 hover:bg-slate-100 transition-colors shrink-0"
                            >
                                <ArrowLeft className="w-6 h-6 text-slate-900" />
                            </button>
                        )}
                        <div className="text-left">
                            <h1
                                className={`text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4 sm:mb-8 ${description && !backButton ? "-mt-4 sm:-mt-8" : "mt-0"}`}
                            >
                                {description}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-20 max-w-7xl w-full mx-auto -mt-4 sm:-mt-8">
                <div className="flex flex-col sm:flex-row items-center gap-4 px-2">
                    <div className="flex-1 w-full">
                        <SearchBar
                            value={query}
                            onChange={setQuery}
                            placeholder="Find an automation..."
                        />
                    </div>
                    {noButton ? null : (
                        <Button
                            label="+ Create new area"
                            onClick={() => navigate("/create")}
                            mode="black"
                            className="shadow-xl shadow-slate-200 w-full sm:w-auto"
                        />
                    )}
                </div>
                <div className="mt-4 flex items-center gap-3 px-2">
                    <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] ml-1">
                        {filtered.length}{" "}
                        {filtered.length >= 60 ? "item" : itemLabel}
                        {filtered.length <= 1 ? "" : "s"}
                    </p>
                </div>
            </div>
            <div className="">
                <div className="min-h-screen flex flex-col justify-start w-full items-start">
                    <div className="responsiveGrid p-8 w-full">
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
