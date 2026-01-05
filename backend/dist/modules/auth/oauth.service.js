"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OauthService = void 0;
const crypto = __importStar(require("crypto"));
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const user_service_1 = require("../user/user.service");
const oauth_link_repository_1 = require("./oauth-link.repository");
let OauthService = class OauthService {
    oauthLinkRepo;
    usersService;
    jwtService;
    prisma;
    GRANT_TTL_MS = 60_000;
    grants = new Map();
    constructor(oauthLinkRepo, usersService, jwtService, prisma) {
        this.oauthLinkRepo = oauthLinkRepo;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    isOauthProfile(obj) {
        return typeof obj === 'object' && obj !== null && 'id' in obj;
    }
    async findOrCreateUserFromProfile(provider, profile) {
        const providerUserId = String(profile.id);
        const email = profile.email;
        const displayName = profile.displayName ||
            (email
                ? email.split('@')[0]
                : `${provider}_${providerUserId.slice(0, 6)}`);
        const link = await this.oauthLinkRepo.findByProviderAndId(provider, providerUserId);
        if (link?.user)
            return link.user;
        if (email) {
            const existing = await this.usersService.findByEmail(email);
            if (existing) {
                await this.oauthLinkRepo.create({
                    provider_name: provider,
                    provider_user_id: providerUserId,
                    user_id: existing.id,
                });
                return existing;
            }
        }
        const created = await this.usersService.create({
            email: email || `${provider}_${providerUserId}@no-email.local`,
            name: displayName,
            auth_platform: provider,
        });
        await this.oauthLinkRepo.create({
            provider_name: provider,
            provider_user_id: providerUserId,
            user_id: created.id,
        });
        return created;
    }
    async handleProviderCallback(provider, profile) {
        if (!this.isOauthProfile(profile)) {
            throw new Error('Invalid OAuth profile received from provider');
        }
        const user = await this.findOrCreateUserFromProfile(provider, profile);
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });
        const safeUser = { ...user };
        delete safeUser.password_hash;
        try {
            const maybeAccess = profile.accessToken;
            const maybeRefresh = profile.refreshToken;
            const profileData = profile;
            const expiresIn = (profileData.expires_in || profileData.expiresIn);
            if (provider === 'google' && (maybeAccess || maybeRefresh)) {
                const existing = await this.prisma.userService.findFirst({
                    where: { user_id: user.id, service_name: 'gmail' },
                });
                const now = Date.now();
                const expiryDate = expiresIn
                    ? now + Number(expiresIn) * 1000
                    : undefined;
                const newConfig = {
                    ...(existing?.service_config ||
                        {}),
                    ...(maybeAccess ? { google_access_token: maybeAccess } : {}),
                    ...(maybeRefresh ? { google_refresh_token: maybeRefresh } : {}),
                    ...(expiryDate ? { google_token_expires_at: expiryDate } : {}),
                };
                if (existing) {
                    await this.prisma.userService.update({
                        where: { id: existing.id },
                        data: { service_config: newConfig },
                    });
                }
                else {
                    await this.prisma.userService.create({
                        data: {
                            user_id: user.id,
                            service_name: 'gmail',
                            service_config: newConfig,
                        },
                    });
                }
            }
        }
        catch (e) {
            console.error('Failed to persist google tokens to user_service:', e);
        }
        return { user: safeUser, access_token: token };
    }
    createGrant(accessToken) {
        const code = crypto.randomBytes(24).toString('hex');
        const expiresAt = Date.now() + this.GRANT_TTL_MS;
        const timeout = setTimeout(() => {
            this.grants.delete(code);
        }, this.GRANT_TTL_MS);
        this.grants.set(code, { token: accessToken, expiresAt, timeout });
        return code;
    }
    consumeGrant(code) {
        if (!code)
            return null;
        const entry = this.grants.get(code);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            clearTimeout(entry.timeout);
            this.grants.delete(code);
            return null;
        }
        clearTimeout(entry.timeout);
        this.grants.delete(code);
        return entry.token;
    }
};
exports.OauthService = OauthService;
exports.OauthService = OauthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oauth_link_repository_1.OauthLinkRepository,
        user_service_1.UserService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], OauthService);
//# sourceMappingURL=oauth.service.js.map