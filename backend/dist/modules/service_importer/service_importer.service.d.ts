import { ServiceDefinition } from '@/common/service.types';
export declare class ServiceImporterService {
    private readonly services;
    constructor(services: ServiceDefinition[]);
    getAllServices(): ServiceDefinition[];
    getServiceByName(name: string): ServiceDefinition | undefined;
    getActionByName(actionName: string): {
        service: ServiceDefinition;
        action: import("@/common/service.types").ServiceActionDefinition;
    } | undefined;
    getReactionByName(reactionName: string): {
        service: ServiceDefinition;
        reaction: import("@/common/service.types").ServiceReactionDefinition;
    } | undefined;
}
