import {Module} from "@nestjs/common";
import {ActionRepository} from "./action/action.repository";
import {ReactionRepository} from "./reaction/reaction.repository";
import {AreaRepository} from "./area.repository";
import {AreaService} from "./area.service";

@Module({
    providers: [
        AreaRepository,
        ActionRepository,
        ReactionRepository,
        AreaService
    ]
})
export class AreaModule {
}