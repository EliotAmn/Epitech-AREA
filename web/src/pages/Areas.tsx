import { useEffect, useState } from "react";

import type { CatalogItem } from "@/data/catalogData";
import { areaService } from "@/services/api/areaService";
import CatalogPage from "./CatalogPage";

type AreaDto = {
    id: string;
    name: string;
    user_id?: string;
    actions?: Array<{ action_name: string }>;
    reactions?: Array<{ reaction_name: string }>;
};
export default function Areas() {
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const loadAreas = async () => {
        setLoading(true);
        try {
            const areas = (await areaService.getMyAreas()) as Array<AreaDto>;
            const list = areas || [];
            const palette = [
                "#3b82f6",
                "#36C5F0",
                "#000000",
                "#0061FF",
                "#0079BF",
                "#EA4335",
                "#FF6A00",
                "#0F9D58",
                "#8A2BE2",
                "#7289DA",
            ];

            const stringToColor = (s: string | undefined) => {
                if (!s) return palette[0];
                let h = 0;
                for (let i = 0; i < s.length; i++) {
                    h = (h << 5) - h + s.charCodeAt(i);
                    h |= 0;
                }
                return palette[Math.abs(h) % palette.length];
            };

            const mapped: CatalogItem[] = list.map((a) => {
                const platformName =
                    a.reactions && a.reactions.length
                        ? a.reactions[0].reaction_name
                        : a.actions && a.actions.length
                          ? a.actions[0].action_name
                          : "Area";
                return {
                    id: a.id,
                    title: a.name,
                    platform: platformName,
                    color: stringToColor(platformName),
                };
            });
            setItems(mapped);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        if (mounted) loadAreas();
        return () => {
            mounted = false;
        };
    }, []);

    const handleSelect = async (item: CatalogItem) => {
        const ok = window.confirm(`Delete area "${item.title}"?`);
        if (!ok) return;
        try {
            setLoading(true);
            await areaService.deleteArea(item.id);
            await loadAreas();
        } catch (err) {
            // keep simple: console and reload
            // In a full app we'd show a toast
            console.error("Failed to delete area", err);
            await loadAreas();
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <CatalogPage
            description="My Areas"
            items={items}
            onSelect={(item) => handleSelect(item)}
        />
    );
}
