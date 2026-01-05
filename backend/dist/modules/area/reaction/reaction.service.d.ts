import { ServiceImporterService } from '@/modules/service_importer/service_importer.service';
import { UserServiceService } from '@/modules/user_service/userservice.service';
import { AreaRepository } from '../area.repository';
import { ReactionRepository } from './reaction.repository';
export declare class ReactionService {
    private readonly serviceImporterService;
    private readonly reactionRepository;
    private readonly userserviceService;
    private readonly areaRepository;
    constructor(serviceImporterService: ServiceImporterService, reactionRepository: ReactionRepository, userserviceService: UserServiceService, areaRepository: AreaRepository);
    reloadCache(reactionId: string): Promise<void>;
}
