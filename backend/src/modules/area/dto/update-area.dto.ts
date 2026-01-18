import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class UpdateActionDto {
  @ApiPropertyOptional({
    description: 'Action instance ID (existing action id)',
  })
  @IsString()
  id: string;

  @ApiPropertyOptional({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;
}

class UpdateReactionDto {
  @ApiPropertyOptional({
    description: 'Reaction instance ID (existing reaction id)',
  })
  @IsString()
  id: string;

  @ApiPropertyOptional({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;
}

export class UpdateAreaDto {
  @ApiPropertyOptional({ example: 'Updated area name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: [UpdateActionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateActionDto)
  actions?: UpdateActionDto[];

  @ApiPropertyOptional({ type: [UpdateReactionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateReactionDto)
  reactions?: UpdateReactionDto[];
}
