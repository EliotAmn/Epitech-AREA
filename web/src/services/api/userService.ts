import type { ChangePasswordDto, UpdateUserDto, User } from "@/types/api.types";
import { apiClient } from "./apiClient";

class UserService {
    private readonly basePath = "/users";

    static getCurrentUserId(): string | null {
        const token = localStorage.getItem("authToken");
        if (!token) return null;

        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(
                        (c) =>
                            "%" +
                            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join("")
            );
            const payload = JSON.parse(jsonPayload);
            return payload.sub || payload.id || null;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    }

    async getUser(userId: string): Promise<User> {
        return apiClient.get<User>(`${this.basePath}/${userId}`);
    }

    async getCurrentUser(): Promise<User> {
        const userId = UserService.getCurrentUserId();
        if (!userId) {
            throw new Error("No user ID found in token");
        }
        return this.getUser(userId);
    }

    async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
        return apiClient.patch<User>(`${this.basePath}/${userId}`, data);
    }

    async updateCurrentUser(data: UpdateUserDto): Promise<User> {
        const userId = UserService.getCurrentUserId();
        if (!userId) {
            throw new Error("No user ID found in token");
        }
        return this.updateUser(userId, data);
    }

    async changePassword(data: ChangePasswordDto): Promise<void> {
        const userId = UserService.getCurrentUserId();
        if (!userId) {
            throw new Error("No user ID found in token");
        }

        await apiClient.patch(`${this.basePath}/${userId}/password`, {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
    }
}

export const userService = new UserService();
