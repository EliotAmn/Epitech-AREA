"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionValider = void 0;
const common_1 = require("@nestjs/common");
const service_types_1 = require("../../../common/service.types");
let ReactionValider = class ReactionValider {
    validate_reaction_params(reaction, input_params) {
        for (const param of reaction.input_params) {
            if (param.required && !(param.name in input_params)) {
                return false;
            }
        }
        for (const param of reaction.input_params) {
            if (param.name in input_params) {
                const paramValue = input_params[param.name];
                const value = paramValue.value;
                switch (param.type) {
                    case service_types_1.ParameterType.STRING:
                        if (typeof value !== 'string')
                            return false;
                        break;
                    case service_types_1.ParameterType.NUMBER:
                        if (typeof value !== 'number')
                            return false;
                        break;
                    case service_types_1.ParameterType.BOOLEAN:
                        if (typeof value !== 'boolean')
                            return false;
                        break;
                    case service_types_1.ParameterType.SELECT:
                        if (typeof value !== 'string' ||
                            !param.options ||
                            !param.options.includes(value))
                            return false;
                        break;
                    default:
                        return false;
                }
            }
        }
        return true;
    }
};
exports.ReactionValider = ReactionValider;
exports.ReactionValider = ReactionValider = __decorate([
    (0, common_1.Injectable)()
], ReactionValider);
//# sourceMappingURL=reaction.valider.js.map