import { Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import { UserServiceModule } from '@/modules/user_service/userservice.module';
import DateTimeService from '@/services/date_time/date_time.service';

@Module({
  imports: [UserServiceModule],
  providers: [
    {
      provide: SERVICE_DEFINITION,
      useClass: DateTimeService,
    },
  ],
  exports: [SERVICE_DEFINITION],
})
export class DateTimeModule {}
