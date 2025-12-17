import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import Button from "@/component/button";
import SearchBar from "../component/SearchBar";
import Widget from "../component/widget";

import "../styles/responsiveGrids.css";

import type { CatalogItem } from "../data/catalogData";

interface CatalogPageProps {
    items: CatalogItem[];
    description?: string;
    onSelect?: (item: CatalogItem) => void;
    noResultsButton?: boolean;
}

export default function CatalogPage({
    items,
    description,
    onSelect,
    noResultsButton,
}: CatalogPageProps) {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

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
        <div className="h-full flex flex-col w-full overflow-hidden">
            <div className="w-full px-4 sm:px-8 flex flex-col items-center shrink-0 pt-4">
                {description && (
                    <div className="mb-4 text-center text-4xl font-bold">
                        {description}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full justify-center mb-6">
                    <div className="w-full flex justify-center">
                        <div className="w-full sm:w-auto">
                            <SearchBar
                                value={query}
                                onChange={setQuery}
                                placeholder="Search by title or platform..."
                                className="mx-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full overflow-y-auto px-4 sm:px-8 pb-8 flex flex-col items-center">
                <div className="responsiveGrid">
                    {noResultsButton && (
                        <div className="col-span-full text-center mt-4 mb-2">
                            <Button
                                label="Create area"
                                onClick={() => {
                                    navigate("/create");
                                }}
                            />
                        </div>
                    )}
                    {filtered.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-8 rounded bg-gray-50">
                            No results
                        </div>
                    ) : (
                        filtered.map((item) => (
                            <Widget
                                key={item.id}
                                title={item.title}
                                platform={item.platform}
                                color={item.color}
                                onClick={() => onSelect && onSelect(item)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
