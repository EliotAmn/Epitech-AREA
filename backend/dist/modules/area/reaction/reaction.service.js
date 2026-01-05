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
exports.ReactionService = void 0;
const common_1 = require("@nestjs/common");
const service_importer_service_1 = require("../../service_importer/service_importer.service");
const userservice_service_1 = require("../../user_service/userservice.service");
const area_repository_1 = require("../area.repository");
const reaction_repository_1 = require("./reaction.repository");
let ReactionService = class ReactionService {
    serviceImporterService;
    reactionRepository;
    userserviceService;
    areaRepository;
    constructor(serviceImporterService, reactionRepository, userserviceService, areaRepository) {
        this.serviceImporterService = serviceImporterService;
        this.reactionRepository = reactionRepository;
        this.userserviceService = userserviceService;
        this.areaRepository = areaRepository;
    }
    async reloadCache(reactionId) {
        const user_reaction = await this.reactionRepository.findById(reactionId);
        if (!user_reaction)
            throw new Error(`Reaction with id ${reactionId} not found`);
        const def_reaction = this.serviceImporterService.getReactionByName(user_reaction.reaction_name);
        if (!def_reaction)
            throw new Error(`Reaction definition with name ${user_reaction.reaction_name} not found`);
        const service_name = def_reaction.service.name;
        const user_id = user_reaction.area.user_id;
        const user_service = await this.userserviceService.fromUserIdAndServiceName(user_id, service_name);
        if (!user_service)
            throw new Error(`User service with name ${service_name} not found for user ${user_id}`);
        const service_config = user_service.service_config;
        const sconf = {
            config: service_config,
        };
        await def_reaction.reaction.reload_cache(sconf);
    }
};
exports.ReactionService = ReactionService;
exports.ReactionService = ReactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [service_importer_service_1.ServiceImporterService,
        reaction_repository_1.ReactionRepository,
        userservice_service_1.UserServiceService,
        area_repository_1.AreaRepository])
], ReactionService);
//# sourceMappingURL=reaction.service.js.map