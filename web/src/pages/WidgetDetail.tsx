import { useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { getPlatformColor, getPlatformIcon } from "@/config/platforms";
import { fetchCatalogFromAbout } from "@/services/aboutParser";
import {
    disconnectUserService,
    getUserServiceStatus,
} from "@/services/api/userserviceClient";
import Button from "../component/button";
import SearchBar from "../component/SearchBar";
import Widget from "../component/widget";
import type { CatalogItem } from "../data/catalogData";

type WidgetLocationState = {
    title?: string;
    color?: string;
    platform?: string;
    description?: string;
    oauth_url?: string;
};

export default function WidgetDetail() {
    const navigate = useNavigate();
    const location = useLocation() as { state?: WidgetLocationState };
    const state = location.state ?? {};

    const title = state.title ?? "Widget without title";
    const color =
        typeof state.color === "string"
            ? state.color
            : getPlatformColor(state.platform ?? "unknown");
    const platform = state.platform ?? "unknown";
    const label = platform.charAt(0).toUpperCase() + platform.slice(1);
    const oauth_url = state.oauth_url;
    const description = state.description ?? "";

    const [connected, setConnected] = useState<boolean | null>(null);
    const [filter, setFilter] = useState<"actions" | "reactions">("actions");
    const [query, setQuery] = useState("");
    const [actions, setActions] = useState<CatalogItem[]>([]);
    const [reactions, setReactions] = useState<CatalogItem[]>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getUserServiceStatus(platform);
                if (!mounted) return;
                setConnected(!!res.connected);
            } catch {
                if (!mounted) return;
                setConnected(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [platform]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const catalog = await fetchCatalogFromAbout();
                if (!mounted) return;
                setActions(
                    catalog.actions.filter((a) => a.platform === platform)
                );
                setReactions(
                    catalog.reactions.filter((r) => r.platform === platform)
                );
            } catch (err) {
                console.error("Failed to fetch catalog", err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [platform]);

    const platformIcon = getPlatformIcon(platform);

    const itemsToShow = filter === "actions" ? actions : reactions;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return itemsToShow;
        return itemsToShow.filter(
            (it) =>
                it.title.toLowerCase().includes(q) ||
                it.platform.toLowerCase().includes(q)
        );
    }, [itemsToShow, query]);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-white">
            {/* Header with service info and connect button */}
            <div className="relative w-full shrink-0">
                <div
                    className="absolute inset-0 z-0 opacity-40"
                    style={{
                        filter: "blur(80px)",
                        backgroundImage: `
                            radial-gradient(at 0% 0%, ${color} 0px, transparent 70%),
                            radial-gradient(at 100% 0%, ${color} 0px, transparent 70%),
                            radial-gradient(at 50% 50%, ${color} 0px, transparent 70%)
                        `,
                    }}
                />
                <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 blur-xl opacity-30 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                {platformIcon && (
                                    <img
                                        src={platformIcon}
                                        alt={platform}
                                        className="relative w-20 h-20 object-contain"
                                    />
                                )}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-slate-600 mt-2 max-w-2xl">
                                        {description}
                                    </p>
                                )}
                                <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] mt-1">
                                    {actions.length}{" "}
                                    {actions.length <= 1 ? "Action" : "Actions"}{" "}
                                    · {reactions.length}{" "}
                                    {reactions.length <= 1
                                        ? "Reaction"
                                        : "Reactions"}
                                </p>
                            </div>
                        </div>
                        <Button
                            label={
                                connected === null
                                    ? "Loading..."
                                    : connected
                                      ? "Disconnect"
                                      : `Connect ${label} Account`
                            }
                            onClick={async () => {
                                if (connected) {
                                    try {
                                        await disconnectUserService(platform);
                                        setConnected(false);
                                    } catch (err) {
                                        console.error("Disconnect failed", err);
                                    }
                                    return;
                                }
                                if (oauth_url) {
                                    window.location.href = oauth_url;
                                } else {
                                    navigate("/create");
                                }
                            }}
                            disabled={connected === null}
                            mode="black"
                            className="shadow-xl shadow-slate-200"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs and search section on white background */}
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
                <div className="w-full shrink-0 bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-8 py-6">
                        <div className="flex items-center justify-center gap-12 mb-6">
                            <button
                                className={`cursor-pointer text-2xl font-semibold ${filter === "actions" ? "underline text-black" : "text-slate-400"}`}
                                onClick={() => setFilter("actions")}
                            >
                                Actions
                            </button>
                            <button
                                className={`cursor-pointer text-2xl font-semibold ${filter === "reactions" ? "underline text-black" : "text-slate-400"}`}
                                onClick={() => setFilter("reactions")}
                            >
                                Reactions
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full">
                                <SearchBar
                                    value={query}
                                    onChange={setQuery}
                                    placeholder={`Search ${filter}...`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid of widgets */}
                <div className="flex-1 w-full overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-8 py-8">
                        <div className="responsiveGrid">
                            {filtered.length === 0 ? (
                                <div className="col-span-full text-center text-slate-400 py-20 bg-white/40 rounded-4xl border border-dashed border-slate-200">
                                    <p className="font-bold italic">
                                        {query
                                            ? `No results found for "${query}"`
                                            : `No ${filter} available`}
                                    </p>
                                </div>
                            ) : (
                                filtered.map(
                                    (item) => (
                                        (
                                            <Widget
                                                key={item.id}
                                                title={item.label}
                                                platform={item.platform}
                                                color={item.color}
                                                onClick={() =>
                                                    navigate(
                                                        item.path ??
                                                            `/widget/${item.id}`,
                                                        { state: item }
                                                    )
                                                }
                                            />
                                        )
                                    )
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
