import { NestMiddleware } from '@nestjs/common';
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
export declare class AuthMiddleware implements NestMiddleware {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    use(req: Request & {
        user?: JwtPayload;
    }, _res: Response, next: NextFunction): void;
}
export {};
