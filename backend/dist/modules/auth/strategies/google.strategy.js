"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoogleStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
let GoogleStrategy = GoogleStrategy_1 = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    configService;
    logger = new common_1.Logger(GoogleStrategy_1.name);
    constructor(configService) {
        const clientID = configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
        if (!clientID || !clientSecret) {
            throw new Error('Google OAuth not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
        }
        const appUrl = (configService.get('APP_URL') || '').replace(/\/$/, '');
        const callbackURL = `${appUrl}/auth/google/redirect`;
        const options = {
            clientID,
            clientSecret,
            callbackURL,
            scope: ['email', 'profile', 'https://www.googleapis.com/auth/gmail.send'],
        };
        super(options);
        this.configService = configService;
        this.logger.debug(`GoogleStrategy configured callbackURL=${callbackURL} clientID=${!!clientID}`);
    }
    validate(accessToken, refreshToken, profile) {
        try {
            this.logger.debug(`Google profile received id=${profile.id} email=${profile.emails?.[0]?.value}`);
        }
        catch (err) {
            const msg = err instanceof Error
                ? err.message
                : typeof err === 'string'
                    ? err
                    : String(err);
            this.logger.debug(msg || 'Google profile received (unable to stringify)');
        }
        return {
            provider: 'google',
            id: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName,
            accessToken,
            refreshToken,
            raw: profile,
        };
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = GoogleStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleStrategy);
//# sourceMappingURL=google.strategy.js.map