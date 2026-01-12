import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import type { StrategyOptions } from 'passport-google-oauth20';

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
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientID || !clientSecret) {
      throw new Error(
        'Google OAuth not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables',
      );
    }

    const appUrl = (configService.get<string>('APP_URL') || '').replace(
      /\/$/,
      '',
    );
    const callbackURL = `${appUrl}/auth/google/redirect`;

    const options: StrategyOptions = {
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    };

    super(options);

    this.logger.debug(
      `GoogleStrategy configured callbackURL=${callbackURL} clientID=${!!clientID}`,
    );
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: (error: Error | null, user?: any) => void,
  ) {
    try {
      this.logger.debug(
        `Google profile received id=${profile.id} email=${profile.emails?.[0]?.value}`,
      );
      this.logger.debug(
        `OAuth tokens: accessToken=${!!accessToken} refreshToken=${!!refreshToken}`,
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : String(err);
      this.logger.debug(msg || 'Google profile received (unable to stringify)');
    }

    const result = {
      provider: 'google',
      id: profile.id,
      email: profile.emails?.[0]?.value,
      displayName: profile.displayName,
      accessToken,
      refreshToken,
      raw: profile,
    };

    done(null, result);
  }
}
