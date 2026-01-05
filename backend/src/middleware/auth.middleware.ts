import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import type { VerifyOptions } from 'jsonwebtoken';

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
    const urlToken = req.query.jwt_auth as string | undefined;

    let token: string | null = null;

    // Try to get token from Authorization header first
    if (header) {
      const match = header.match(/Bearer\s+(.+)/i);
      if (match) {
        token = match[1];
      }
    }

    // Fall back to URL parameter if header token not found
    if (!token && urlToken) {
      token = urlToken;
    }

    if (!token) {
      throw new UnauthorizedException('Authorization token missing');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const options: (VerifyOptions & { secret?: string }) | undefined = secret
        ? { secret }
        : undefined;

      req.user = this.jwtService.verify<JwtPayload>(token, options);
      return next();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid or expired token';
      throw new UnauthorizedException(message);
    }
  }
}
