import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getRequiredConfig<T = string>(key: string): T {
    const value = this.configService.get<T>(key);
    if (value === undefined || value === null) {
      throw new Error(`Missing required config ${key}`);
    }
    return value;
  }

  // 1. Get the Login URL
  getDiscordAuthUrl(): string {
    const clientId = this.getRequiredConfig<string>('DISCORD_CLIENT_ID');
    const redirectUri = encodeURIComponent(
      this.getRequiredConfig<string>('DISCORD_REDIRECT_URI'),
    );
    // Scopes: 'identify' gets user info. 'bot' adds the bot to the server.
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
  }

  // 2. Exchange Code for Access Token
  async getAccessToken(code: string): Promise<any> {
    const params = new URLSearchParams();
    params.append(
      'client_id',
      this.getRequiredConfig<string>('DISCORD_CLIENT_ID'),
    );
    params.append(
      'client_secret',
      this.getRequiredConfig<string>('DISCORD_CLIENT_SECRET'),
    );
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append(
      'redirect_uri',
      this.getRequiredConfig<string>('DISCORD_REDIRECT_URI'),
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://discord.com/api/oauth2/token', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Error sending message', error.response?.data);
      } else {
        this.logger.error('Error sending message', error);
      }
      throw error;
    }
  }

  // 3. Send Message (Using Bot Token for reliability)
  async sendMessage(channelId: string, content: string): Promise<any> {
    const botToken = this.getRequiredConfig<string>('DISCORD_BOT_TOKEN');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://discord.com/api/v10/channels/${channelId}/messages`,
          { content },
          {
            headers: {
              Authorization: `Bot ${botToken}`, // Use 'Bearer <access_token>' only if using user token (limited)
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Error sending message', error.response?.data);
      } else {
        this.logger.error('Error sending message', error);
      }
      throw error;
    }
  }
}
