import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {Prisma} from "@prisma/client";

@Injectable()
export class ReactionRepository {
    constructor(private prisma: PrismaService) {
    }

    create(data: Prisma.AreaReactionCreateArgs) {
        return this.prisma.areaReaction.create(data);
    }

    findAll() {
        return this.prisma.areaReaction.findMany();
    }

    findById(id: string) {
        return this.prisma.areaReaction.findUnique({where: {id}, include: {area: true} });
    }

    update(id: string, data: Prisma.AreaReactionUpdateInput) {
        return this.prisma.areaReaction.update({
            where: {id},
            data,
        });
    }
}
