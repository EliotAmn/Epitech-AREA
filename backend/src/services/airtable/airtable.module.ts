import { Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import { UserServiceModule } from '@/modules/user_service/userservice.module';
import AirtableService from '@/services/airtable/airtable.service';

@Module({
  imports: [UserServiceModule],
  providers: [
    {
      provide: SERVICE_DEFINITION,
      useClass: AirtableService,
    },
  ],
  exports: [SERVICE_DEFINITION],
})
export class AirtableModule {}
