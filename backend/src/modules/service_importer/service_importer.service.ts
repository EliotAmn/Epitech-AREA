import {Inject, Injectable} from "@nestjs/common";
import {ServiceDefinition} from "../../common/service.types";
import {SERVICE_DEFINITION} from "../../common/consts";

@Injectable()
export class ServiceImporterService {

    constructor(
        @Inject(SERVICE_DEFINITION)
        private readonly services: ServiceDefinition[],
    ) {}

    getAllServices() {
        return this.services;
    }

    getServiceByName(name: string): ServiceDefinition | undefined {
        return this.services.find(service => service.name === name);
    }

    getActionByName(actionName: string) {
        const services = this.getAllServices();
        for (const service of services) {
            const action = service.actions.find(action => action.name === actionName);
            if (action) {
                return new action();
            }
        }
        return undefined;
    }

    getReactionByName(reactionName: string) {
        const services = this.getAllServices();
        for (const service of services) {
            const reaction_c = service.reactions.find(reaction => reaction.name === reactionName);
            if (reaction_c) {
                return {
                    service: service,
                    reaction: new reaction_c()
                }
            }
        }
        return undefined;
    }
}