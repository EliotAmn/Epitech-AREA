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
exports.AreaService = void 0;
const common_1 = require("@nestjs/common");
const service_types_1 = require("../../common/service.types");
const service_importer_service_1 = require("../service_importer/service_importer.service");
const userservice_service_1 = require("../user_service/userservice.service");
const action_repository_1 = require("./action/action.repository");
const area_repository_1 = require("./area.repository");
const reaction_repository_1 = require("./reaction/reaction.repository");
const reaction_valider_1 = require("./reaction/reaction.valider");
let AreaService = class AreaService {
    action_repository;
    area_repository;
    reaction_repository;
    reaction_valider;
    service_importer_service;
    userservice_service;
    actionPollers = new Map();
    actionInstances = new Map();
    constructor(action_repository, area_repository, reaction_repository, reaction_valider, service_importer_service, userservice_service) {
        this.action_repository = action_repository;
        this.area_repository = area_repository;
        this.reaction_repository = reaction_repository;
        this.reaction_valider = reaction_valider;
        this.service_importer_service = service_importer_service;
        this.userservice_service = userservice_service;
    }
    async handle_action_trigger(action_id, action_out) {
        const a_usr = (await this.action_repository.findById(action_id));
        if (!a_usr) {
            throw new common_1.NotFoundException(`Unknown action with id ${action_id}`);
        }
        const area = (await this.area_repository.findById(a_usr.area_id));
        if (!area) {
            throw new common_1.NotFoundException(`Unknown area with id ${a_usr.area_id}`);
        }
        if (!action_out || !action_out.triggered)
            return;
        for (const r_user of area.reactions || []) {
            try {
                const defs = this.service_importer_service.getReactionByName(r_user.reaction_name);
                if (!defs) {
                    console.error(`Reaction definition not found: ${r_user.reaction_name}`);
                    continue;
                }
                const r_def = defs.reaction;
                const service_def = defs.service;
                const user_service = await this.userservice_service.fromUserIdAndServiceName(area.user_id, service_def.name);
                const user_params = r_user.params || {};
                const action_out_params = action_out.parameters || {};
                const reaction_in_params = {};
                r_def.input_params.forEach((p) => {
                    if (Object.prototype.hasOwnProperty.call(user_params, p.name)) {
                        reaction_in_params[p.name] = {
                            type: p.type || service_types_1.ParameterType.STRING,
                            value: user_params[p.name],
                        };
                        return;
                    }
                    if (Object.prototype.hasOwnProperty.call(action_out_params, p.name)) {
                        const outParam = action_out_params[p.name];
                        reaction_in_params[p.name] = {
                            type: outParam?.type || p.type || service_types_1.ParameterType.STRING,
                            value: outParam?.value,
                        };
                        return;
                    }
                    if (p.name === 'message') {
                        reaction_in_params[p.name] = {
                            type: p.type || service_types_1.ParameterType.STRING,
                            value: 'Detected keyword $(keyword_found) from $(author): $(message_content)',
                        };
                        return;
                    }
                    if (p.name === 'user_id') {
                        return;
                    }
                    if (p.name === 'channel_id') {
                        return;
                    }
                });
                Object.keys(reaction_in_params).forEach((key) => {
                    const current = reaction_in_params[key];
                    if (!current || typeof current.value !== 'string')
                        return;
                    const current_value = current.value;
                    const var_pattern = /\$\(([^)]+)\)/g;
                    const replaced = current_value.replace(var_pattern, (_match, var_name) => {
                        if (Object.prototype.hasOwnProperty.call(action_out_params, var_name)) {
                            const replacement = action_out_params[var_name]?.value;
                            return typeof replacement === 'string' ? replacement : _match;
                        }
                        return _match;
                    });
                    reaction_in_params[key].value = replaced;
                });
                console.log(`Preparing to execute reaction ${r_user.reaction_name} for area ${area.id} with params:`, Object.keys(reaction_in_params));
                const is_valid = this.reaction_valider.validate_reaction_params(r_def, reaction_in_params);
                if (!is_valid) {
                    console.log(`Skipping reaction ${r_user.reaction_name} for area ${area.id} because parameters are invalid or missing`);
                    continue;
                }
                const service_config = user_service?.service_config || {};
                const reaction_params = r_user.params || {};
                const sconf = {
                    config: { ...service_config, ...reaction_params },
                };
                console.log(`Executing reaction ${r_user.reaction_name} for area ${area.id}`);
                await r_def.execute(sconf, reaction_in_params);
            }
            catch (err) {
                console.error(`Error executing reaction ${r_user.reaction_name} for area ${area.id}:`, err);
            }
        }
    }
    stopAreaPollers(areaId) {
        for (const key of Array.from(this.actionPollers.keys())) {
            if (key.startsWith(`${areaId}:`)) {
                const timer = this.actionPollers.get(key);
                if (timer) {
                    clearInterval(timer);
                }
                this.actionPollers.delete(key);
                this.actionInstances.delete(key);
            }
        }
    }
    async initActionsForArea(area, userId) {
        for (const a of area.actions || []) {
            try {
                const def_action = this.service_importer_service.getActionByName(a.action_name);
                if (!def_action)
                    continue;
                const service_name = def_action.service.name;
                const user_service = await this.userservice_service.fromUserIdAndServiceName(userId, service_name);
                const service_config = user_service?.service_config || {};
                const action_params = a.params || {};
                const sconf = {
                    config: { ...service_config, ...action_params },
                };
                await def_action.action.reload_cache(sconf);
                try {
                    const pollKey = `${area.id}:${a.id}`;
                    this.actionInstances.set(pollKey, def_action.action);
                    if (this.actionPollers.has(pollKey)) {
                        clearInterval(this.actionPollers.get(pollKey));
                        this.actionPollers.delete(pollKey);
                    }
                    if (def_action.action.poll_interval <= 0)
                        continue;
                    const timer = setInterval(() => {
                        def_action.action
                            .poll(sconf)
                            .then(async (out) => {
                            if (out && out.triggered) {
                                await this.handle_action_trigger(a.id, out);
                            }
                        })
                            .catch((err) => {
                            console.error(`Error polling action ${a.action_name} for area ${area.id}:`, err);
                        });
                    }, def_action.action.poll_interval * 1000);
                    this.actionPollers.set(pollKey, timer);
                }
                catch (err) {
                    console.error('Failed to start poller for action:', err);
                }
            }
            catch (e) {
                console.error('Failed to initialize action cache for area during startup:', e);
            }
        }
    }
    async initReactionsForArea(area, userId) {
        for (const r of area.reactions || []) {
            try {
                const def_reaction = this.service_importer_service.getReactionByName(r.reaction_name);
                if (!def_reaction)
                    continue;
                const service_name = def_reaction.service.name;
                const user_service = await this.userservice_service.fromUserIdAndServiceName(userId, service_name);
                const service_config = user_service?.service_config || {};
                const reaction_params = r.params || {};
                const sconf = {
                    config: { ...service_config, ...reaction_params },
                };
                await def_reaction.reaction.reload_cache(sconf);
            }
            catch (e) {
                console.error('Failed to initialize reaction cache for area during startup:', e);
            }
        }
    }
    async create(userId, dto) {
        const actionsWithDefaults = dto.actions || [];
        const data = {
            data: {
                name: dto.name,
                user_id: userId,
                actions: {
                    create: actionsWithDefaults.map((a) => ({
                        action_name: a.action_name,
                        params: a.params,
                    })),
                },
                reactions: {
                    create: dto.reactions.map((r) => ({
                        reaction_name: r.reaction_name,
                        params: r.params,
                    })),
                },
            },
            include: { actions: true, reactions: true },
        };
        const created = await this.area_repository.create(data);
        try {
            await this.initializeOne(created.id);
        }
        catch (err) {
            console.error('Error during post-create area initialization:', err);
        }
        return created;
    }
    async findByUser(userId) {
        return this.area_repository.findByUserId(userId);
    }
    async initializeAll() {
        const areas = await this.area_repository.findAll();
        for (const area of areas) {
            const userId = area.user_id;
            await this.initActionsForArea(area, userId);
            await this.initReactionsForArea(area, userId);
        }
    }
    async initializeOne(areaId) {
        const area = await this.area_repository.findById(areaId);
        if (!area)
            throw new common_1.NotFoundException(`Area ${areaId} not found`);
        const userId = area.user_id;
        this.stopAreaPollers(areaId);
        await this.initActionsForArea(area, userId);
        await this.initReactionsForArea(area, userId);
    }
    async updateParams(areaId, dto) {
        if (dto.actions && dto.actions.length > 0) {
            for (const a of dto.actions) {
                const paramsJson = a.params;
                await this.action_repository.update(a.id, {
                    params: paramsJson,
                });
            }
        }
        if (dto.reactions && dto.reactions.length > 0) {
            for (const r of dto.reactions) {
                const paramsJson = r.params;
                await this.reaction_repository.update(r.id, {
                    params: paramsJson,
                });
            }
        }
        await this.initializeOne(areaId);
        return this.area_repository.findById(areaId);
    }
    async deleteArea(areaId, userId) {
        const area = await this.area_repository.findById(areaId);
        if (!area)
            throw new common_1.NotFoundException(`Area ${areaId} not found`);
        if (userId && area.user_id !== userId) {
            throw new common_1.NotFoundException(`Area ${areaId} not found`);
        }
        this.stopAreaPollers(areaId);
        await this.area_repository.delete(areaId);
        return { ok: true };
    }
};
exports.AreaService = AreaService;
exports.AreaService = AreaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [action_repository_1.ActionRepository,
        area_repository_1.AreaRepository,
        reaction_repository_1.ReactionRepository,
        reaction_valider_1.ReactionValider,
        service_importer_service_1.ServiceImporterService,
        userservice_service_1.UserServiceService])
], AreaService);
//# sourceMappingURL=area.service.js.map