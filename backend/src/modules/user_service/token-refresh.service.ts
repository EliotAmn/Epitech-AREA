import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { UserServiceRepository } from './userservice.repository';

interface TokenRefreshResult {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
}

@Injectable()
export class TokenRefreshService {
  private readonly logger = new Logger(TokenRefreshService.name);

  constructor(
    private readonly userServiceRepository: UserServiceRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Check if a token is expired or about to expire (within 5 minutes)
   */
  isTokenExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) {
      return false; // No expiry date means token doesn't expire (like Discord bot tokens)
    }

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    return expiresAt <= fiveMinutesFromNow;
  }

  /**
   * Refresh an OAuth2 access token using the refresh token
   */
  async refreshAccessToken(
    userServiceId: string,
    serviceName: string,
    refreshToken: string,
  ): Promise<string> {
    this.logger.debug(
      `Refreshing access token for service ${serviceName}, userService ID: ${userServiceId}`,
    );

    try {
      let tokenResponse: TokenRefreshResult;

      // Handle different OAuth providers
      if (serviceName === 'google') {
        tokenResponse = await this.refreshGoogleToken(refreshToken);
      } else if (serviceName === 'github') {
        tokenResponse = await this.refreshGithubToken(refreshToken);
      } else {
        throw new Error(`Token refresh not supported for service: ${serviceName}`);
      }

      // Calculate new expiry date
      const expiresAt = tokenResponse.expires_in
        ? new Date(Date.now() + tokenResponse.expires_in * 1000)
        : null;

      // Update database with new tokens
      await this.userServiceRepository.updateTokens(userServiceId, {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token || refreshToken, // Use new refresh token if provided
        token_expires_at: expiresAt,
      });

      this.logger.log(
        `Successfully refreshed access token for service ${serviceName}`,
      );

      return tokenResponse.access_token;
    } catch (error) {
      this.logger.error(
        `Failed to refresh token for service ${serviceName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Refresh Google OAuth2 token
   */
  private async refreshGoogleToken(
    refreshToken: string,
  ): Promise<TokenRefreshResult> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    const response = await axios.post<{
      access_token: string;
      expires_in?: number;
      refresh_token?: string;
    }>(
      'https://oauth2.googleapis.com/token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
      refresh_token: response.data.refresh_token, // Google may return a new refresh token
    };
  }

  /**
   * Refresh GitHub OAuth2 token
   */
  private async refreshGithubToken(
    refreshToken: string,
  ): Promise<TokenRefreshResult> {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth credentials not configured');
    }

    const response = await axios.post<{
      access_token: string;
      expires_in?: number;
      refresh_token?: string;
    }>(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      {
        headers: { Accept: 'application/json' },
      },
    );

    return {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
      refresh_token: response.data.refresh_token,
    };
  }

  /**
   * Ensure a valid access token is available, refreshing if necessary
   * Returns the valid access token or throws if refresh fails
   */
  async ensureValidToken(
    userId: string,
    serviceName: string,
  ): Promise<string | null> {
    const userService =
      await this.userServiceRepository.fromUserIdAndServiceName(
        userId,
        serviceName,
      );

    if (!userService) {
      this.logger.warn(
        `No user service found for user ${userId} and service ${serviceName}`,
      );
      return null;
    }

    // If service doesn't use OAuth tokens (like Discord bot), return null
    if (!userService.access_token && !userService.refresh_token) {
      return null;
    }

    // Check if token is expired
    if (!this.isTokenExpired(userService.token_expires_at)) {
      return userService.access_token;
    }

    // Token is expired, refresh it
    if (!userService.refresh_token) {
      throw new Error(
        `Access token expired but no refresh token available for service ${serviceName}`,
      );
    }

    return await this.refreshAccessToken(
      userService.id,
      serviceName,
      userService.refresh_token,
    );
  }
}
