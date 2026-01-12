import { Injectable } from '@nestjs/common';
import { OauthLink, User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OauthLinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    provider_name: string;
    provider_user_id: string;
    user_id: string;
  }): Promise<OauthLink> {
    return this.prisma.oauthLink.create({ data });
  }

  findByProviderAndId(
    provider_name: string,
    provider_user_id: string,
  ): Promise<(OauthLink & { user: User }) | null> {
    return this.prisma.oauthLink.findUnique({
      where: {
        provider_name_provider_user_id: { provider_name, provider_user_id },
      },
      include: { user: true },
    });
  }

  findAllByUser(user_id: string): Promise<OauthLink[]> {
    return this.prisma.oauthLink.findMany({ where: { user_id } });
  }
}
