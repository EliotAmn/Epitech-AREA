import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
} from "@/types/api.types";
import { apiClient } from "./apiClient";

class AuthService {
    private readonly basePath = "/auth";

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            `${this.basePath}/login`,
            credentials
        );

        const token = response.access_token || response.token;

        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            console.error(
                "No token found in response. Response structure:",
                response
            );
            throw new Error(
                "Authentication failed: No token received from server"
            );
        }

        return response;
    }

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            `${this.basePath}/register`,
            userData
        );

        const token = response.access_token || response.token;

        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            console.error(
                "No token found in response. Response structure:",
                response
            );
            throw new Error(
                "Registration failed: No token received from server"
            );
        }

        return response;
    }

    static logout(): void {
        localStorage.removeItem("authToken");
    }

    static isAuthenticated(): boolean {
        const token = localStorage.getItem("authToken");
        return !!token;
    }

    static getToken(): string | null {
        return localStorage.getItem("authToken");
    }
}

export const authService = new AuthService();
export { AuthService };
