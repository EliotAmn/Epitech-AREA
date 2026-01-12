import { Module } from '@nestjs/common';

import { TokenRefreshService } from './token-refresh.service';
import { UserServiceRepository } from './userservice.repository';
import { UserServiceService } from './userservice.service';

@Module({
  imports: [],
  providers: [UserServiceService, UserServiceRepository, TokenRefreshService],
  exports: [UserServiceService, UserServiceRepository, TokenRefreshService],
})
export class UserServiceModule {}
