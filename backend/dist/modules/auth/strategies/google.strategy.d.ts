import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-google-oauth20';
import type { StrategyOptions } from 'passport-google-oauth20';
interface GoogleProfile {
    id: string;
    emails?: {
        value: string;
    }[];
    displayName?: string;
    [key: string]: unknown;
}
declare const GoogleStrategy_base: new (options: StrategyOptions, verify?: any) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    validate(accessToken: string, refreshToken: string, profile: GoogleProfile): {
        provider: string;
        id: string;
        email: string | undefined;
        displayName: string | undefined;
        accessToken: string;
        refreshToken: string;
        raw: GoogleProfile;
    };
}
export {};
