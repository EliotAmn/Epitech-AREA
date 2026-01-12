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

  create(userId: string, serviceName: string) {
    return this.prismaService.userService.create({
      data: {
        user_id: userId,
        service_name: serviceName,
      },
    });
  }

  delete(id: string) {
    return this.prismaService.userService.delete({
      where: {
        id,
      },
    });
  }

  update(args: { where: any; data: any }) {
    return this.prismaService.userService.update(args);
  }
}
