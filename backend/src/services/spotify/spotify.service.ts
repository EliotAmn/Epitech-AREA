import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@prisma/client';
import axios, { AxiosError } from 'axios';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { PlayingStateUpdated } from '@/services/spotify/actions/playing-state-updated';

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
  if (!authorizationCode)
    throw new BadRequestException('Authorization code is missing');

  const redirectUri = buildServiceRedirectUrl('spotify');

  // Call spotify with the authorization code and userId to exchange for tokens
  const formData = new URLSearchParams();
  formData.append('code', authorizationCode);
  formData.append('redirect_uri', redirectUri);
  formData.append('grant_type', 'authorization_code');
  formData.append('client_id', process.env.SPOTIFY_CLIENT_ID!);
  formData.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET!);

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

    if (res.status !== 200)
      throw new UnauthorizedException(
        'Failed to exchange authorization code for tokens',
      );

    const tokens = res.data;
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    console.log('✅ Spotify OAuth successful!');

    userService.service_config = {
      ...((userService.service_config as object) || {}),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<SpotifyErrorResponse>;
    console.error('=== SPOTIFY OAUTH ERROR ===');
    console.error('Error response:', axiosError.response?.data);
    console.error('Error status:', axiosError.response?.status);
    console.error('Error message:', axiosError.message);
    console.error('========================');

    const errorDetail =
      axiosError.response?.data?.error_description || axiosError.message;
    throw new UnauthorizedException(`Spotify OAuth failed: ${errorDetail}`);
  }

  return true;
}

export default class SpotifyService implements ServiceDefinition {
  name = 'spotify';
  label = 'Spotify';
  color = '#1DB954';
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
  actions = [PlayingStateUpdated];
  reactions = [];
}
