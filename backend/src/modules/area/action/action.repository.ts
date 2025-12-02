import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../prisma/prisma.service';
import {Prisma} from "@prisma/client";

@Injectable()
export class ActionRepository {
    constructor(private prisma: PrismaService) {
    }

    create(data: Prisma.AreaActionCreateArgs) {
        return this.prisma.areaAction.create(data);
    }

    findAll() {
        return this.prisma.areaAction.findMany();
    }

    findById(id: string) {
        return this.prisma.areaAction.findUnique({where: {id}});
    }

    update(id: string, data: Prisma.AreaActionUpdateInput) {
        return this.prisma.areaAction.update({
            where: {id},
            data,
        });
    }
}
