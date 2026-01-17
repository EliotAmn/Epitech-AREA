import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword_123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newStrongPassword_123' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
