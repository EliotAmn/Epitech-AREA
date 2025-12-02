import {Injectable} from '@nestjs/common';
import {Prisma} from "@prisma/client";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class AreaRepository {
    constructor(private prisma: PrismaService) {
    }

    create(data: Prisma.AreaCreateArgs) {
        return this.prisma.area.create(data);
    }

    findAll() {
        return this.prisma.area.findMany();
    }

    findById(id: string) {
        return this.prisma.area.findUnique({where: {id}, include: {actions: true, reactions: true}});
    }

    update(id: string, data: Prisma.AreaReactionUpdateInput) {
        return this.prisma.area.update({
            where: {id},
            data,
        });
    }
}
