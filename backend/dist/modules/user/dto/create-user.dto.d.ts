export declare class CreateUserDto {
    email: string;
    name: string;
    password?: string;
    auth_platform?: AuthPlatform;
}
export type AuthPlatform = 'local' | 'google' | 'github';
export declare const AUTH_PLATFORMS: readonly ["local", "google", "github"];
export declare function isAuthPlatform(v: unknown): v is AuthPlatform;
