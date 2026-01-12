import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

interface TokenUpdateData {
  access_token: string;
  refresh_token?: string;
  token_expires_at?: Date | null;
}

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

  async updateTokens(userServiceId: string, tokens: TokenUpdateData) {
    return this.prismaService.userService.update({
      where: { id: userServiceId },
      data: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.token_expires_at,
        updated_at: new Date(),
      },
    });
  }

  async markAsErrored(userServiceId: string, errored: boolean) {
    return this.prismaService.userService.update({
      where: { id: userServiceId },
      data: {
        errored,
        updated_at: new Date(),
      },
    });
  }

  async create(data: {
    user_id: string;
    service_name: string;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: Date | null;
    service_config?: any;
  }) {
    return this.prismaService.userService.create({
      data: {
        user_id: data.user_id,
        service_name: data.service_name,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_expires_at: data.token_expires_at,
        service_config: data.service_config || {},
      },
    });
  }
}
