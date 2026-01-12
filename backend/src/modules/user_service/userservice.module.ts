import { Module } from '@nestjs/common';

import { ServiceImporterModule } from '@/modules/service_importer/service_importer.module';
import { UserServiceController } from '@/modules/user_service/userservice.controller';
import { UserServiceRepository } from './userservice.repository';
import { UserServiceService } from './userservice.service';

@Module({
  imports: [ServiceImporterModule.register()],
  providers: [UserServiceService, UserServiceRepository],
  exports: [UserServiceService],
  controllers: [UserServiceController],
})
export class UserServiceModule {}
