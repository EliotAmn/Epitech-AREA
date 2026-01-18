import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ServiceImporterService } from '@/modules/service_importer/service_importer.service';
import { UserServiceService } from '@/modules/user_service/userservice.service';

@ApiTags('services')
@ApiBearerAuth()
@Controller('services')
export class UserServiceController {
  constructor(
    private readonly service: UserServiceService,
    private readonly serviceImporterService: ServiceImporterService,
  ) {}

  @Get('/:service_name/redirect')
  @ApiOperation({ summary: 'Handle service OAuth callback and store tokens' })
  @ApiParam({ name: 'service_name', description: 'Service name' })
  @ApiResponse({
    status: 200,
    description: 'OAuth callback handled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found or OAuth unsupported',
  })
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

    // Save the updated userservice instance to persist the tokens
    await this.service.update(userservice_instance.id, {
      service_config: userservice_instance.service_config || {},
      access_token: userservice_instance.access_token,
      refresh_token: userservice_instance.refresh_token,
      token_expires_at: userservice_instance.token_expires_at,
    });

    return { success: true };
  }

  @Get('/:service_name/status')
  @ApiOperation({ summary: 'Get connection status for a user service' })
  @ApiParam({ name: 'service_name', description: 'Service name' })
  @ApiResponse({ status: 200, description: 'Returns connection status' })
  async getUserServiceStatus(
    @Req()
    req: Request & {
      user: { sub: string };
    },
    @Param('service_name') serviceName: string,
  ) {
    const userId = req.user?.sub;

    const userservice_instance = await this.service.fromUserIdAndServiceName(
      userId,
      serviceName,
    );

    if (!userservice_instance) {
      return { connected: false };
    }

    const config = userservice_instance.service_config || {};
    const connected = Object.keys(config).length > 0;

    return { connected };
  }

  @Delete('/:service_name')
  @ApiOperation({ summary: 'Disconnect user from a service' })
  @ApiParam({ name: 'service_name', description: 'Service name' })
  @ApiResponse({ status: 200, description: 'Disconnection success' })
  async disconnectUserService(
    @Req()
    req: Request & {
      user: { sub: string };
    },
    @Param('service_name') serviceName: string,
  ) {
    const userId = req.user?.sub;

    const userservice_instance = await this.service.fromUserIdAndServiceName(
      userId,
      serviceName,
    );

    if (!userservice_instance) {
      // nothing to disconnect
      return { success: true };
    }

    // Clear stored config/tokens for this userservice
    await this.service.updateConfig(userservice_instance.id, {});

    return { success: true };
  }
}
