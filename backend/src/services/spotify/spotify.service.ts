import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@prisma/client';
import axios, { AxiosError } from 'axios';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { PlayingStateUpdated } from '@/services/spotify/actions/playing-state-updated';
import { TrackChanged } from '@/services/spotify/actions/track-changed';
import { PlayPause } from '@/services/spotify/reactions/play-pause';
import { SetVolume } from '@/services/spotify/reactions/set-volume';
import { SkipTrack } from '@/services/spotify/reactions/skip-track';

const logger = new Logger('SpotifyService');

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface SpotifyErrorResponse {
  error: string;
  error_description?: string;
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

  const redirectUri = buildServiceRedirectUrl('spotify');
  logger.debug(`Redirect URI: ${redirectUri}`);

  // Call spotify with the authorization code and userId to exchange for tokens
  const formData = new URLSearchParams();
  formData.append('code', authorizationCode);
  formData.append('redirect_uri', redirectUri);
  formData.append('grant_type', 'authorization_code');
  formData.append('client_id', process.env.SPOTIFY_CLIENT_ID!);
  formData.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET!);

  logger.debug('Exchanging authorization code for tokens...');

  try {
    const res = await axios.post<SpotifyTokenResponse>(
      'https://accounts.spotify.com/api/token',
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
    const expiresIn = tokens.expires_in;

    logger.log(`OAuth successful for user ${userService.user_id}`);
    logger.debug(`Access token received: ${!!accessToken}`);
    logger.debug(`Refresh token received: ${!!refreshToken}`);

    userService.service_config = {
      ...((userService.service_config as object) || {}),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    userService.access_token = accessToken;
    if (refreshToken) {
      userService.refresh_token = refreshToken;
    }
    if (expiresIn) {
      userService.token_expires_at = new Date(Date.now() + expiresIn * 1000);
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<SpotifyErrorResponse>;
    logger.error('OAuth token exchange failed');
    logger.error(
      `Error response: ${JSON.stringify(axiosError.response?.data)}`,
    );
    logger.error(`Error status: ${axiosError.response?.status}`);
    logger.error(`Error message: ${axiosError.message}`);

    const errorDetail =
      axiosError.response?.data?.error_description || axiosError.message;
    throw new UnauthorizedException(`Spotify OAuth failed: ${errorDetail}`);
  }

  return true;
}

export default class SpotifyService implements ServiceDefinition {
  name = 'spotify';
  label = 'Spotify';
  color = '#1ED760';
  logo =
    'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_White.png';
  mandatory_env_vars = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
  oauth_url = buildUrlParameters('https://accounts.spotify.com/authorize', {
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: buildServiceRedirectUrl('spotify'),
    scope:
      'user-read-playback-state user-modify-playback-state user-read-currently-playing',
  });
  oauth_callback = oauth_callback;
  description =
    'Connect your Spotify account to automate music-related tasks and enhance your listening experience.';
  actions = [PlayingStateUpdated, TrackChanged];
  reactions = [PlayPause, SkipTrack, SetVolume];
}
