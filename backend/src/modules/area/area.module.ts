import { Module } from '@nestjs/common';

import { ActionRepository } from './action/action.repository';
import { ActionService } from './action/action.service';
import { AreaRepository } from './area.repository';
import { AreaService } from './area.service';
import { ReactionRepository } from './reaction/reaction.repository';
import { ReactionService } from './reaction/reaction.service';
import { ReactionValider } from './reaction/reaction.valider';

@Module({
  providers: [
    AreaRepository,
    ActionRepository,
    ActionService,
    ReactionService,
    ReactionRepository,
    ReactionValider,
    AreaService,
  ],
})
export class AreaModule {}
