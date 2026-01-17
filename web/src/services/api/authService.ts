import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
} from "@/types/api.types";
import { isCurrentUserAdmin, isValidJWT } from "@/utils/jwt";
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

    static isAdmin(): boolean {
        return isCurrentUserAdmin();
    }

    static getToken(): string | null {
        return localStorage.getItem("authToken");
    }

    async oauthSignIn(provider: string): Promise<void> {
        const resp = await apiClient.post<{ url: string }>(
            `${this.basePath}/oauth/${provider}/authorize`
        );

        const url = resp.url;
        if (!url) throw new Error("No authorize URL returned from server");

        let popup: Window | null = null;

        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        popup = window.open(
            url,
            `oauth_${provider}`,
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) throw new Error("Failed to open popup window");

        return new Promise<void>((resolve, reject) => {
            let settled = false;

            const cleanup = () => {
                window.removeEventListener("message", onMessage);
                try {
                    if (popup && !popup.closed) popup.close();
                } catch {
                    // ignore
                }
            };

            const onMessage = async (event: MessageEvent) => {
                if (event.source !== popup) return;

                const data = event.data as { grant_code?: string } | undefined;
                if (!data || !data.grant_code) return;

                try {
                    const tokenResp = await apiClient.get<{
                        access_token?: string;
                        token?: string;
                    }>(`${this.basePath}/oauth/consume`, {
                        code: data.grant_code,
                    });

                    const token = tokenResp.access_token || tokenResp.token;
                    if (!token)
                        throw new Error("No token returned from grant consume");

                    localStorage.setItem("authToken", token);
                    AuthService.dispatchAuthChange();

                    settled = true;
                    cleanup();
                    resolve();
                } catch (err) {
                    settled = true;
                    cleanup();
                    reject(err);
                }
            };

            window.addEventListener("message", onMessage);

            const poll = setInterval(() => {
                if (!popup || popup.closed) {
                    clearInterval(poll);
                    if (!settled) {
                        cleanup();
                        reject(new Error("OAuth popup closed by user"));
                    }
                }
            }, 500);
        });
    }
}

export const authService = new AuthService();
export { AuthService };
