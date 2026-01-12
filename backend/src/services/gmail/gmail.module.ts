import { Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import GmailService from './gmail.service';

@Module({
  providers: [
    {
      provide: SERVICE_DEFINITION,
      useClass: GmailService,
    },
  ],
  exports: [SERVICE_DEFINITION],
})
export class GmailModule {}
