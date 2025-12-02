import { Injectable, UnauthorizedException } from '@nestjs/common';
import {UserService} from "../../user/user.service";
import {PasswordService} from "../common/password/password.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly passwordService: PasswordService,
        private readonly usersService: UserService,
    ) {}

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);

        if (!user) throw new UnauthorizedException('Invalid credentials');

        if (user.auth_platform != "local") throw new UnauthorizedException('Invalid credentials');

        if (!user.password_hash) throw new UnauthorizedException('Invalid credentials');

        const ok = await this.passwordService.compare(password, user.password_hash);
        if (!ok) throw new UnauthorizedException('Invalid credentials');

        // Actually, here you would return a JWT
        return { message: 'Login success', userId: user.id };
    }
}