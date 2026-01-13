import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@prisma/client';
import axios, { AxiosError } from 'axios';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { NewFollower } from '@/services/twitch/actions/new-follower';
import { StreamStatusChanged } from '@/services/twitch/actions/stream-status-changed';

const logger = new Logger('TwitchService');

interface TwitchTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string[];
}

interface TwitchErrorResponse {
  error: string;
  message?: string;
  error_description?: string;
}

interface TwitchUserResponse {
  data: Array<{
    id: string;
    login: string;
    display_name: string;
  }>;
}

async function oauth_callback(
  userService: UserService,
  params: { [key: string]: string },
): Promise<boolean> {
  const authorizationCode = params.code as string | undefined;
  logger.debug(`OAuth callback received for user ${userService.user_id}`);
  logger.debug(`Authorization code present: ${!!authorizationCode}`);

  if (!authorizationCode)
    throw new BadRequestException('Authorization code is missing');

  const redirectUri = buildServiceRedirectUrl('twitch');
  logger.debug(`Redirect URI: ${redirectUri}`);

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  logger.debug(`Client ID present: ${!!clientId}, length: ${clientId?.length}`);
  logger.debug(
    `Client Secret present: ${!!clientSecret}, length: ${clientSecret?.length}`,
  );

  if (!clientId || !clientSecret) {
    throw new BadRequestException(
      'Twitch client credentials are not configured',
    );
  }

  const formData = new URLSearchParams();
  formData.append('code', authorizationCode);
  formData.append('redirect_uri', redirectUri);
  formData.append('grant_type', 'authorization_code');
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);

  logger.debug('Exchanging authorization code for tokens...');

  try {
    const res = await axios.post<TwitchTokenResponse>(
      'https://id.twitch.tv/oauth2/token',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    logger.debug(`Token exchange response status: ${res.status}`);

    if (res.status !== 200)
      throw new UnauthorizedException(
        'Failed to exchange authorization code for tokens',
      );

    const tokens = res.data;
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    logger.log(`OAuth successful for user ${userService.user_id}`);
    logger.debug(`Access token received: ${!!accessToken}`);
    logger.debug(`Refresh token received: ${!!refreshToken}`);

    // Get the authenticated user's Twitch ID
    const userRes = await axios.get<TwitchUserResponse>(
      'https://api.twitch.tv/helix/users',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID!,
        },
      },
    );

    const twitchUserId = userRes.data.data[0]?.id;
    const twitchLogin = userRes.data.data[0]?.login;

    logger.debug(`Twitch user ID: ${twitchUserId}, login: ${twitchLogin}`);

    userService.service_config = {
      ...((userService.service_config as object) || {}),
      access_token: accessToken,
      refresh_token: refreshToken,
      twitch_user_id: twitchUserId,
      twitch_login: twitchLogin,
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<TwitchErrorResponse>;
    logger.error('OAuth token exchange failed');
    logger.error(
      `Error response: ${JSON.stringify(axiosError.response?.data)}`,
    );
    logger.error(`Error status: ${axiosError.response?.status}`);
    logger.error(`Error message: ${axiosError.message}`);

    const errorDetail =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error_description ||
      axiosError.message;
    throw new UnauthorizedException(`Twitch OAuth failed: ${errorDetail}`);
  }

  return true;
}

export default class TwitchService implements ServiceDefinition {
  name = 'twitch';
  label = 'Twitch';
  color = '#7E58BD';
  logo = 'https://img.icons8.com/ios11/512/FFFFFF/twitch.png';
  mandatory_env_vars = ['TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET'];
  oauth_url = buildUrlParameters('https://id.twitch.tv/oauth2/authorize', {
    client_id: process.env.TWITCH_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: buildServiceRedirectUrl('twitch'),
    scope: 'user:read:follows moderator:read:followers',
  });
  oauth_callback = oauth_callback;
  description =
    'Connect your Twitch account to monitor streams and get notified about new followers.';
  actions = [StreamStatusChanged, NewFollower];
  reactions = [];
}
