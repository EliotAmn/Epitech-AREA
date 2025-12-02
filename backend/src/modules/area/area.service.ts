import {Injectable, NotFoundException} from "@nestjs/common";
import {ActionRepository} from "./action/action.repository";
import {AreaRepository} from "./area.repository";
import {ActionTriggerOutput} from "../../common/service.types";
import {ReactionValider} from "./reaction/reaction.valider";

@Injectable()
export class AreaService {
    constructor(
        private readonly action_repository: ActionRepository,
        private readonly area_repository: AreaRepository,
        private readonly reaction_valider: ReactionValider
    ) {
    }

    async handle_action_trigger(action_id: string, parameters: ActionTriggerOutput): Promise<void> {
        const action = await this.action_repository.findById(action_id);

        if (!action) {
            throw new NotFoundException(`Unknown action with id ${action_id}`);
        }

        const area = await this.area_repository.findById(action.area_id);
        if (!area) {
            throw new NotFoundException(`Unknown area with id ${action.area_id}`);
        }

        if (!parameters.triggered)
            return;

        // Trigger reactions
        area.reactions.forEach(reaction => {
           // if (this.reaction_valider.validate_reaction_params(reaction, parameters.output_params)) {
        })

    }
}