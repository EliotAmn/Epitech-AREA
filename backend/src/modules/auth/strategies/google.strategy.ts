import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

interface GoogleProfile {
  id: string;
  emails?: { value: string }[];
  displayName?: string;
  [key: string]: unknown;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const appUrl = (configService.get<string>('APP_URL') || '').replace(
      /\/$/,
      '',
    );
    const callbackURL = `${appUrl}/auth/google/redirect`;

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL,
      scope: ['email', 'profile'],
    });

    this.logger.debug(
      `GoogleStrategy configured callbackURL=${callbackURL} clientID=${!!configService.get<string>('GOOGLE_CLIENT_ID')}`,
    );
  }

  validate(accessToken: string, refreshToken: string, profile: GoogleProfile) {
    try {
      this.logger.debug(
        `Google profile received id=${profile.id} email=${profile.emails?.[0]?.value}`,
      );
    } catch (e) {
      this.logger.debug(e || 'Google profile received (unable to stringify)');
    }

    return {
      provider: 'google',
      id: profile.id,
      email: profile.emails?.[0]?.value,
      displayName: profile.displayName,
      raw: profile,
    };
  }
}
