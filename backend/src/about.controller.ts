import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ServiceImporterService } from './modules/service_importer/service_importer.service';

interface ActionInfo {
  name: string;
  description: string;
}

interface ReactionInfo {
  name: string;
  description: string;
}

interface ServiceInfo {
  name: string;
  actions: ActionInfo[];
  reactions: ReactionInfo[];
}

interface AboutResponse {
  client: {
    host: string;
  };
  server: {
    current_time: number;
    services: ServiceInfo[];
  };
}

@Controller()
export class AboutController {
  constructor(
    private readonly serviceImporterService: ServiceImporterService,
  ) {}

  @Get('about.json')
  getAbout(@Req() request: Request): AboutResponse {
    /* Get client IP using x-forwarded-for header */
    const clientIp = 
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.socket.remoteAddress ||
      'unknown';

    /* Get current unix timestamp */
    const currentTime = Math.floor(Date.now() / 1000);

    /* Get services definitions */
    const services = this.serviceImporterService.getAllServices();
    const formattedServices: ServiceInfo[] = services.map((ServiceClass: any) => {
      /* Instantiate the service */
      const service = typeof ServiceClass === 'function' ? new ServiceClass() : ServiceClass;

      /* Get actions / reactions infos */
      const actions: ActionInfo[] = (service.actions || []).map((ActionClass) => {
        const actionInstance = new ActionClass();
        return {
          name: actionInstance.name,
          description: actionInstance.description,
        };
      });

      const reactions: ReactionInfo[] = (service.reactions || []).map((ReactionClass) => {
        const reactionInstance = new ReactionClass();
        return {
          name: reactionInstance.name,
          description: reactionInstance.description,
        };
      });

      return {
        name: service.name,
        actions,
        reactions,
      };
    });

    return {
      client: {
        host: clientIp,
      },
      server: {
        current_time: currentTime,
        services: formattedServices,
      },
    };
  }
}
