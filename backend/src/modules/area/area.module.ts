import {Module} from "@nestjs/common";
import {ActionRepository} from "./action/action.repository";
import {ReactionRepository} from "./reaction/reaction.repository";
import {AreaRepository} from "./area.repository";
import {AreaService} from "./area.service";
import {ReactionValider} from "./reaction/reaction.valider";
import {ReactionService} from "./reaction/reaction.service";
import {ActionService} from "./action/action.service";

@Module({
    providers: [
        AreaRepository,
        ActionRepository,
        ActionService,
        ReactionRepository,
        ReactionValider,
        ReactionService,
        AreaService
    ]
})
export class AreaModule {
}