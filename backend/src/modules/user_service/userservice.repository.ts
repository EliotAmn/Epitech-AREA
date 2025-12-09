import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class UserServiceRepository {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }


    fromUserIdAndServiceName(userId: string, serviceName: string) {
        return this.prismaService.userService.findFirst({
            where: {
                user_id: userId,
                service_name: serviceName,
            },
        });
    }
}