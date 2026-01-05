import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../common/password/password.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
export declare class AuthService {
    private readonly passwordService;
    private readonly usersService;
    private readonly jwtService;
    constructor(passwordService: PasswordService, usersService: UserService, jwtService: JwtService);
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
    register(dto: CreateUserDto): Promise<{
        user: Record<string, unknown>;
        access_token: string;
    }>;
}
