import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@prisma/client';
import axios, { AxiosError } from 'axios';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { CardCreated } from '@/services/trello/actions/card-created';
import { CardMoved } from '@/services/trello/actions/card-moved';
import { AddComment } from '@/services/trello/reactions/add-comment';
import { CreateCard } from '@/services/trello/reactions/create-card';

const logger = new Logger('TrelloService');

interface TrelloErrorResponse {
  error: string;
  error_description?: string;
}

async function oauth_callback(
  userService: UserService,
  params: { [key: string]: string },
): Promise<boolean> {
  logger.debug(`OAuth callback received for user ${userService.user_id}`);
  logger.debug(`Params received: ${JSON.stringify(params)}`);

  // Trello uses client-side token flow - token comes directly in URL fragment
  const token = params.token as string | undefined;

  if (!token) {
    logger.error('No token received from Trello');
    throw new BadRequestException(
      'Token is missing. Trello authorization may have been denied.',
    );
  }

  logger.log(`Token received for user ${userService.user_id}`);
  logger.debug(`Token present: ${!!token}`);

  // Verify the token works by making a test API call
  try {
    const apiKey = process.env.TRELLO_API_KEY;
    await axios.get('https://api.trello.com/1/members/me', {
      params: {
        key: apiKey,
        token: token,
      },
    });

    logger.log(`Token verified successfully for user ${userService.user_id}`);
  } catch (error: unknown) {
    const axiosError = error as AxiosError<TrelloErrorResponse>;
    logger.error('Token verification failed');
    logger.error(`Error: ${JSON.stringify(axiosError.response?.data)}`);
    throw new UnauthorizedException('Invalid Trello token');
  }

  userService.service_config = {
    ...((userService.service_config as object) || {}),
    access_token: token,
  };
  userService.access_token = token;

  return true;
}

export default class TrelloService implements ServiceDefinition {
  name = 'trello';
  label = 'Trello';
  color = '#0052CC';
  logo = 'https://cdn.worldvectorlogo.com/logos/trello.svg';
  mandatory_env_vars = ['TRELLO_API_KEY', 'TRELLO_API_SECRET'];
  oauth_url = buildUrlParameters('https://trello.com/1/authorize', {
    expiration: 'never',
    name: 'AREA App',
    scope: 'read,write',
    response_type: 'token',
    key: process.env.TRELLO_API_KEY!,
    return_url: buildServiceRedirectUrl('trello'),
    callback_method: 'fragment',
  });
  oauth_callback = oauth_callback;
  description =
    'Connect your Trello account to automate board and card management tasks.';
  actions = [CardCreated, CardMoved];
  reactions = [CreateCard, AddComment];
}
