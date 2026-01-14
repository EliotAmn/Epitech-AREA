import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import {
  OAuthError,
  OAuthErrorCode,
  parseOAuthError,
} from './token-refresh.errors';
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
      } else if (serviceName === 'airtable') {
        tokenResponse = await this.refreshAirtableToken(refreshToken);
      } else {
        throw new Error(
          `Token refresh not supported for service: ${serviceName}`,
        );
      }

      // Calculate new expiry date
      const expiresAt = tokenResponse.expires_in
        ? new Date(Date.now() + tokenResponse.expires_in * 1000)
        : null;

      // Update database with new tokens
      await this.userServiceRepository.updateTokens(userServiceId, {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token ?? refreshToken, // Use new refresh token if provided, otherwise keep existing
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

      // Parse and throw structured OAuth error
      if (axios.isAxiosError(error)) {
        const errorCode = parseOAuthError(error);
        throw new OAuthError(
          errorCode,
          `Failed to refresh ${serviceName} token: ${error.message}`,
          error,
        );
      }

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
      throw new OAuthError(
        OAuthErrorCode.CREDENTIALS_NOT_CONFIGURED,
        'Google OAuth credentials not configured',
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await axios.post<{
      access_token: string;
      expires_in?: number;
      refresh_token?: string;
    }>('https://oauth2.googleapis.com/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

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
      throw new OAuthError(
        OAuthErrorCode.CREDENTIALS_NOT_CONFIGURED,
        'GitHub OAuth credentials not configured',
      );
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
   * Refresh Airtable OAuth2 token
   */
  private async refreshAirtableToken(
    refreshToken: string,
  ): Promise<TokenRefreshResult> {
    const clientId = this.configService.get<string>('AIRTABLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'AIRTABLE_CLIENT_SECRET',
    );

    if (!clientId || !clientSecret) {
      throw new OAuthError(
        OAuthErrorCode.CREDENTIALS_NOT_CONFIGURED,
        'Airtable OAuth credentials not configured',
      );
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );

    const formData = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await axios.post<{
      access_token: string;
      token_type: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
    }>('https://airtable.com/oauth2/v1/token', formData, {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
      refresh_token: response.data.refresh_token,
    };
  }

  /**
   * Ensure a valid access token is available, refreshing if necessary
   *
   * @param userId - The ID of the user
   * @param serviceName - The name of the service (e.g., 'google', 'github')
   * @returns A Promise that resolves to:
   *   - `string`: A valid access token (either existing or freshly refreshed)
   *   - `null`: When the user service doesn't exist or doesn't use OAuth tokens
   *     (e.g., Discord bot tokens that don't expire)
   * @throws {OAuthError} When the token is expired but no refresh token is available
   *   (error code: REFRESH_NOT_SUPPORTED)
   * @throws {OAuthError} When token refresh fails due to invalid/expired refresh token
   *   or OAuth provider errors
   *
   * @example
   * ```typescript
   * // Returns valid token or refreshes if expired
   * const token = await ensureValidToken(userId, 'google');
   *
   * // Returns null for services without OAuth
   * const token = await ensureValidToken(userId, 'discord'); // null
   * ```
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
      throw new OAuthError(
        OAuthErrorCode.REFRESH_NOT_SUPPORTED,
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
