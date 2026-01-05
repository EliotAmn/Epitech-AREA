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
exports.AboutController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const about_service_1 = require("./about.service");
let AboutController = class AboutController {
    aboutService;
    constructor(aboutService) {
        this.aboutService = aboutService;
    }
    getAbout(clientIp) {
        return this.aboutService.getAboutInfo(clientIp);
    }
};
exports.AboutController = AboutController;
__decorate([
    (0, common_1.Get)('about.json'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service information and client details' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns client IP, server time, and available services',
    }),
    __param(0, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], AboutController.prototype, "getAbout", null);
exports.AboutController = AboutController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [about_service_1.AboutService])
], AboutController);
//# sourceMappingURL=about.controller.js.map