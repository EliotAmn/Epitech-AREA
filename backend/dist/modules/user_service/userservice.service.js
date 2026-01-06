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
exports.UserServiceService = void 0;
const common_1 = require("@nestjs/common");
const userservice_repository_1 = require("./userservice.repository");
let UserServiceService = class UserServiceService {
    userServiceRepository;
    constructor(userServiceRepository) {
        this.userServiceRepository = userServiceRepository;
    }
    fromUserIdAndServiceName(userId, serviceName) {
        return this.userServiceRepository.fromUserIdAndServiceName(userId, serviceName);
    }
    createOrFind(userId, serviceName) {
        return this.userServiceRepository
            .fromUserIdAndServiceName(userId, serviceName)
            .then((existing) => {
            if (existing) {
                return existing;
            }
            return this.userServiceRepository.create(userId, serviceName);
        });
    }
    setConfigProperty(userService, key, value) {
        const config = userService.service_config || {};
        config[key] = value;
        return this.userServiceRepository.update({
            where: { id: userService.id },
            data: { service_config: config },
        });
    }
    updateConfig(id, config) {
        return this.userServiceRepository.update({
            where: { id },
            data: { service_config: config },
        });
    }
};
exports.UserServiceService = UserServiceService;
exports.UserServiceService = UserServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [userservice_repository_1.UserServiceRepository])
], UserServiceService);
//# sourceMappingURL=userservice.service.js.map