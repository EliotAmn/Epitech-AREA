import {Module} from '@nestjs/common';

import {UserServiceRepository} from './userservice.repository';
import {UserServiceService} from './userservice.service';
import {UserServiceController} from "@/modules/user_service/userservice.controller";
import {ServiceImporterModule} from "@/modules/service_importer/service_importer.module";

@Module({
    imports: [ServiceImporterModule.register()],
    providers: [UserServiceService, UserServiceRepository],
    exports: [UserServiceService],
    controllers: [UserServiceController],
})
export class UserServiceModule {
}
