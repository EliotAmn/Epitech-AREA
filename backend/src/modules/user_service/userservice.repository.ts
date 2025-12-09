import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserServiceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  fromUserIdAndServiceName(userId: string, serviceName: string) {
    return this.prismaService.userService.findUnique({
      where: {
        user_id_service_name: {
          user_id: userId,
          service_name: serviceName,
        },
      },
    });
  }
}
