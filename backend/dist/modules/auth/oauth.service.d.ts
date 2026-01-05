import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { OauthLinkRepository } from './oauth-link.repository';
export declare class OauthService {
    private readonly oauthLinkRepo;
    private readonly usersService;
    private readonly jwtService;
    private readonly prisma;
    private readonly GRANT_TTL_MS;
    private readonly grants;
    constructor(oauthLinkRepo: OauthLinkRepository, usersService: UserService, jwtService: JwtService, prisma: PrismaService);
    private isOauthProfile;
    private findOrCreateUserFromProfile;
    handleProviderCallback(provider: string, profile: unknown): Promise<{
        user: Partial<{
            id: string;
            created_at: Date;
            name: string;
            email: string;
            auth_platform: string;
            auth_id: string | null;
            password_hash: string | null;
        } & Record<string, any>>;
        access_token: string;
    }>;
    createGrant(accessToken: string): string;
    consumeGrant(code: string): string | null;
}
