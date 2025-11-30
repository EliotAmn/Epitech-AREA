import {Injectable} from "@nestjs/common";
import {ParamaterType, ServiceReactionConstructor} from "../../common/service.types";

@Injectable()
export class ExecutorService {


    validate_reaction_params(reaction: ServiceReactionConstructor, input_params: Record<string, any>): boolean {
        // Check that all required params are present
        for (const param of reaction.prototype.input_params) {
            if (param.required && !(param.name in input_params)) {
                // Missing required param
                return false;
            }
        }
        // Check that all params are of the correct type
        for (const param of reaction.prototype.input_params) {
            if (param.name in input_params) {
                const value = input_params[param.name];
                switch (param.type) {
                    case ParamaterType.STRING:
                        if (typeof value !== 'string') return false;
                        break;
                    case ParamaterType.NUMBER:
                        if (typeof value !== 'number') return false;
                        break;
                    case ParamaterType.BOOLEAN:
                        if (typeof value !== 'boolean') return false;
                        break;
                    case ParamaterType.SELECT:
                        if (typeof value !== 'string' || !param.options || !param.options.includes(value)) return false;
                        break;
                    default:
                        return false; // Unknown type
                }
            }
        }
        return true;
    }
}