import { platforms } from "../config/platforms";
import type { CatalogItem } from "../data/catalogData";
import { aboutService, type AboutInfo } from "./api/aboutService";

const colorForService = (name: string) => {
    const map: Record<string, string> = {
        "google": "#3b82f6",
        "google calendar": "#3b82f6",
        "slack": "#36C5F0",
        "notion": "#000000",
        "dropbox": "#0061FF",
        "trello": "#0079BF",
        "email": "#EA4335",
        "todoist": "#FF6A00",
        "google sheets": "#0F9D58",
        "webhook": "#8A2BE2",
        "discord": "#7289DA",
    };

    const key = (name || "").toLowerCase();
    return map[key] || "#6b7280";
};

export const humanize = (s: string) =>
    (s || "")
        .toString()
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/(^|\s)\S/g, (t: string) => t.toUpperCase());

const slugify = (s: string) =>
    (s || "")
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/_/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/(^-|-$)/g, "");

export async function fetchCatalogFromAbout(): Promise<{
    actions: CatalogItem[];
    services: CatalogItem[];
    reactions: CatalogItem[];
}> {
    const actions: CatalogItem[] = [];
    const services: CatalogItem[] = [];
    const reactions: CatalogItem[] = [];

    try {
        const aboutInfo: AboutInfo = await aboutService.getAbout();
        const server = (
            aboutInfo as unknown as { server?: { services?: unknown } }
        )?.server;
        const rawServices: {
            name?: string;
            title?: string;
            oauth_url?: string;
            color?: string;
            logo?: string;
            actions?: { name?: string; title?: string }[];
            reactions?: { name?: string; title?: string }[];
        }[] = server && Array.isArray(server.services) ? server.services : [];

        for (const svc of rawServices) {
            const svcName: string = svc?.name || svc?.title || "Unknown";
            const svcColor = svc?.color || colorForService(svcName);
            const svcLogo = svc?.logo;

            if (svcColor || svcLogo) {
                platforms[svcName.toLowerCase()] = {
                    color: svcColor || "#808080",
                    icon: svcLogo,
                };
            }
            const svcSlug = slugify(svcName) || "service";

            // service entry
            services.push({
                id: `service::${svcSlug}`,
                title: humanize(svcName),
                platform: svcName,
                color: svcColor,
                path: `/service/${encodeURIComponent(svcSlug)}`,
                oauth_url: svc?.oauth_url,
                serviceName: svcName,
            });

            if (Array.isArray(svc.actions)) {
                for (const a of svc.actions) {
                    const aname = a?.name || a?.title || "action";
                    const aslug = slugify(aname) || "action";
                    actions.push({
                        id: `action::${svcSlug}::${aslug}`,
                        title: humanize(aname),
                        platform: svcName,
                        color: svcColor,
                        path: `/action/${encodeURIComponent(svcSlug)}-${encodeURIComponent(aslug)}`,
                        // preserve original definition name for creating areas
                        defName: aname,
                        serviceName: svcName,
                    } as unknown as CatalogItem);
                }
            }

            if (Array.isArray(svc.reactions)) {
                for (const r of svc.reactions) {
                    const rname = r?.name || r?.title || "reaction";
                    const rslug = slugify(rname) || "reaction";
                    reactions.push({
                        id: `reaction::${svcSlug}::${rslug}`,
                        title: humanize(rname),
                        platform: svcName,
                        color: svcColor,
                        path: `/reaction/${encodeURIComponent(svcSlug)}-${encodeURIComponent(rslug)}`,
                        // preserve original definition name for creating areas
                        defName: rname,
                        serviceName: svcName,
                    } as unknown as CatalogItem);
                }
            }
        }
    } catch (e) {
        console.error("fetchCatalogFromAbout failed:", e);
    }

    return { actions, services, reactions };
}
