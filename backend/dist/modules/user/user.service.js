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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const password_service_1 = require("../common/password/password.service");
const user_repository_1 = require("./user.repository");
let UserService = class UserService {
    repository;
    passwordService;
    constructor(repository, passwordService) {
        this.repository = repository;
        this.passwordService = passwordService;
    }
    async create(dto) {
        let passwordHash;
        if (dto.password) {
            passwordHash = await this.passwordService.hash(dto.password);
        }
        return this.repository.create({
            email: dto.email,
            name: dto.name,
            password_hash: passwordHash,
            auth_platform: dto.auth_platform,
        });
    }
    findAll() {
        return this.repository.findAll();
    }
    async findOne(id) {
        const user = await this.repository.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findByEmail(email) {
        const user = await this.repository.findByEmail(email);
        if (!user)
            return null;
        return user;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.repository.update(id, dto);
    }
    async remove(id) {
        await this.findOne(id);
        return this.repository.delete(id);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        password_service_1.PasswordService])
], UserService);
//# sourceMappingURL=user.service.js.map