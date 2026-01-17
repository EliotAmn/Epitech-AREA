import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ActionDto {
  @ApiProperty({ example: 'new_message_in_channel' })
  @IsString()
  @IsNotEmpty()
  action_name: string;

  @ApiProperty({ example: 'slack' })
  @IsString()
  @IsNotEmpty()
  service: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;
}

class ReactionDto {
  @ApiProperty({ example: 'send_message_to_channel' })
  @IsString()
  @IsNotEmpty()
  reaction_name: string;

  @ApiProperty({ example: 'notion' })
  @IsString()
  @IsNotEmpty()
  service: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;
}

export class CreateAreaDto {
  @ApiProperty({ example: 'Slack to Notion' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [ActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];

  @ApiProperty({ type: [ReactionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReactionDto)
  reactions: ReactionDto[];
}
