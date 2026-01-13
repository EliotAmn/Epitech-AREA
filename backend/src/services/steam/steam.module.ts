import { Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import { UserServiceModule } from '@/modules/user_service/userservice.module';
import SteamService from '@/services/steam/steam.service';

@Module({
  imports: [UserServiceModule],
  providers: [
    {
      provide: SERVICE_DEFINITION,
      useClass: SteamService,
    },
  ],
  exports: [SERVICE_DEFINITION],
})
export class SteamModule {}
