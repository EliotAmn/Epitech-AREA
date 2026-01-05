"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaModule = void 0;
const common_1 = require("@nestjs/common");
const service_importer_module_1 = require("../service_importer/service_importer.module");
const userservice_module_1 = require("../user_service/userservice.module");
const action_repository_1 = require("./action/action.repository");
const action_service_1 = require("./action/action.service");
const area_controller_1 = require("./area.controller");
const area_repository_1 = require("./area.repository");
const area_service_1 = require("./area.service");
const reaction_repository_1 = require("./reaction/reaction.repository");
const reaction_service_1 = require("./reaction/reaction.service");
const reaction_valider_1 = require("./reaction/reaction.valider");
let AreaModule = class AreaModule {
};
exports.AreaModule = AreaModule;
exports.AreaModule = AreaModule = __decorate([
    (0, common_1.Module)({
        imports: [service_importer_module_1.ServiceImporterModule.register(), userservice_module_1.UserServiceModule],
        controllers: [area_controller_1.AreaController],
        providers: [
            area_repository_1.AreaRepository,
            action_repository_1.ActionRepository,
            action_service_1.ActionService,
            reaction_service_1.ReactionService,
            reaction_repository_1.ReactionRepository,
            reaction_valider_1.ReactionValider,
            area_service_1.AreaService,
        ],
        exports: [area_service_1.AreaService],
    })
], AreaModule);
//# sourceMappingURL=area.module.js.map