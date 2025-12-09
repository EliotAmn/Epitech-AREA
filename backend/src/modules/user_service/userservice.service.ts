import { Injectable } from '@nestjs/common';

import { UserServiceRepository } from './userservice.repository';

@Injectable()
export class UserServiceService {
  constructor(private readonly userServiceRepository: UserServiceRepository) {}

  fromUserIdAndServiceName(userId: string, serviceName: string) {
    return this.userServiceRepository.fromUserIdAndServiceName(
      userId,
      serviceName,
    );
  }
}
