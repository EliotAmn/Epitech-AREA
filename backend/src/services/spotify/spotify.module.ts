import { Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import SpotifyService from '@/services/spotify/spotify.service';

@Module({
  providers: [
    {
      provide: SERVICE_DEFINITION,
      useClass: SpotifyService,
    },
  ],
  exports: [SERVICE_DEFINITION],
})
export class DiscordModule {}
