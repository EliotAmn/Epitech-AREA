if (!import.meta.env.VITE_API_URL) {
    throw new Error("VITE_API_URL environment variable is not set");
}

export const env = {
    apiUrl: import.meta.env.VITE_API_URL,
} as const;
