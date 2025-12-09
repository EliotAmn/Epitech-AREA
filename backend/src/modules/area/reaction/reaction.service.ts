import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ServiceConfig } from '../../../common/service.types';
import { ServiceImporterService } from '../../service_importer/service_importer.service';
import { UserServiceService } from '../../user_service/userservice.service';
import { AreaRepository } from '../area.repository';
import { ReactionRepository } from './reaction.repository';

@Injectable()
export class ReactionService {
  constructor(
    private readonly serviceImporterService: ServiceImporterService,
    private readonly reactionRepository: ReactionRepository,
    private readonly userserviceService: UserServiceService,
    private readonly areaRepository: AreaRepository,
  ) {}

  async reloadCache(reactionId: string): Promise<void> {
    const user_reaction = await this.reactionRepository.findById(reactionId);
    if (!user_reaction)
      throw new Error(`Reaction with id ${reactionId} not found`);
    const def_reaction = this.serviceImporterService.getReactionByName(
      user_reaction.reaction_name,
    );
    if (!def_reaction)
      throw new Error(
        `Reaction definition with name ${user_reaction.reaction_name} not found`,
      );

    const service_name = def_reaction.service.name;
    const user_id = user_reaction.area.user_id;
    const user_service = await this.userserviceService.fromUserIdAndServiceName(
      user_id,
      service_name,
    );
    if (!user_service)
      throw new Error(
        `User service with name ${service_name} not found for user ${user_id}`,
      );
    const service_config = user_service.service_config as Prisma.JsonObject;
    // To ServiceConfig
    const sconf = {
      config: service_config,
    } as ServiceConfig;
    const cache = def_reaction.reaction.reload_cache(sconf);
  }
}
