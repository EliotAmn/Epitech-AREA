import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { PasswordService } from '../common/password/password.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.auth_platform != 'local')
      throw new UnauthorizedException('Invalid credentials');

    if (!user.password_hash)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await this.passwordService.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(dto: CreateUserDto) {
    const incoming = dto;
    if (!incoming.password) throw new BadRequestException('Password required');

    const hash = await this.passwordService.hash(incoming.password);
    const payload = {
      ...incoming,
      password_hash: hash,
    };
    delete payload.password;

    let createdUser: User | null = null;
    try {
      createdUser = await this.usersService.create(payload);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      const errStack = e instanceof Error ? e.stack : undefined;
      console.error('AuthService.register: user creation failed:', errMsg);
      if (errStack) console.error(errStack);
      throw new InternalServerErrorException(errMsg || 'Failed to create user');
    }

    if (typeof createdUser !== 'object' || createdUser === null) {
      throw new InternalServerErrorException('Created user has invalid shape');
    }
    const safeUser: Record<string, unknown> = {
      ...(createdUser as Record<string, unknown>),
    };
    delete safeUser.password_hash;

    // return JWT so user is authenticated immediately after register
    try {
      const token = this.jwtService.sign({
        sub: createdUser.id,
        email: createdUser.email,
      });
      return { user: safeUser, access_token: token };
    } catch (e) {
      console.error('AuthService.register: jwt sign failed', e);

      throw new InternalServerErrorException('Failed to create access token');
    }
  }
}
