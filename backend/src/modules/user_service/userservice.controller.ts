import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ServiceImporterService } from '@/modules/service_importer/service_importer.service';
import { UserServiceService } from '@/modules/user_service/userservice.service';

@ApiTags('services')
@Controller('services')
export class UserServiceController {
  constructor(
    private readonly service: UserServiceService,
    private readonly serviceImporterService: ServiceImporterService,
  ) {}

  @Get('/:service_name/redirect')
  async getServiceRedirectUrl(
    @Req()
    req: Request & {
      user: { sub: string };
    },
    @Param('service_name') serviceName: string,
    @Query() query: Record<string, unknown>,
  ) {
    const userId = req.user?.sub;

    const userservice_instance = await this.service.createOrFind(
      userId,
      serviceName,
    );
    const service_def =
      this.serviceImporterService.getServiceByName(serviceName);

    if (!userservice_instance || !service_def)
      throw new NotFoundException('Service not found');

    if (!service_def.oauth_callback)
      throw new NotFoundException('Service does not support OAuth');

    const queryObj: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        queryObj[key] = value;
      }
    }

    await service_def.oauth_callback(userservice_instance, queryObj);

    return { success: true };
  }
}
