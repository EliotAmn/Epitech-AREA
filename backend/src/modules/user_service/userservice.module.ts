import { Module } from '@nestjs/common';

import { UserServiceRepository } from './userservice.repository';
import { UserServiceService } from './userservice.service';

@Module({
  imports: [],
  providers: [UserServiceService, UserServiceRepository],
  exports: [UserServiceService],
})
export class UserServiceModule {}
