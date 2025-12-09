import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
} from "@/types/api.types";
import { isValidJWT } from "@/utils/jwt";
import { apiClient } from "./apiClient";

class AuthService {
    private readonly basePath = "/auth";

    private static dispatchAuthChange(): void {
        window.dispatchEvent(new Event("authStateChanged"));
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            `${this.basePath}/login`,
            credentials
        );

        const token = response.access_token || response.token;

        if (token) {
            localStorage.setItem("authToken", token);
            AuthService.dispatchAuthChange();
        } else {
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
            AuthService.dispatchAuthChange();
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
        AuthService.dispatchAuthChange();
    }

    static isAuthenticated(): boolean {
        const token = localStorage.getItem("authToken");
        if (!token) return false;

        const isValid = isValidJWT(token);

        if (!isValid) {
            localStorage.removeItem("authToken");
            return false;
        }

        return true;
    }

    static getToken(): string | null {
        return localStorage.getItem("authToken");
    }
}

export const authService = new AuthService();
export { AuthService };
