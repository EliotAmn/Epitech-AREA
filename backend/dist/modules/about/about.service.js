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
var AboutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutService = void 0;
const common_1 = require("@nestjs/common");
const service_importer_service_1 = require("../service_importer/service_importer.service");
let AboutService = AboutService_1 = class AboutService {
    serviceImporterService;
    logger = new common_1.Logger(AboutService_1.name);
    constructor(serviceImporterService) {
        this.serviceImporterService = serviceImporterService;
    }
    getAboutInfo(clientIp) {
        const currentTime = this.getCurrentTimestamp();
        const services = this.formatServices();
        return {
            client: {
                host: clientIp || 'unknown',
            },
            server: {
                current_time: currentTime,
                services,
            },
        };
    }
    getCurrentTimestamp() {
        return Math.floor(Date.now() / 1000);
    }
    formatServices() {
        const services = this.serviceImporterService.getAllServices();
        return services.map((serviceClassOrInstance) => {
            try {
                const service = typeof serviceClassOrInstance === 'function'
                    ? new serviceClassOrInstance()
                    : serviceClassOrInstance;
                const actions = this.formatActions(service.actions || []);
                const reactions = this.formatReactions(service.reactions || []);
                return {
                    name: service.name,
                    actions,
                    reactions,
                };
            }
            catch (error) {
                this.logger.error(`Failed to format service:`, error);
                return {
                    name: 'unknown',
                    actions: [],
                    reactions: [],
                };
            }
        });
    }
    formatActions(actionClasses) {
        return actionClasses.map((ActionClass) => {
            try {
                const actionInstance = new ActionClass();
                return {
                    name: actionInstance.name || 'unknown_action',
                    description: actionInstance.description || 'No description available',
                    output_params: actionInstance.output_params || [],
                    input_params: actionInstance.input_params || [],
                };
            }
            catch (error) {
                this.logger.error(`Failed to instantiate action:`, error);
                return {
                    name: 'unknown_action',
                    description: 'Failed to load action',
                };
            }
        });
    }
    formatReactions(reactionClasses) {
        return reactionClasses.map((ReactionClass) => {
            try {
                const reactionInstance = new ReactionClass();
                return {
                    name: reactionInstance.name || 'unknown_reaction',
                    description: reactionInstance.description || 'No description available',
                    input_params: reactionInstance.input_params || [],
                };
            }
            catch (error) {
                this.logger.error(`Failed to instantiate reaction:`, error);
                return {
                    name: 'unknown_reaction',
                    description: 'Failed to load reaction',
                };
            }
        });
    }
};
exports.AboutService = AboutService;
exports.AboutService = AboutService = AboutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [service_importer_service_1.ServiceImporterService])
], AboutService);
//# sourceMappingURL=about.service.js.map