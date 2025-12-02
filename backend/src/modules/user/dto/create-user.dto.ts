import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'User full name',
        minLength: 2
    })
    @IsString()
    @MinLength(2)
    name: string;
}
