import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PasswordModule } from '../common/password/password.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { OauthLinkRepository } from './oauth-link.repository';
import { OauthService } from './oauth.service';
// import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
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
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    // GithubStrategy,
    OauthService,
    OauthLinkRepository,
  ],
  exports: [AuthService, OauthService],
})
export class AuthModule {}
