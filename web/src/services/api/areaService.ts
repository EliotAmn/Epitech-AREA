import { apiClient } from "./apiClient";

export type CreateAreaPayload = {
    name: string;
    actions: Array<{
        action_name: string;
        service: string;
        params?: Record<string, unknown>;
    }>;
    reactions: Array<{
        reaction_name: string;
        service: string;
        params?: Record<string, unknown>;
    }>;
};

class AreaService {
    private readonly endpoint = "/areas";

    async createArea(payload: CreateAreaPayload) {
        return apiClient.post(this.endpoint, payload);
    }

    async getMyAreas() {
        return apiClient.get(this.endpoint);
    }

    async deleteArea(id: string) {
        return apiClient.delete(`${this.endpoint}/${encodeURIComponent(id)}`);
    }
}

export const areaService = new AreaService();
