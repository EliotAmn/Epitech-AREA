import { Injectable, Logger } from '@nestjs/common';

import {
  ParameterDefinition,
  ServiceActionConstructor,
  ServiceDefinition,
  ServiceReactionConstructor,
} from '@/common/service.types';
import { ServiceImporterService } from '@/modules/service_importer/service_importer.service';

type ServiceClassOrInstance = (new () => ServiceDefinition) | ServiceDefinition;

export interface ActionInfo {
  name: string;
  description: string;
  output_params?: ParameterDefinition[];
}

export interface ReactionInfo {
  name: string;
  description: string;
  input_params?: ParameterDefinition[];
}

export interface ServiceInfo {
  name: string;
  oauth_url?: string;
  actions: ActionInfo[];
  reactions: ReactionInfo[];
}
export interface AboutResponse {
  client: {
    host: string;
  };
  server: {
    current_time: number;
    services: ServiceInfo[];
  };
}

@Injectable()
export class AboutService {
  private readonly logger = new Logger(AboutService.name);

  constructor(
    private readonly serviceImporterService: ServiceImporterService,
  ) {}

  getAboutInfo(clientIp: string): AboutResponse {
    const currentTime = this.getCurrentTimestamp();
    const services = this.formatServices();

    return {
      client: {
        host: clientIp || 'unknown',
      },
      server: {
        current_time: currentTime,
        services,
      },
    };
  }

  private getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  private formatServices(): ServiceInfo[] {
    const services = this.serviceImporterService.getAllServices();

    /* Doing hacky stuff with ServiceDefinition to obtain usable instances, would likely
    be better if it had a clear type */
    return services.map((serviceClassOrInstance: ServiceClassOrInstance) => {
      try {
        const service =
          typeof serviceClassOrInstance === 'function'
            ? new serviceClassOrInstance()
            : serviceClassOrInstance;

        const actions: ActionInfo[] = this.formatActions(service.actions || []);
        const reactions: ReactionInfo[] = this.formatReactions(
          service.reactions || [],
        );

        return {
          name: service.name,
          oauth_url: service.oauth_url,
          actions,
          reactions,
        };
      } catch (error) {
        this.logger.error(`Failed to format service:`, error);
        return {
          name: 'unknown',
          actions: [],
          reactions: [],
        };
      }
    });
  }

  private formatActions(
    actionClasses: ServiceActionConstructor[],
  ): ActionInfo[] {
    return actionClasses.map((ActionClass) => {
      try {
        const actionInstance = new ActionClass();
        return {
          name: actionInstance.name || 'unknown_action',
          description: actionInstance.description || 'No description available',
          output_params: actionInstance.output_params || [],
          input_params: actionInstance.input_params || [],
        };
      } catch (error) {
        this.logger.error(`Failed to instantiate action:`, error);
        return {
          name: 'unknown_action',
          description: 'Failed to load action',
        };
      }
    });
  }

  private formatReactions(
    reactionClasses: ServiceReactionConstructor[],
  ): ReactionInfo[] {
    return reactionClasses.map((ReactionClass) => {
      try {
        const reactionInstance = new ReactionClass();
        return {
          name: reactionInstance.name || 'unknown_reaction',
          description:
            reactionInstance.description || 'No description available',
          input_params: reactionInstance.input_params || [],
        };
      } catch (error) {
        this.logger.error(`Failed to instantiate reaction:`, error);
        return {
          name: 'unknown_reaction',
          description: 'Failed to load reaction',
        };
      }
    });
  }
}
