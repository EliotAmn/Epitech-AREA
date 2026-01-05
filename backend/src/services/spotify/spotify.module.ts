import { Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import SpotifyService from '@/services/spotify/spotify.service';
import { UserServiceModule } from '@/modules/user_service/userservice.module';

@Module({
  imports: [
    UserServiceModule,
  ],
  providers: [
    {
      provide: SERVICE_DEFINITION,
      useClass: SpotifyService,
    },
  ],
  exports: [SERVICE_DEFINITION],
})
export class SpotifyModule {}
