import DiscordIcon from "../assets/discord_icon.webp";
import GmailIcon from "../assets/gmail_icon.webp";
import GoogleIcon from "../assets/logo_google.svg";
import SpotifyIcon from "../assets/spotify_icon.webp";

export const platforms: Record<string, { color: string; icon?: string }> = {
    discord: {
        color: "#7289DA",
        icon: DiscordIcon,
    },
    gmail: {
        color: "#AAAAAB",
        icon: GmailIcon,
    },
    google: {
        color: "#4285F4",
        icon: GoogleIcon,
    },
    github: {
        color: "#181717",
    },
    spotify: {
        color: "#1DB954",
        icon: SpotifyIcon,
    },
    twitch: {
        color: "#9146FF",
    },
};

export const getPlatformColor = (name: string) => {
    const key = name?.toLowerCase();
    return platforms[key]?.color || "#808080";
};

export const getPlatformIcon = (name: string) => {
    const key = name?.toLowerCase();
    return platforms[key]?.icon;
};
