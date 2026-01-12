import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description:
      'Plain text password (min 8, upper, lower, number, special char)',
    minLength: 8,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Password too weak. Use upper, lower, number and special character.',
  })
  password?: string;

  @ApiProperty({
    example: 'local',
    description: 'Authentication platform',
    enum: ['local', 'google', 'github'],
    default: 'local',
  })
  @IsString()
  @IsOptional()
  auth_platform?: AuthPlatform;
}

export type AuthPlatform = 'local' | 'google' | 'github';

export const AUTH_PLATFORMS = ['local', 'google', 'github'] as const;

export function isAuthPlatform(v: unknown): v is AuthPlatform {
  return (
    typeof v === 'string' && (AUTH_PLATFORMS as readonly string[]).includes(v)
  );
}
