import {UserServiceRepository} from "./userservice.repository";
import {Injectable} from '@nestjs/common';

@Injectable()
export class UserServiceService {

    constructor(
        private readonly userServiceRepository: UserServiceRepository,
    ) {
    }

    fromUserIdAndServiceName(userId: string, serviceName: string) {
        return this.userServiceRepository.fromUserIdAndServiceName(userId, serviceName);
    }


}