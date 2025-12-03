import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @IsString()
  @ApiProperty({ example: 'strongPassword123', description: 'User password' })
  password: string;
}
