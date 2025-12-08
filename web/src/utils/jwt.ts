export interface JWTPayload {
    sub?: string;
    id?: string;
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

export function decodeJWT(token: string): JWTPayload | null {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(
                    (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}

export function isJWTExpired(token: string): boolean | null {
    const payload = decodeJWT(token);
    if (!payload) return null;

    if (!payload.exp) return false;

    return payload.exp * 1000 < Date.now();
}

export function getUserIdFromToken(token: string): string | null {
    const payload = decodeJWT(token);
    if (!payload) return null;

    return payload.sub || payload.id || null;
}

export function getCurrentUserId(): string | null {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    return getUserIdFromToken(token);
}

export function isValidJWT(token: string): boolean {
    if (!token) return false;

    const payload = decodeJWT(token);
    if (!payload) return false;

    const expired = isJWTExpired(token);
    return expired === false;
}
