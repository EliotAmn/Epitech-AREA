import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  ActionTriggerOutput,
  ParameterType,
  ParameterValue,
  ServiceActionDefinition,
  ServiceDefinition,
  ServiceReactionDefinition,
} from '@/common/service.types';
import { ServiceImporterService } from '@/modules/service_importer/service_importer.service';
import { TokenRefreshService } from '@/modules/user_service/token-refresh.service';
import { OAuthError } from '@/modules/user_service/token-refresh.errors';
import { UserServiceService } from '@/modules/user_service/userservice.service';
import { UserServiceRepository } from '@/modules/user_service/userservice.repository';
import { ActionRepository } from './action/action.repository';
import { AreaRepository } from './area.repository';
import { ReactionRepository } from './reaction/reaction.repository';
import { ReactionValider } from './reaction/reaction.valider';

@Injectable()
export class AreaService {
  private readonly logger = new Logger(AreaService.name);
  private actionPollers: Map<string, ReturnType<typeof setInterval>> =
    new Map();
  private actionInstances: Map<string, ServiceActionDefinition> = new Map();

  constructor(
    private readonly action_repository: ActionRepository,
    private readonly area_repository: AreaRepository,
    private readonly reaction_repository: ReactionRepository,
    private readonly reaction_valider: ReactionValider,
    private readonly service_importer_service: ServiceImporterService,
    private readonly userservice_service: UserServiceService,
    private readonly tokenRefreshService: TokenRefreshService,
    private readonly userServiceRepository: UserServiceRepository,
  ) {}

  async handle_action_trigger(
    action_id: string,
    action_out: ActionTriggerOutput,
  ): Promise<void> {
    const a_usr = (await this.action_repository.findById(action_id)) as {
      area_id: string;
    } | null;

    if (!a_usr) {
      throw new NotFoundException(`Unknown action with id ${action_id}`);
    }

    const area = (await this.area_repository.findById(a_usr.area_id)) as {
      id: string;
      user_id: string;
      reactions?: Array<{
        reaction_name: string;
        params?: Record<string, unknown>;
      }>;
    } | null;

    if (!area) {
      throw new NotFoundException(`Unknown area with id ${a_usr.area_id}`);
    }

    if (!action_out || !action_out.triggered) return;

    for (const r_user of area.reactions || []) {
      try {
        const defs = this.service_importer_service.getReactionByName(
          r_user.reaction_name,
        ) as
          | { service: ServiceDefinition; reaction: ServiceReactionDefinition }
          | undefined;
        if (!defs) {
          this.logger.error(
            `Reaction definition not found: ${r_user.reaction_name}`,
          );
          continue;
        }
        const r_def = defs.reaction;
        const service_def = defs.service;

        const user_service =
          await this.userservice_service.fromUserIdAndServiceName(
            area.user_id,
            service_def.name,
          );

        const user_params = (r_user.params as Record<string, unknown>) || {};
        const action_out_params: Record<string, ParameterValue> =
          action_out.parameters || {};
        const reaction_in_params: Record<string, ParameterValue> = {};

        r_def.input_params.forEach((p) => {
          if (Object.prototype.hasOwnProperty.call(user_params, p.name)) {
            reaction_in_params[p.name] = {
              type: p.type || ParameterType.STRING,
              value: user_params[p.name],
            } as ParameterValue;
            return;
          }

          if (Object.prototype.hasOwnProperty.call(action_out_params, p.name)) {
            const outParam = action_out_params[p.name];
            reaction_in_params[p.name] = {
              type: outParam?.type || p.type || ParameterType.STRING,
              value: outParam?.value,
            } as ParameterValue;
            return;
          }

          if (p.name === 'message') {
            reaction_in_params[p.name] = {
              type: p.type || ParameterType.STRING,
              value:
                'Detected keyword $(keyword_found) from $(author): $(message_content)',
            } as ParameterValue;
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
          if (!current || typeof current.value !== 'string') return;
          const current_value = current.value;
          const var_pattern = /\$\(([^)]+)\)/g;
          const replaced = current_value.replace(
            var_pattern,
            (_match: string, var_name: string): string => {
              if (
                Object.prototype.hasOwnProperty.call(
                  action_out_params,
                  var_name,
                )
              ) {
                const replacement = action_out_params[var_name]?.value;
                return typeof replacement === 'string' ? replacement : _match;
              }
              return _match;
            },
          );
          reaction_in_params[key].value = replaced;
        });

        this.logger.log(
          `Preparing to execute reaction ${r_user.reaction_name} for area ${area.id} with params:`,
          Object.keys(reaction_in_params),
        );

        const is_valid = this.reaction_valider.validate_reaction_params(
          r_def,
          reaction_in_params,
        );

        if (!is_valid) {
          this.logger.log(
            `Skipping reaction ${r_user.reaction_name} for area ${area.id} because parameters are invalid or missing`,
          );
          continue;
        }

        const service_config =
          (user_service?.service_config as Prisma.JsonObject) || {};
        const reaction_params = (r_user.params as Prisma.JsonObject) || {};

        // Ensure valid OAuth token before executing reaction
        try {
          const accessToken = await this.tokenRefreshService.ensureValidToken(
            area.user_id,
            service_def.name,
          );

          // Add access token to service config if available
          if (accessToken) {
            service_config.access_token = accessToken;
          }
        } catch (tokenError) {
          this.logger.error(
            `Token refresh failed for service ${service_def.name}:`,
            tokenError,
          );

          // Check if it's an OAuth error that requires re-authentication
          if (tokenError instanceof OAuthError && tokenError.isAuthError()) {
            // Mark user service as errored
            if (user_service) {
              await this.userServiceRepository.markAsErrored(
                user_service.id,
                true,
              );
            }

            // Disable all areas using this service
            await this.disableAreasDueToAuthError(area.user_id, service_def.name);

            this.logger.warn(
              `Disabled areas for user ${area.user_id} due to auth error on service ${service_def.name}`,
            );
            continue; // Skip this reaction
          }

          // For other errors, still try to execute the reaction
          this.logger.warn(
            `Proceeding with reaction execution despite token refresh failure`,
          );
        }

        const sconf = {
          config: { ...service_config, ...reaction_params },
        } as any;

        this.logger.log(
          `Executing reaction ${r_user.reaction_name} for area ${area.id}`,
        );
        await r_def.execute(sconf, reaction_in_params);
      } catch (err) {
        this.logger.error(
          `Error executing reaction ${r_user.reaction_name} for area ${area.id}:`,
          err,
        );
      }
    }
  }

  /**
   * Disable all areas for a user that use a specific service due to authentication errors
   */
  private async disableAreasDueToAuthError(
    userId: string,
    serviceName: string,
  ): Promise<void> {
    try {
      // Find all areas for this user
      const userAreas = await this.area_repository.findByUserId(userId);

      for (const area of userAreas) {
        // Check if any reaction in this area uses the problematic service
        const reactionUsesService = (area.reactions || []).some((reaction: any) => {
          const reactionDef = this.service_importer_service.getReactionByName(
            reaction.reaction_name,
          );
          return reactionDef?.service.name === serviceName;
        });

        // Check if any action in this area uses the problematic service
        const actionUsesService = (area.actions || []).some((action: any) => {
          const actionDef = this.service_importer_service.getActionByName(
            action.action_name,
          );
          return actionDef?.service.name === serviceName;
        });

        if (reactionUsesService || actionUsesService) {
          // Stop pollers for this area
          this.stopAreaPollers(area.id);
          
          // Update the area's enabled status in the database
          await this.area_repository.update(area.id, {
            enabled: false,
          });
          
          this.logger.log(
            `Disabled area ${area.id} due to auth error on service ${serviceName}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to disable areas for user ${userId} service ${serviceName}:`,
        error,
      );
    }
  }

  private stopAreaPollers(areaId: string) {
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

  private async initActionsForArea(area: any, userId: string) {
    for (const a of area.actions || []) {
      try {
        const def_action = this.service_importer_service.getActionByName(
          a.action_name,
        );
        if (!def_action) continue;
        const service_name = def_action.service.name;
        const user_service =
          await this.userservice_service.fromUserIdAndServiceName(
            userId,
            service_name,
          );
        const service_config =
          (user_service?.service_config as Prisma.JsonObject) || {};
        const action_params = (a.params as Prisma.JsonObject) || {};

        // Ensure valid OAuth token before initializing action
        try {
          const accessToken = await this.tokenRefreshService.ensureValidToken(
            userId,
            service_name,
          );
          if (accessToken) {
            service_config.access_token = accessToken;
          }
        } catch (tokenError) {
          this.logger.error(
            `Token refresh failed for action ${a.action_name}:`,
            tokenError,
          );
        }

        const sconf = {
          config: { ...service_config, ...action_params },
        } as any;
        await def_action.action.reload_cache(sconf);

        try {
          const pollKey = `${area.id}:${a.id}`;
          this.actionInstances.set(pollKey, def_action.action);
          if (this.actionPollers.has(pollKey)) {
            clearInterval(this.actionPollers.get(pollKey));
            this.actionPollers.delete(pollKey);
          }

          // Set up polling if applicable
          if (def_action.action.poll_interval <= 0) continue;

          // Initialize cache from reload_cache
          const initialCache = await def_action.action.reload_cache(sconf);
          sconf.cache = initialCache || {};

          const timer = setInterval(() => {
            // Refresh token before each poll if needed
            this.tokenRefreshService
              .ensureValidToken(userId, service_name)
              .then((accessToken) => {
                if (accessToken) {
                  sconf.config.access_token = accessToken;
                }
                return def_action.action.poll(sconf);
              })
              .then(async (out: ActionTriggerOutput) => {
                // Update cache with the returned cache from poll
                if (out.cache) {
                  sconf.cache = { ...sconf.cache, ...out.cache };
                }
                if (out && out.triggered) {
                  await this.handle_action_trigger(a.id, out);
                }
              })
              .catch((err: any) => {
                this.logger.error(
                  `Error polling action ${a.action_name} for area ${area.id}:`,
                  err,
                );
              });
          }, def_action.action.poll_interval * 1000);
          this.actionPollers.set(pollKey, timer);
        } catch (err) {
          this.logger.error('Failed to start poller for action:', err);
        }
      } catch (e) {
        this.logger.error(
          'Failed to initialize action cache for area during startup:',
          e,
        );
      }
    }
  }

  private async initReactionsForArea(area: any, userId: string) {
    for (const r of area.reactions || []) {
      try {
        const def_reaction = this.service_importer_service.getReactionByName(
          r.reaction_name,
        );
        if (!def_reaction) continue;
        const service_name = def_reaction.service.name;
        const user_service =
          await this.userservice_service.fromUserIdAndServiceName(
            userId,
            service_name,
          );
        const service_config =
          (user_service?.service_config as Prisma.JsonObject) || {};
        const reaction_params = (r.params as Prisma.JsonObject) || {};
        const sconf = {
          config: { ...service_config, ...reaction_params },
        } as any;
        await def_reaction.reaction.reload_cache(sconf);
      } catch (e) {
        this.logger.error(
          'Failed to initialize reaction cache for area during startup:',
          e,
        );
      }
    }
  }

  async create(
    userId: string,
    dto: {
      name: string;
      actions: Array<{ action_name: string; params?: Record<string, unknown> }>;
      reactions: Array<{
        reaction_name: string;
        params?: Record<string, unknown>;
      }>;
    },
  ) {
    const actionsWithDefaults = dto.actions || [];

    const data: Prisma.AreaCreateArgs = {
      data: {
        name: dto.name,
        user_id: userId,
        actions: {
          create: actionsWithDefaults.map((a) => ({
            action_name: a.action_name,
            params: a.params as Prisma.InputJsonValue,
          })),
        },
        reactions: {
          create: dto.reactions.map((r) => ({
            reaction_name: r.reaction_name,
            params: r.params as Prisma.InputJsonValue,
          })),
        },
      },
      include: { actions: true, reactions: true },
    };

    const created = await this.area_repository.create(data);
    try {
      await this.initializeOne(created.id);
    } catch (err) {
      this.logger.error('Error during post-create area initialization:', err);
    }
    return created;
  }

  async findByUser(userId: string) {
    return this.area_repository.findByUserId(userId);
  }

  async initializeAll(): Promise<void> {
    const areas = await this.area_repository.findAll();
    for (const area of areas) {
      const userId = area.user_id;
      // Initialize actions and reactions using shared helpers
      await this.initActionsForArea(area, userId);
      await this.initReactionsForArea(area, userId);
    }
  }

  async initializeOne(areaId: string): Promise<void> {
    const area = await this.area_repository.findById(areaId);
    if (!area) throw new NotFoundException(`Area ${areaId} not found`);

    const userId = area.user_id;

    this.stopAreaPollers(areaId);
    // Initialize actions and reactions using shared helpers
    await this.initActionsForArea(area, userId);
    await this.initReactionsForArea(area, userId);
  }

  async updateParams(
    areaId: string,
    dto: {
      actions?: Array<{ id: string; params?: Record<string, unknown> }>;
      reactions?: Array<{ id: string; params?: Record<string, unknown> }>;
    },
  ) {
    if (dto.actions && dto.actions.length > 0) {
      for (const a of dto.actions) {
        const paramsJson = a.params as unknown as Prisma.InputJsonValue;
        await this.action_repository.update(a.id, {
          params: paramsJson,
        });
      }
    }

    if (dto.reactions && dto.reactions.length > 0) {
      for (const r of dto.reactions) {
        const paramsJson = r.params as unknown as Prisma.InputJsonValue;
        await this.reaction_repository.update(r.id, {
          params: paramsJson,
        });
      }
    }

    await this.initializeOne(areaId);

    return this.area_repository.findById(areaId);
  }

  async deleteArea(areaId: string, userId?: string) {
    const area = await this.area_repository.findById(areaId);
    if (!area) throw new NotFoundException(`Area ${areaId} not found`);
    if (userId && area.user_id !== userId) {
      throw new NotFoundException(`Area ${areaId} not found`);
    }
    this.stopAreaPollers(areaId);

    await this.area_repository.delete(areaId);

    return { ok: true };
  }
}
