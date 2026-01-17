import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { getPlatformColor } from "@/config/platforms";
import { fetchCatalogFromAbout } from "@/services/aboutParser";
import { areaService } from "@/services/api/areaService";
import type { CatalogItem } from "../data/catalogData";
import CatalogPage from "./CatalogPage";

type AreaDto = {
    id: string;
    name: string;
    user_id?: string;
    actions?: Array<{ action_name: string; params?: Record<string, unknown> }>;
    reactions?: Array<{
        reaction_name: string;
        params?: Record<string, unknown>;
    }>;
};

export default function Areas() {
    const navigate = useNavigate();
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [rawAreas, setRawAreas] = useState<AreaDto[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAreas = async () => {
        setLoading(true);
        try {
            const [areas, catalog] = await Promise.all([
                areaService.getMyAreas() as Promise<AreaDto[]>,
                fetchCatalogFromAbout(),
            ]);
            const list = areas || [];
            setRawAreas(list);

            const mapped: CatalogItem[] = list.map((a) => {
                let color = "#808080";
                let platform = "Unknown";
                let reactionPlatform: string | undefined = undefined;

                if (a.actions && a.actions.length > 0) {
                    const actionName = a.actions[0].action_name;
                    const found = catalog.actions.find(
                        (act) =>
                            act.title === actionName ||
                            (act as CatalogItem & { defName?: string })
                                .defName === actionName
                    );

                    if (found) {
                        platform = found.platform;
                        color = getPlatformColor(platform);
                    }
                }

                if (a.reactions && a.reactions.length > 0) {
                    const reactionName = a.reactions[0].reaction_name;
                    const foundR = catalog.reactions.find(
                        (r) =>
                            r.title === reactionName ||
                            (r as CatalogItem & { defName?: string })
                                .defName === reactionName
                    );
                    if (foundR) {
                        reactionPlatform = foundR.platform;
                    }
                }

                return {
                    id: a.id,
                    title: a.name,
                    label: a.name,
                    description: a.name,
                    platform,
                    color,
                    reactionPlatform,
                };
            });
            setItems(mapped);
        } catch (err) {
            console.error(err);
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

    const handleSelect = (item: CatalogItem) => {
        const area = rawAreas.find((a) => a.id === item.id);
        if (area) {
            navigate(`/area/${item.id}`, { state: { area, item } });
        }
    };

    if (loading && items.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <CatalogPage
                description="My Areas"
                items={items}
                onSelect={(item) => handleSelect(item)}
                showPlatform={false}
                noButton={true}
            />
        </div>
    );
}
