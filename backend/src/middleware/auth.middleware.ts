import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

type JwtPayload = {
  sub?: string;
  email?: string;
  iat?: number;
  exp?: number;
  [k: string]: unknown;
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(
    req: Request & { user?: JwtPayload },
    _res: Response,
    next: NextFunction,
  ) {
    const header = req.get('authorization');
    if (!header) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const match = header.match(/Bearer\s+(.+)/i);
    if (!match) {
      throw new UnauthorizedException('Bearer token required');
    }

    const token = match[1];
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      // verify returns unknown/any — treat as unknown then assert to JwtPayload
      const verified = secret
        ? (this.jwtService.verify(token, { secret } as unknown) as unknown)
        : (this.jwtService.verify(token) as unknown);

      const payload = verified as JwtPayload;
      req.user = payload;
      return next();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid or expired token';
      throw new UnauthorizedException(message);
    }
  }
}
