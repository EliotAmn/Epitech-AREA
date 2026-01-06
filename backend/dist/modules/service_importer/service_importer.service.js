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
exports.ServiceImporterService = void 0;
const common_1 = require("@nestjs/common");
const consts_1 = require("../../common/consts");
let ServiceImporterService = class ServiceImporterService {
    services;
    constructor(services) {
        this.services = services;
    }
    getAllServices() {
        return this.services.filter((service) => {
            if (service.mandatory_env_vars) {
                for (const env_var of service.mandatory_env_vars) {
                    if (!process.env[env_var]) {
                        return false;
                    }
                }
            }
            return true;
        });
    }
    getServiceByName(name) {
        return this.services.find((service) => service.name === name);
    }
    getActionByName(actionName) {
        const services = this.getAllServices();
        for (const service of services) {
            const action_c = service.actions.find((action) => new action().name === actionName);
            if (action_c) {
                return {
                    service: service,
                    action: new action_c(),
                };
            }
        }
        return undefined;
    }
    getReactionByName(reactionName) {
        const services = this.getAllServices();
        for (const service of services) {
            const reaction_c = service.reactions.find((reaction) => new reaction().name === reactionName);
            if (reaction_c) {
                return {
                    service: service,
                    reaction: new reaction_c(),
                };
            }
        }
        return undefined;
    }
};
exports.ServiceImporterService = ServiceImporterService;
exports.ServiceImporterService = ServiceImporterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(consts_1.SERVICE_DEFINITION)),
    __metadata("design:paramtypes", [Array])
], ServiceImporterService);
//# sourceMappingURL=service_importer.service.js.map