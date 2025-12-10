import { apiClient } from "./apiClient";

export type AboutInfo = {
    name?: string;
    version?: string;
    description?: string;
    [k: string]: unknown;
};

class AboutService {
    private readonly endpoint = "/about.json";

    async getAbout(): Promise<AboutInfo> {
        return apiClient.get<AboutInfo>(this.endpoint);
    }
}

export const aboutService = new AboutService();
