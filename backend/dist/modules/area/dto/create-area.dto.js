"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAreaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ActionDto {
    action_name;
    params;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'new_message_in_channel' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ActionDto.prototype, "action_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Object }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ActionDto.prototype, "params", void 0);
class ReactionDto {
    reaction_name;
    params;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'send_message_to_channel' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReactionDto.prototype, "reaction_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Object }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ReactionDto.prototype, "params", void 0);
class CreateAreaDto {
    name;
    actions;
    reactions;
}
exports.CreateAreaDto = CreateAreaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Slack to Notion' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAreaDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ActionDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ActionDto),
    __metadata("design:type", Array)
], CreateAreaDto.prototype, "actions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ReactionDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReactionDto),
    __metadata("design:type", Array)
], CreateAreaDto.prototype, "reactions", void 0);
//# sourceMappingURL=create-area.dto.js.map