import {ApiTags} from "@nestjs/swagger";
import {Controller, Get, NotFoundException, Param, Query, Req} from "@nestjs/common";
import {UserServiceService} from "@/modules/user_service/userservice.service";
import {ServiceImporterService} from "@/modules/service_importer/service_importer.service";

@ApiTags('services')
@Controller('services')
export class UserServiceController {
    constructor(
        private readonly service: UserServiceService,
        private readonly serviceImporterService: ServiceImporterService,
    ) {
    }

    @Get("/:service_name/redirect")
    async getServiceRedirectUrl(
        @Req() req: Request & {
            user: { sub: string }
        },
        @Param('service_name') serviceName: string,
        @Query() query: any
    ) {
        const userId = req.user?.sub as string;

        const userservice_instance = await this.service.createOrFind(userId, serviceName);
        const service_def = this.serviceImporterService.getServiceByName(serviceName);

        if (!userservice_instance || !service_def)
            throw new NotFoundException('Service not found');

        if (!service_def.oauth_callback)
            throw new NotFoundException('Service does not support OAuth');

        await service_def.oauth_callback(userservice_instance, query);

    }
}