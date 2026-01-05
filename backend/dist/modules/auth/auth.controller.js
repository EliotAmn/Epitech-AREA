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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const create_user_dto_1 = require("../user/dto/create-user.dto");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const oauth_service_1 = require("./oauth.service");
let AuthController = class AuthController {
    authService;
    oauthService;
    configService;
    constructor(authService, oauthService, configService) {
        this.authService = authService;
        this.oauthService = oauthService;
        this.configService = configService;
    }
    buildRedirectHtmlWithGrant(userPayload, grantCode, origin) {
        const safeOriginForRedirect = origin === '*' ? '/' : origin;
        return `<!doctype html>
<html>
  <head><meta charset="utf-8"/></head>
  <body>
    <script>
      (function(){
        try {
          const payload = ${JSON.stringify(userPayload || {})};
          const grant = ${JSON.stringify(grantCode)};
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage({ user: payload, grant_code: grant }, ${JSON.stringify(origin)});
            } catch(e) { console.error('postMessage failed', e); }
            setTimeout(() => window.close(), 100);
            return;
          }
          // same-tab: redirect to frontend with grant code in hash (no token in URL)
          const redirectTo = ${JSON.stringify(safeOriginForRedirect)} + '#oauth_code=' + encodeURIComponent(grant);
          window.location.replace(redirectTo);
        } catch(e) {
          console.error('OAuth redirect handling failed', e);
          document.body.innerText = 'Authentication completed. You can close this window and return to the app.';
        }
      })();
    </script>
  </body>
</html>`;
    }
    googleAuth() { }
    async googleRedirect(req) {
        return this.handleProviderRedirect('google', req);
    }
    githubAuth() { }
    async githubRedirect(req) {
        return this.handleProviderRedirect('github', req);
    }
    consumeGrant(code) {
        if (!code)
            throw new common_1.BadRequestException('code required');
        const token = this.oauthService.consumeGrant(code);
        if (!token)
            throw new common_1.BadRequestException('Invalid or expired code');
        return { access_token: token };
    }
    authorize(provider) {
        const allowed = ['google', 'github'];
        if (!allowed.includes(provider)) {
            throw new common_1.BadRequestException('Unsupported provider');
        }
        const appUrl = this.configService.get('APP_URL') || '';
        const url = `${appUrl.replace(/\/$/, '')}/auth/${provider}`;
        return { url };
    }
    login(loginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }
    register(dto) {
        return this.authService.register(dto);
    }
    async handleProviderRedirect(provider, req) {
        const profile = req.user;
        if (!profile)
            throw new common_1.BadRequestException('Invalid provider response');
        const result = await this.oauthService.handleProviderCallback(provider, profile);
        const frontend = this.configService.get('FRONTEND_URL') ||
            this.configService.get('APP_URL') ||
            '*';
        const origin = frontend === '*' ? '*' : frontend.replace(/\/$/, '');
        const grant = this.oauthService.createGrant(result.access_token);
        const rawUser = result.user;
        const candidate = rawUser
            ? rawUser['auth_platform']
            : undefined;
        const auth_platform = (0, create_user_dto_1.isAuthPlatform)(candidate) ? candidate : undefined;
        const userDto = {
            ...rawUser,
            auth_platform,
        };
        return this.buildRedirectHtmlWithGrant(userDto, grant, origin);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    (0, swagger_1.ApiOperation)({ summary: 'Start Google OAuth flow' }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirects to Google consent page' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/redirect'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    (0, swagger_1.ApiOperation)({ summary: 'Google OAuth callback' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns an HTML page that posts grant_code to the frontend',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleRedirect", null);
__decorate([
    (0, common_1.Get)('github'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('github')),
    (0, swagger_1.ApiOperation)({ summary: 'Start GitHub OAuth flow' }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirects to GitHub consent page' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "githubAuth", null);
__decorate([
    (0, common_1.Get)('github/redirect'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('github')),
    (0, swagger_1.ApiOperation)({ summary: 'GitHub OAuth callback' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns an HTML page that posts grant_code to the frontend',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "githubRedirect", null);
__decorate([
    (0, common_1.Get)('oauth/consume'),
    (0, swagger_1.ApiOperation)({
        summary: 'Consume an OAuth grant code to receive an access token',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'code',
        required: true,
        description: 'Grant code returned by the provider redirect',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns access_token when code is valid',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing or invalid code' }),
    __param(0, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "consumeGrant", null);
__decorate([
    (0, common_1.Post)('oauth/:provider/authorize'),
    (0, swagger_1.ApiOperation)({ summary: 'Get provider authorize URL for frontend' }),
    (0, swagger_1.ApiParam)({ name: 'provider', description: 'Provider name (google|github)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns a URL to start OAuth flow',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Unsupported provider' }),
    __param(0, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "authorize", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns JWT access token' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User created and may return token or user info',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        oauth_service_1.OauthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map