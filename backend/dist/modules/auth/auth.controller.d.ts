import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { OauthService } from './oauth.service';
export declare class AuthController {
    private readonly authService;
    private readonly oauthService;
    private readonly configService;
    constructor(authService: AuthService, oauthService: OauthService, configService: ConfigService);
    private buildRedirectHtmlWithGrant;
    googleAuth(): void;
    googleRedirect(req: {
        user?: unknown;
    }): Promise<string>;
    githubAuth(): void;
    githubRedirect(req: {
        user?: unknown;
    }): Promise<string>;
    consumeGrant(code: string): {
        access_token: string;
    };
    authorize(provider: string): {
        url: string;
    };
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    register(dto: CreateUserDto): Promise<{
        user: Record<string, unknown>;
        access_token: string;
    }>;
    private handleProviderRedirect;
}
