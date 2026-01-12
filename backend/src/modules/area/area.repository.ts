import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class AreaRepository {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.AreaCreateArgs) {
    return this.prisma.area.create(data);
  }

  findAll() {
    return this.prisma.area.findMany({
      include: { actions: true, reactions: true },
    });
  }

  findByUserId(userId: string) {
    return this.prisma.area.findMany({
      where: { user_id: userId },
      include: { actions: true, reactions: true },
    });
  }

  findById(id: string) {
    return this.prisma.area.findUnique({
      where: { id },
      include: { actions: true, reactions: true },
    });
  }

  update(id: string, data: Prisma.AreaReactionUpdateInput) {
    return this.prisma.area.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.area.delete({ where: { id } });
  }
}
