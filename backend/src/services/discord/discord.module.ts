import { Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import DiscordService from './discord.service';

@Module({
  providers: [
    {
      provide: SERVICE_DEFINITION,
      useClass: DiscordService,
    },
  ],
  exports: [SERVICE_DEFINITION],
})
export class DiscordModule {}
