import { AuthService } from "./api/authService";

/**
 * Handles OAuth flow for services by injecting JWT token into the state parameter
 * @param oauthUrl The OAuth URL from the service definition
 * @returns The modified OAuth URL with JWT injected into state parameter
 */
export function injectJwtIntoOAuthUrl(oauthUrl: string): string {
    const token = AuthService.getToken();
    if (!token) {
        throw new Error("No authentication token found. Please log in first.");
    }

    try {
        const url = new URL(oauthUrl);

        // Get existing state parameter if any
        const existingState = url.searchParams.get("state");

        // Create state object with JWT token
        const stateData = {
            jwt_auth: token,
            ...(existingState ? { original_state: existingState } : {})
        };

        // Encode state as base64
        const stateString = btoa(JSON.stringify(stateData));

        // Set the state parameter
        url.searchParams.set("state", stateString);

        return url.toString();
    } catch (error) {
        console.error("Failed to inject JWT into OAuth URL:", error);
        throw new Error("Invalid OAuth URL format");
    }
}

/**
 * Initiates OAuth flow by redirecting to the service's OAuth URL
 * @param oauthUrl The OAuth URL from the service definition
 */
export function initiateServiceOAuth(oauthUrl: string): void {
    window.location.href = injectJwtIntoOAuthUrl(oauthUrl);
}

