import { Module } from '@nestjs/common';

import { UserServiceService } from './userservice.service';

@Module({
  imports: [],
  providers: [UserServiceService],
  exports: [],
})
export class UserServiceModule {}
