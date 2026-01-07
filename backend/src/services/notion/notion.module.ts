import { Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import { UserServiceModule } from '@/modules/user_service/userservice.module';
import NotionService from '@/services/notion/notion.service';

@Module({
  imports: [UserServiceModule],
  providers: [
    {
      provide: SERVICE_DEFINITION,
      useClass: NotionService,
    },
  ],
  exports: [SERVICE_DEFINITION],
})
export class NotionModule {}
