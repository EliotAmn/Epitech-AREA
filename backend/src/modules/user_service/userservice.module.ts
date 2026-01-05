import {Module} from '@nestjs/common';

import {UserServiceRepository} from './userservice.repository';
import {UserServiceService} from './userservice.service';
import {UserServiceController} from "@/modules/user_service/userservice.controller";

@Module({
    imports: [],
    providers: [UserServiceService, UserServiceRepository],
    exports: [UserServiceService],
    controllers: [UserServiceController],
})
export class UserServiceModule {
}
