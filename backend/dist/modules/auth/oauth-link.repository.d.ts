import { OauthLink, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class OauthLinkRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        provider_name: string;
        provider_user_id: string;
        user_id: string;
    }): Promise<OauthLink>;
    findByProviderAndId(provider_name: string, provider_user_id: string): Promise<(OauthLink & {
        user: User;
    }) | null>;
    findAllByUser(user_id: string): Promise<OauthLink[]>;
}
