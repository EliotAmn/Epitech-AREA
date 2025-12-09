import {Injectable, NotFoundException} from "@nestjs/common";
import {ActionRepository} from "./action/action.repository";
import {AreaRepository} from "./area.repository";
import {ActionTriggerOutput, ParameterType, ParameterValue} from "../../common/service.types";
import {ReactionValider} from "./reaction/reaction.valider";
import {ServiceImporterService} from "../service_importer/service_importer.service";
import {mapRecord} from "../../common/tools";
import {Prisma} from "@prisma/client";
import {UserServiceService} from "../user_service/userservice.service";
import {ReactionRepository} from "./reaction/reaction.repository";

interface AreaContext {
    area: Prisma.AreaDefaultArgs,
    user_services: Prisma.UserServiceDefaultArgs[],
    actions: Prisma.AreaActionDefaultArgs[],
    reactions: Prisma.AreaReactionDefaultArgs[],
}

@Injectable()
export class AreaService {
    constructor(
        private readonly action_repository: ActionRepository,
        private readonly area_repository: AreaRepository,
        private readonly reaction_valider: ReactionValider,
        private readonly service_importer_service: ServiceImporterService,
        private readonly userservice_service: UserServiceService,
    ) {
    }

    async handle_action_trigger(action_id: string, action_out: ActionTriggerOutput): Promise<void> {
        const a_usr = await this.action_repository.findById(action_id);

        if (!a_usr) {
            throw new NotFoundException(`Unknown action with id ${action_id}`);
        }

        const area = await this.area_repository.findById(a_usr.area_id);
        if (!area) {
            throw new NotFoundException(`Unknown area with id ${a_usr.area_id}`);
        }

        if (!action_out.triggered)
            return;

        // Trigger reactions
        area.reactions.forEach(r_user => {
            const defs = this.service_importer_service.getReactionByName(r_user.reaction_name);
            if (!defs) {
                throw new NotFoundException(`Unknown reaction with name ${r_user.reaction_name}`);
            }
            const r_def = defs.reaction;
            const s_def = defs.service;


            // Apply variables from action to reaction parameters
            const user_params = r_user.params as Prisma.JsonObject;
            const action_out_params = action_out.parameters;
            let reaction_in_params: Record<string, ParameterValue> = {};

            // Fill reaction parameters from user-defined parameters
            Object.keys(user_params).forEach(param_name => {
                const name_type = r_def.input_params.find(p => p.name === param_name)?.type;
                reaction_in_params[param_name] = {
                    type: name_type || ParameterType.STRING,
                    value: user_params[param_name]
                };
            });

            // Apply variable replacesments from action output parameters
            mapRecord(action_out_params, (key, value) => {
                if (!reaction_in_params.hasOwnProperty(key))
                    return;
                // Replace parameter value if it's a string containing $(param_name)
                if (reaction_in_params[key].type === ParameterType.STRING) {
                    let replaced_value = reaction_in_params[key].value;
                    const var_pattern = /\$\(([^)]+)\)/g;
                    replaced_value = replaced_value.replace(var_pattern, (match, var_name) => {
                        if (var_name === key) {
                            // Prevent self-replacement infinite loop
                            return match;
                        }
                        if (action_out_params.hasOwnProperty(var_name)) {
                            return action_out_params[var_name].value;
                        }
                        return match; // No replacement found
                    });
                    reaction_in_params[key].value = replaced_value;
                }
            });

            // Verify if all parameters are valid
            const is_valid = this.reaction_valider.validate_reaction_params(r_def, reaction_in_params);

            if (!is_valid)
                return; // Skip invalid reaction execution
            // Execute reaction
            r_def
                .execute({config: {}}, reaction_in_params)
                .catch(err => {
                    console.error(`Error executing reaction ${r_user.reaction_name} for area ${area.id}:`, err);
                });
        })
    }



    async getAreaContext(areaId: string) {
        // const user_action = await this.action_repository.findById(areaId);
        // if (!user_action)
        //     throw new Error(`Action with id ${} not found`);
        // const def_reaction = this.serviceImporterService.getReactionByName(user_reaction.reaction_name);
        // if (!def_reaction)
        //     throw new Error(`Reaction definition with name ${user_reaction.reaction_name} not found`);
        //
        // const service_name = def_reaction.service.name;
        // const user_id = user_reaction.area.user_id;
        // const user_service = await this.userservice_service.fromUserIdAndServiceName(user_id, service_name);
        // if (!user_service)
        //     throw new Error(`User service with name ${service_name} not found for user ${user_id}`);
        // const service_config = user_service.service_config as Prisma.JsonObject;
        // const cache = def_reaction.reaction.reload_cache();
    }
}