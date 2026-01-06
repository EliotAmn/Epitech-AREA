import { ServiceImporterService } from '@/modules/service_importer/service_importer.service';
import { UserServiceService } from '@/modules/user_service/userservice.service';
export declare class UserServiceController {
    private readonly service;
    private readonly serviceImporterService;
    constructor(service: UserServiceService, serviceImporterService: ServiceImporterService);
    getServiceRedirectUrl(req: Request & {
        user: {
            sub: string;
        };
    }, serviceName: string, query: Record<string, unknown>): Promise<{
        success: boolean;
    }>;
}
