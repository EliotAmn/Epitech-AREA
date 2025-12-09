import {Module} from "@nestjs/common";
import {UserServiceService} from "./userservice.service";
import {UserServiceRepository} from "./userservice.repository";

@Module({
    imports: [],
    providers: [
        UserServiceService,
        UserServiceRepository
    ],
    exports: [],
})
export class UserServiceModule {}
