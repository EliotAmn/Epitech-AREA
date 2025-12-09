import type { ChangePasswordDto, UpdateUserDto, User } from "@/types/api.types";
import { getCurrentUserId } from "@/utils/jwt";
import { apiClient } from "./apiClient";

class UserService {
    private readonly basePath = "/users";

    static getCurrentUserId(): string | null {
        return getCurrentUserId();
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
