import axios, { AxiosError } from 'axios';
import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ServiceDefinition,
  ServiceActionConstructor,
  ServiceReactionConstructor,
} from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { UserService } from '@prisma/client';
import { TaskCreated } from '@/services/clickup/actions/task-created';
import { TaskUpdated } from '@/services/clickup/actions/task-updated';
import { CreateTaskReaction } from '@/services/clickup/reactions/create-task.reaction';
import { UpdateTaskReaction } from '@/services/clickup/reactions/update-task.reaction';
import { AddCommentReaction } from '@/services/clickup/reactions/add-comment.reaction';
import { ChangeStatusReaction } from '@/services/clickup/reactions/change-status.reaction';

const logger = new Logger('ClickUpService');

interface ClickUpTokenResponse {
  access_token: string;
}

interface ClickUpErrorResponse {
  err?: string;
  ECODE?: string;
}

async function oauth_callback(
  userService: UserService,
  params: { [key: string]: string },
): Promise<boolean> {
  const authorizationCode = params.code as string | undefined;

  if (!authorizationCode)
    throw new BadRequestException('Authorization code is missing');

  const redirectUri = buildServiceRedirectUrl('clickup');

  try {
    const res = await axios.post<ClickUpTokenResponse>(
      'https://api.clickup.com/api/v2/oauth/token',
      {
        client_id: process.env.CLICKUP_CLIENT_ID,
        client_secret: process.env.CLICKUP_CLIENT_SECRET,
        code: authorizationCode,
      },
      {
        params: {
          redirect_uri: redirectUri,
        },
        headers: {
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

    logger.log('✅ ClickUp OAuth successful!');

    // Store access token in user's service config
    // Note: ClickUp access tokens do not expire and no refresh token is provided
    userService.service_config = {
      ...((userService.service_config as object) || {}),
      access_token: accessToken,
    };
  } catch (error: unknown) {
    // Handle Axios errors specifically
    if (axios.isAxiosError<ClickUpErrorResponse>(error)) {
      const axiosError = error as AxiosError<ClickUpErrorResponse>;
      logger.error('=== CLICKUP OAUTH ERROR ===');
      logger.error('Error response:', axiosError.response?.data);
      logger.error('Error status:', axiosError.response?.status);
      logger.error('Error message:', axiosError.message);
      logger.error('===========================');
      throw new UnauthorizedException(
        `ClickUp OAuth failed: ${axiosError.response?.data?.err || axiosError.message}`,
      );
    }
    // Re-throw known HTTP exceptions so they are not masked
    if (
      error instanceof UnauthorizedException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }
    // Fallback for unexpected non-Axios errors
    logger.error('=== CLICKUP OAUTH UNEXPECTED ERROR ===');
    logger.error('Error:', error);
    logger.error('=====================================');
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error during ClickUp OAuth';
    throw new UnauthorizedException(`ClickUp OAuth failed: ${message}`);
  }

  return true;
}

export default class ClickUpService implements ServiceDefinition {
  name = 'clickup';
  label = 'ClickUp';
  mandatory_env_vars = ['CLICKUP_CLIENT_ID', 'CLICKUP_CLIENT_SECRET'];
  oauth_url = buildUrlParameters('https://app.clickup.com/api', {
    client_id: process.env.CLICKUP_CLIENT_ID!,
    redirect_uri: buildServiceRedirectUrl('clickup'),
  });
  oauth_callback = oauth_callback;
  logo =
    'https://cdn.brandfetch.io/idU6lzwMYA/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B';
  color = '#7B68EE';
  description =
    'Connect your ClickUp workspace to automate task management and project workflows.';
  actions: ServiceActionConstructor[] = [TaskCreated, TaskUpdated];
  reactions: ServiceReactionConstructor[] = [
    CreateTaskReaction,
    UpdateTaskReaction,
    AddCommentReaction,
    ChangeStatusReaction,
  ];
}
