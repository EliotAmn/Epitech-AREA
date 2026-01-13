import { Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import { UserServiceModule } from '@/modules/user_service/userservice.module';
import TwitchService from '@/services/twitch/twitch.service';

@Module({
  imports: [UserServiceModule],
  providers: [
    {
      provide: SERVICE_DEFINITION,
      useClass: TwitchService,
    },
  ],
  exports: [SERVICE_DEFINITION],
})
export class TwitchModule {}
