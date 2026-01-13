import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { FieldValueChanged } from '@/services/airtable/actions/field-value-changed';
import { RecordCreated } from '@/services/airtable/actions/record-created';
import { RecordUpdated } from '@/services/airtable/actions/record-updated';
import { CreateRecord } from '@/services/airtable/reactions/create-record';
import { DeleteRecord } from '@/services/airtable/reactions/delete-record';
import { UpdateRecord } from '@/services/airtable/reactions/update-record';

const logger = new Logger('AirtableService');

// Store PKCE code_verifier mapped by state
const pkceStore = new Map<string, { verifier: string; timestamp: number }>();

// Clean up old PKCE entries (older than 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of pkceStore.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) {
      pkceStore.delete(state);
    }
  }
}, 60 * 1000); // Run every minute

interface AirtableTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

interface AirtableErrorResponse {
  error: string;
  error_description?: string;
}

async function oauth_callback(
  userService: UserService,
  params: { [key: string]: string },
): Promise<boolean> {
  const authorizationCode = params.code as string | undefined;
  const state = params.state as string | undefined;

  logger.debug(`OAuth callback received for user ${userService.user_id}`);
  logger.debug(`Authorization code present: ${!!authorizationCode}`);
  logger.debug(`State present: ${!!state}`);

  if (!authorizationCode)
    throw new BadRequestException('Authorization code is missing');

  if (!state) throw new BadRequestException('State parameter is missing');

  // Retrieve code_verifier from PKCE store
  const pkceData = pkceStore.get(state);
  if (!pkceData) {
    throw new BadRequestException('Invalid or expired state parameter');
  }

  const codeVerifier = pkceData.verifier;
  pkceStore.delete(state); // Clean up after use

  const redirectUri = buildServiceRedirectUrl('airtable');
  logger.debug(`Redirect URI: ${redirectUri}`);

  // Exchange authorization code for tokens
  const credentials = Buffer.from(
    `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`,
  ).toString('base64');

  const formData = new URLSearchParams();
  formData.append('grant_type', 'authorization_code');
  formData.append('code', authorizationCode);
  formData.append('redirect_uri', redirectUri);
  formData.append('code_verifier', codeVerifier);

  logger.debug('Exchanging authorization code for tokens...');

  try {
    const res = await axios.post<AirtableTokenResponse>(
      'https://airtable.com/oauth2/v1/token',
      formData,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
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

    userService.service_config = {
      ...((userService.service_config as object) || {}),
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: tokens.expires_in,
      token_obtained_at: Date.now(),
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<AirtableErrorResponse>;
    logger.error('OAuth token exchange failed');
    logger.error(
      `Error response: ${JSON.stringify(axiosError.response?.data)}`,
    );
    logger.error(`Error status: ${axiosError.response?.status}`);
    logger.error(`Error message: ${axiosError.message}`);

    const errorDetail =
      axiosError.response?.data?.error_description || axiosError.message;
    throw new UnauthorizedException(`Airtable OAuth failed: ${errorDetail}`);
  }

  return true;
}

function generatePKCE(): {
  verifier: string;
  challenge: string;
  state: string;
} {
  // Generate code_verifier (43-128 characters)
  const verifier = crypto.randomBytes(32).toString('base64url');

  // Generate code_challenge = base64url(sha256(code_verifier))
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');

  // Generate state (16+ characters)
  const state = crypto.randomBytes(16).toString('base64url');

  return { verifier, challenge, state };
}

export default class AirtableService implements ServiceDefinition {
  name = 'airtable';
  label = 'Airtable';
  color = '#a4e5ff';
  logo = 'https://logosandtypes.com/wp-content/uploads/2022/04/airtable.svg';
  mandatory_env_vars = ['AIRTABLE_CLIENT_ID', 'AIRTABLE_CLIENT_SECRET'];

  get oauth_url(): string {
    const { verifier, challenge, state } = generatePKCE();

    // Store verifier for later use in callback
    pkceStore.set(state, { verifier, timestamp: Date.now() });

    return buildUrlParameters('https://airtable.com/oauth2/v1/authorize', {
      client_id: process.env.AIRTABLE_CLIENT_ID!,
      response_type: 'code',
      redirect_uri: buildServiceRedirectUrl('airtable'),
      scope:
        'data.records:read data.records:write schema.bases:read schema.bases:write',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
  }

  oauth_callback = oauth_callback;
  description =
    'Connect your Airtable workspace to automate database operations, create and update records dynamically.';
  actions = [RecordCreated, RecordUpdated, FieldValueChanged];
  reactions = [CreateRecord, UpdateRecord, DeleteRecord];
}
