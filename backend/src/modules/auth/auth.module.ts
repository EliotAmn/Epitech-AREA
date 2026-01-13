import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthMiddleware } from '@/middleware/auth.middleware';
import { PasswordModule } from '../common/password/password.module';
import { UserServiceModule } from '../user_service/userservice.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OauthLinkRepository } from './oauth-link.repository';
import { OauthService } from './oauth.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => {
        const secret = cs.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT secret not configured. Set JWT_SECRET env var in config.',
          );
        }
        return { secret, signOptions: { expiresIn: '1h' } };
      },
    }),
    UserModule,
    PasswordModule,
    UserServiceModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OauthService, OauthLinkRepository, AuthMiddleware],
  exports: [AuthService, OauthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('auth/(.*)', 'about.json')
      .forRoutes('*');
  }
}
