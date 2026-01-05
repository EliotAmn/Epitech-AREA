import { ParameterDefinition } from '@/common/service.types';
import { ServiceImporterService } from '@/modules/service_importer/service_importer.service';
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
export declare class AboutService {
    private readonly serviceImporterService;
    private readonly logger;
    constructor(serviceImporterService: ServiceImporterService);
    getAboutInfo(clientIp: string): AboutResponse;
    private getCurrentTimestamp;
    private formatServices;
    private formatActions;
    private formatReactions;
}
