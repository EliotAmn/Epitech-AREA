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
exports.AreaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const area_service_1 = require("./area.service");
const create_area_dto_1 = require("./dto/create-area.dto");
let AreaController = class AreaController {
    areaService;
    constructor(areaService) {
        this.areaService = areaService;
    }
    async create(req, dto) {
        const userId = req.user?.sub;
        return this.areaService.create(userId, dto);
    }
    async findMyAreas(req) {
        const userId = req.user?.sub;
        return this.areaService.findByUser(userId);
    }
    async reloadArea(id) {
        await this.areaService.initializeOne(id);
        return { ok: true };
    }
    async deleteArea(req, id) {
        const userId = req.user?.sub;
        await this.areaService.deleteArea(id, userId);
        return { ok: true };
    }
    async updateParams(id, dto) {
        return this.areaService.updateParams(id, dto);
    }
};
exports.AreaController = AreaController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create an area for the authenticated user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Area created' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_area_dto_1.CreateAreaDto]),
    __metadata("design:returntype", Promise)
], AreaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AreaController.prototype, "findMyAreas", null);
__decorate([
    (0, common_1.Post)(':id/reload'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AreaController.prototype, "reloadArea", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AreaController.prototype, "deleteArea", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AreaController.prototype, "updateParams", null);
exports.AreaController = AreaController = __decorate([
    (0, swagger_1.ApiTags)('areas'),
    (0, common_1.Controller)('areas'),
    __metadata("design:paramtypes", [area_service_1.AreaService])
], AreaController);
//# sourceMappingURL=area.controller.js.map