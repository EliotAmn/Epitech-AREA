import { apiClient } from "./apiClient";

export type UserServiceStatus = {
    connected: boolean;
    config?: Record<string, unknown>;
};

export async function getUserServiceStatus(
    serviceName: string
): Promise<UserServiceStatus> {
    return apiClient.get<UserServiceStatus>(
        `/services/${encodeURIComponent(serviceName)}/status`
    );
}

export default { getUserServiceStatus };

export async function disconnectUserService(
    serviceName: string
): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(
        `/services/${encodeURIComponent(serviceName)}`
    );
}
