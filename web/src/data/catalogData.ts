export interface CatalogItem {
    id: string;
    title: string;
    label: string;
    platform: string;
    description?: string;
    reactionPlatform?: string;
    color?: string;
    path?: string;
    oauth_url?: string;
    serviceName?: string;
    defName?: string;
    enabled?: boolean;
}
