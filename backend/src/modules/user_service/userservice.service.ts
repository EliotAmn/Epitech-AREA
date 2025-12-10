import { Injectable } from '@nestjs/common';

import { UserServiceRepository } from './userservice.repository';
import {UserService} from "@prisma/client";

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
    return this.userServiceRepository.fromUserIdAndServiceName(
      userId,
      serviceName,
    ).then((existing) => {
      if (existing) {
        return existing;
      }
      return this.userServiceRepository.create(userId, serviceName);
    });
  }

  setConfigProperty(userService: UserService, key: string, value: any) {
    const config = userService.service_config || {};
    config[key] = value;
    return this.userServiceRepository.update({
      where: { id: userService.id },
      data: { config },
    });
  }
}
