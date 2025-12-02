import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: 'Jane Doe',
        description: 'User full name',
        minLength: 2
    })
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;
}
