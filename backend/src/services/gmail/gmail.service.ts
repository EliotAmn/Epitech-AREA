import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { UserService } from '@prisma/client';
import axios from 'axios';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { GmailEmailReceived } from './actions/email-received';
import { SendEmailReaction } from './reactions/send-email.reaction';

interface GmailTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

async function oauth_callback(
  userService: UserService,
  params: { [key: string]: string },
): Promise<boolean> {
  const authorizationCode = params.code as string | undefined;
  if (!authorizationCode)
    throw new BadRequestException('Authorization code is missing');

  const redirectUri = buildServiceRedirectUrl('gmail');

  const formData = new URLSearchParams();
  formData.append('code', authorizationCode);
  formData.append('redirect_uri', redirectUri);
  formData.append('client_id', process.env.GOOGLE_CLIENT_ID!);
  formData.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
  formData.append('grant_type', 'authorization_code');

  try {
    const res = await axios.post<GmailTokenResponse>(
      'https://oauth2.googleapis.com/token',
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
    const expiresIn = tokens.expires_in;

    // Persist tokens under google_* keys for consistency with provider flow
    const existingConfig =
      (userService.service_config as Record<string, any>) || {};
    const googleExpiry =
      typeof expiresIn === 'number' ? Date.now() + expiresIn * 1000 : undefined;

    const newConfig = {
      ...existingConfig,
      ...(accessToken ? { google_access_token: accessToken } : {}),
      ...(refreshToken ? { google_refresh_token: refreshToken } : {}),
      ...(googleExpiry ? { google_token_expires_at: googleExpiry } : {}),
      // Keep generic keys for backward compatibility
      ...(accessToken ? { access_token: accessToken } : {}),
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    };

    userService.service_config = newConfig;
    userService.access_token = accessToken;
    if (refreshToken) {
      userService.refresh_token = refreshToken;
    }
    if (expiresIn) {
      userService.token_expires_at = new Date(Date.now() + expiresIn * 1000);
    }

    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    throw new UnauthorizedException(
      'Failed to exchange authorization code for tokens',
      errorMessage,
    );
  }
}

export default class GmailService implements ServiceDefinition {
  name = 'gmail';
  label = 'Gmail';
  color = '#EA4335';
  logo = 'https://img.icons8.com/ios_filled/512/FFFFFF/gmail-new.png';
  description =
    'Send emails on behalf of a user authenticated via Google OAuth';
  oauth_callback = oauth_callback;
  actions = [GmailEmailReceived];
  reactions = [SendEmailReaction];
  oauth_url = process.env.GOOGLE_CLIENT_ID
    ? buildUrlParameters('https://accounts.google.com/o/oauth2/v2/auth', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: buildServiceRedirectUrl('gmail'),
        response_type: 'code',
        scope:
          'email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
        access_type: 'offline',
        prompt: 'consent',
      })
    : '';
}
