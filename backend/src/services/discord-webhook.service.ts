import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { ServiceBase } from './';
import type { Action, Reaction, TokenValidationResult } from './types';

/**
 * Discord Webhook service implementing the IService contract via ServiceBase.
 * This service uses OAuth2 to authenticate and send messages as the user.
 */
@Injectable()
export class DiscordWebhookService extends ServiceBase<
  Action,
  Reaction,
  TokenValidationResult
> {
  name = 'discord-webhook';
  color = '#7289DA';
  icon = 'discord';

  private readonly logger = new Logger(DiscordWebhookService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private accessToken?: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.clientId = this.configService.get<string>('DISCORD_CLIENT_ID') ?? '';
    this.clientSecret =
      this.configService.get<string>('DISCORD_CLIENT_SECRET') ?? '';
    this.redirectUri =
      this.configService.get<string>('DISCORD_REDIRECT_URI') ?? '';

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Discord OAuth2 configuration is missing.');
    }
  }

  getActions(): Action[] {
    return this.toActions(['message_contains']);
  }

  getReactions(): Reaction[] {
    return this.toReactions(['send_message']);
  }

  validateToken(token: string): TokenValidationResult {
    const valid = !!token;
    return { valid, reason: valid ? undefined : 'Invalid token' };
  }

  getAuthorizationUrl(): string {
    const scope = 'identify messages.read';
    return `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(
      this.redirectUri,
    )}&response_type=code&scope=${encodeURIComponent(scope)}`;
  }

  async exchangeCodeForToken(code: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<{ access_token: string }>(
          'https://discord.com/api/oauth2/token',
          null,
          {
            params: {
              client_id: this.clientId,
              client_secret: this.clientSecret,
              grant_type: 'authorization_code',
              code,
              redirect_uri: this.redirectUri,
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;
      this.logger.log('Access token obtained successfully.');
    } catch (error) {
      this.logger.error('Failed to exchange code for token.', error);
      throw error;
    }
  }

  async sendMessage(content: string): Promise<void> {
    if (!this.accessToken) {
      this.logger.error('Access token is not available.');
      throw new Error('Access token is not available.');
    }

    try {
      await firstValueFrom(
        this.httpService.post(
          'https://discord.com/api/v9/users/@me/channels',
          { content },
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        ),
      );
      this.logger.log('Message sent successfully.');
    } catch (error) {
      this.logger.error('Failed to send message.', error);
      throw error;
    }
  }
}
