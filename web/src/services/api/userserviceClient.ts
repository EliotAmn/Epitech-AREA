import { apiClient } from "./apiClient";

export async function getUserServiceStatus(
    serviceName: string
): Promise<{ connected: boolean }> {
    return apiClient.get<{ connected: boolean }>(
        `/services/${encodeURIComponent(serviceName)}/status`
    );
}

export async function disconnectUserService(
    serviceName: string
): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(
        `/services/${encodeURIComponent(serviceName)}`
    );
}
