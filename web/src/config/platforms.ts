export const platforms: Record<string, { color: string; icon?: string }> = {};

export const getPlatformColor = (name: string) => {
    const key = name?.toLowerCase();
    return platforms[key]?.color || "#808080";
};

export const getPlatformIcon = (name: string) => {
    const key = name?.toLowerCase();
    return platforms[key]?.icon;
};
