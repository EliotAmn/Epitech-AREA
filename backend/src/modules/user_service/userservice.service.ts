import { Injectable } from '@nestjs/common';
import { UserService } from '@prisma/client';

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

  createOrFind(userId: string, serviceName: string) {
    return this.userServiceRepository
      .fromUserIdAndServiceName(userId, serviceName)
      .then((existing) => {
        if (existing) {
          return existing;
        }
        return this.userServiceRepository.create(userId, serviceName);
      });
  }

  setConfigProperty(userService: UserService, key: string, value: string) {
    const config = userService.service_config || {};
    config[key] = value;
    return this.userServiceRepository.update({
      where: { id: userService.id },
      data: { service_config: config },
    });
  }
}
