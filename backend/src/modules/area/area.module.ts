import { Module } from '@nestjs/common';

import { ServiceImporterModule } from '@/modules/service_importer/service_importer.module';
import { UserServiceModule } from '@/modules/user_service/userservice.module';
import { ActionRepository } from './action/action.repository';
import { ActionService } from './action/action.service';
import { AreaController } from './area.controller';
import { AreaRepository } from './area.repository';
import { AreaService } from './area.service';
import { ReactionRepository } from './reaction/reaction.repository';
import { ReactionService } from './reaction/reaction.service';
import { ReactionValider } from './reaction/reaction.valider';

@Module({
  imports: [ServiceImporterModule.register(), UserServiceModule],
  controllers: [AreaController],
  providers: [
    AreaRepository,
    ActionRepository,
    ActionService,
    ReactionService,
    ReactionRepository,
    ReactionValider,
    AreaService,
  ],
  exports: [AreaService],
})
export class AreaModule {}
