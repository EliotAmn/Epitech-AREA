import { Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import { UserServiceModule } from '@/modules/user_service/userservice.module';
import ClickUpService from '@/services/clickup/clickup.service';

@Module({
  imports: [UserServiceModule],
  providers: [
    {
      provide: SERVICE_DEFINITION,
      useClass: ClickUpService,
    },
  ],
  exports: [SERVICE_DEFINITION],
})
export class ClickUpModule {}
