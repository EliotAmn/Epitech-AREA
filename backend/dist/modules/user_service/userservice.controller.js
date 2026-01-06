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
exports.UserServiceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const service_importer_service_1 = require("../service_importer/service_importer.service");
const userservice_service_1 = require("./userservice.service");
let UserServiceController = class UserServiceController {
    service;
    serviceImporterService;
    constructor(service, serviceImporterService) {
        this.service = service;
        this.serviceImporterService = serviceImporterService;
    }
    async getServiceRedirectUrl(req, serviceName, query) {
        const userId = req.user?.sub;
        const userservice_instance = await this.service.createOrFind(userId, serviceName);
        const service_def = this.serviceImporterService.getServiceByName(serviceName);
        if (!userservice_instance || !service_def)
            throw new common_1.NotFoundException('Service not found');
        if (!service_def.oauth_callback)
            throw new common_1.NotFoundException('Service does not support OAuth');
        const queryObj = {};
        for (const [key, value] of Object.entries(query)) {
            if (typeof value === 'string') {
                queryObj[key] = value;
            }
        }
        await service_def.oauth_callback(userservice_instance, queryObj);
        await this.service.updateConfig(userservice_instance.id, userservice_instance.service_config);
        return { success: true };
    }
};
exports.UserServiceController = UserServiceController;
__decorate([
    (0, common_1.Get)('/:service_name/redirect'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('service_name')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UserServiceController.prototype, "getServiceRedirectUrl", null);
exports.UserServiceController = UserServiceController = __decorate([
    (0, swagger_1.ApiTags)('services'),
    (0, common_1.Controller)('services'),
    __metadata("design:paramtypes", [userservice_service_1.UserServiceService,
        service_importer_service_1.ServiceImporterService])
], UserServiceController);
//# sourceMappingURL=userservice.controller.js.map