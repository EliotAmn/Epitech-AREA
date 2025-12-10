import { Inject, Injectable } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import { ServiceDefinition } from '@/common/service.types';

@Injectable()
export class ServiceImporterService {
  constructor(
    @Inject(SERVICE_DEFINITION)
    private readonly services: ServiceDefinition[],
  ) {}

  getAllServices() {
    return this.services.filter(service => {

        // Don't load service if mandatory env vars are not set
        if (service.mandatory_env_vars) {
            for (const env_var of service.mandatory_env_vars) {
                if (!process.env[env_var]) {
                    return false;
                }
            }
        }
    })
  }

  getServiceByName(name: string): ServiceDefinition | undefined {
    return this.services.find((service) => service.name === name);
  }

  getActionByName(actionName: string) {
    const services = this.getAllServices();
    for (const service of services) {
      const action_c = service.actions.find(
        (action) => new action().name === actionName,
      );
      if (action_c) {
        return {
          service: service,
          action: new action_c(),
        };
      }
    }
    return undefined;
  }

  getReactionByName(reactionName: string) {
    const services = this.getAllServices();
    for (const service of services) {
      const reaction_c = service.reactions.find(
        (reaction) => new reaction().name === reactionName,
      );
      if (reaction_c) {
        return {
          service: service,
          reaction: new reaction_c(),
        };
      }
    }
    return undefined;
  }
}
