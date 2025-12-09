import { Module } from '@nestjs/common';

import { ActionRepository } from './action/action.repository';
import { AreaRepository } from './area.repository';
import { AreaService } from './area.service';
import { ReactionRepository } from './reaction/reaction.repository';
import { ReactionValider } from './reaction/reaction.valider';

@Module({
  providers: [
    AreaRepository,
    ActionRepository,
    ReactionRepository,
    ReactionValider,
    AreaService,
  ],
})
export class AreaModule {}
