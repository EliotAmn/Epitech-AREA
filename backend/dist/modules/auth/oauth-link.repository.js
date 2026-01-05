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
exports.OauthLinkRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OauthLinkRepository = class OauthLinkRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.oauthLink.create({ data });
    }
    findByProviderAndId(provider_name, provider_user_id) {
        return this.prisma.oauthLink.findUnique({
            where: {
                provider_name_provider_user_id: { provider_name, provider_user_id },
            },
            include: { user: true },
        });
    }
    findAllByUser(user_id) {
        return this.prisma.oauthLink.findMany({ where: { user_id } });
    }
};
exports.OauthLinkRepository = OauthLinkRepository;
exports.OauthLinkRepository = OauthLinkRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OauthLinkRepository);
//# sourceMappingURL=oauth-link.repository.js.map