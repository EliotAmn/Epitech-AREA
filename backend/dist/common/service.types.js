"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceReactionDefinition = exports.ServiceActionDefinition = exports.ParameterType = void 0;
var ParameterType;
(function (ParameterType) {
    ParameterType["STRING"] = "string";
    ParameterType["NUMBER"] = "number";
    ParameterType["BOOLEAN"] = "boolean";
    ParameterType["SELECT"] = "select";
})(ParameterType || (exports.ParameterType = ParameterType = {}));
class ServiceActionDefinition {
    name;
    label;
    description;
    poll_interval = 0;
    output_params;
    input_params;
}
exports.ServiceActionDefinition = ServiceActionDefinition;
class ServiceReactionDefinition {
    name;
    label;
    description;
    input_params;
}
exports.ServiceReactionDefinition = ServiceReactionDefinition;
//# sourceMappingURL=service.types.js.map