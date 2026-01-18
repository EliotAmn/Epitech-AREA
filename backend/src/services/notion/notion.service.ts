import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@prisma/client';
import axios, { AxiosError } from 'axios';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { PageCreated } from '@/services/notion/actions/page-created';
import { PageUpdated } from '@/services/notion/actions/page-updated';
import { AddCommentReaction } from '@/services/notion/reactions/add-comment.reaction';
import { ArchivePageReaction } from '@/services/notion/reactions/archive-page.reaction';
import { CreatePageReaction } from '@/services/notion/reactions/create-page.reaction';
import { UpdatePageReaction } from '@/services/notion/reactions/update-page.reaction';

const logger = new Logger('NotionService');

interface NotionTokenResponse {
  access_token: string;
  token_type: string;
  bot_id: string;
  workspace_id: string;
  workspace_name?: string;
  workspace_icon?: string;
  owner?: {
    type: string;
    user?: {
      object: string;
      id: string;
    };
  };
}

interface NotionErrorResponse {
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

  const redirectUri = buildServiceRedirectUrl('notion');

  // Exchange authorization code for access token
  const authString = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_SECRET}`,
  ).toString('base64');

  try {
    const res = await axios.post<NotionTokenResponse>(
      'https://api.notion.com/v1/oauth/token',
      {
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (res.status !== 200)
      throw new UnauthorizedException(
        'Failed to exchange authorization code for tokens',
      );

    const tokens = res.data;
    const accessToken = tokens.access_token;

    logger.log('✅ Notion OAuth successful!');

    // Store access token and other details in user's service config

    userService.service_config = {
      ...((userService.service_config as object) || {}),
      access_token: accessToken,
      workspace_id: tokens.workspace_id,
      bot_id: tokens.bot_id,
    };
    userService.access_token = accessToken;
  } catch (error: unknown) {
    // Handle Axios errors specifically
    if (axios.isAxiosError<NotionErrorResponse>(error)) {
      const axiosError = error as AxiosError<NotionErrorResponse>;
      logger.error('=== NOTION OAUTH ERROR ===');
      logger.error('Error response:', axiosError.response?.data);
      logger.error('Error status:', axiosError.response?.status);
      logger.error('Error message:', axiosError.message);
      logger.error('========================');
      const errorDetail =
        axiosError.response?.data?.error_description || axiosError.message;
      throw new UnauthorizedException(`Notion OAuth failed: ${errorDetail}`);
    }
    // Re-throw known HTTP exceptions so they are not masked
    if (
      error instanceof UnauthorizedException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }
    // Fallback for unexpected non-Axios errors
    logger.error('=== NOTION OAUTH UNEXPECTED ERROR ===');
    logger.error('Error:', error);
    logger.error('====================================');
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error during Notion OAuth';
    throw new UnauthorizedException(`Notion OAuth failed: ${message}`);
  }

  return true;
}

export default class NotionService implements ServiceDefinition {
  name = 'notion';
  label = 'Notion';
  mandatory_env_vars = ['NOTION_CLIENT_ID', 'NOTION_SECRET'];
  oauth_url = buildUrlParameters('https://api.notion.com/v1/oauth/authorize', {
    client_id: process.env.NOTION_CLIENT_ID!,
    response_type: 'code',
    owner: 'user',
    redirect_uri: buildServiceRedirectUrl('notion'),
  });
  oauth_callback = oauth_callback;
  logo =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/3840px-Notion-logo.svg.png';
  color = '#373530';
  description =
    'Connect your Notion workspace to automate tasks and integrate with your notes, databases, and pages.';
  actions = [PageCreated, PageUpdated];
  reactions = [
    CreatePageReaction,
    UpdatePageReaction,
    AddCommentReaction,
    ArchivePageReaction,
  ];
}
