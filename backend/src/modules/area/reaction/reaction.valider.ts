import { Injectable } from '@nestjs/common';

import {
  ParameterType,
  ParameterValue,
  ServiceReactionDefinition,
} from '@/common/service.types';

@Injectable()
export class ReactionValider {
  validate_reaction_params(
    reaction: ServiceReactionDefinition,
    input_params: Record<string, ParameterValue>,
  ): boolean {
    // Check that all required params are present
    for (const param of reaction.input_params) {
      if (param.required && !(param.name in input_params)) {
        // Missing required param
        return false;
      }
    }
    // Check that all params are of the correct type
    for (const param of reaction.input_params) {
      if (param.name in input_params) {
        const paramValue = input_params[param.name];
        const value = paramValue.value as string | number | boolean;
        switch (param.type) {
          case ParameterType.STRING:
            if (typeof value !== 'string') return false;
            break;
          case ParameterType.NUMBER:
            if (typeof value !== 'number') return false;
            break;
          case ParameterType.BOOLEAN:
            if (typeof value !== 'boolean') return false;
            break;
          case ParameterType.SELECT:
            if (
                typeof value !== 'object' ||
              !param.options ||
              !param.options.some((option) => option.value === value)
            )
              return false;
            break;
          default:
            return false; // Unknown type
        }
      }
    }
    return true;
  }
}
