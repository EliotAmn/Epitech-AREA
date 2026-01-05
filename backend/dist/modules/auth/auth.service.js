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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const password_service_1 = require("../common/password/password.service");
const user_service_1 = require("../user/user.service");
let AuthService = class AuthService {
    passwordService;
    usersService;
    jwtService;
    constructor(passwordService, usersService, jwtService) {
        this.passwordService = passwordService;
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async login(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.auth_platform != 'local')
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.password_hash)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await this.passwordService.compare(password, user.password_hash);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = { sub: user.id, email: user.email };
        return { access_token: this.jwtService.sign(payload) };
    }
    async register(dto) {
        if (!dto.password)
            throw new common_1.BadRequestException('Password required');
        let createdUser = null;
        try {
            createdUser = await this.usersService.create(dto);
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e?.message || 'Failed to create user');
        }
        const safeUser = {
            ...createdUser,
        };
        delete safeUser.password_hash;
        try {
            const token = this.jwtService.sign({
                sub: createdUser.id,
                email: createdUser.email,
            });
            return { user: safeUser, access_token: token };
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e?.message || 'Failed to create access token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [password_service_1.PasswordService,
        user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map