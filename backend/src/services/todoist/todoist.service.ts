import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@prisma/client';
import axios, { AxiosError } from 'axios';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { TodoistTaskCreated } from './actions/task-created';
import { TodoistAddComment } from './reactions/add-comment';

interface TodoistTokenResponse {
  access_token: string;
  token_type: string;
}

interface TodoistErrorResponse {
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

  const redirectUri = buildServiceRedirectUrl('todoist');

  const formData = new URLSearchParams();
  formData.append('code', authorizationCode);
  formData.append('redirect_uri', redirectUri);
  formData.append('client_id', process.env.TODOIST_CLIENT_ID!);
  formData.append('client_secret', process.env.TODOIST_CLIENT_SECRET!);

  try {
    const res = await axios.post<TodoistTokenResponse>(
      'https://todoist.com/oauth/access_token',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      },
    );

    if (res.status !== 200)
      throw new UnauthorizedException(
        'Failed to exchange authorization code for tokens',
      );

    const tokens = res.data;
    const accessToken = tokens.access_token;

    userService.service_config = {
      ...((userService.service_config as object) || {}),
      access_token: accessToken,
    };
  } catch (err) {
    const axiosError = err as AxiosError<TodoistErrorResponse>;
    const errorMessage =
      axiosError.response?.data.error_description ||
      'Unknown error during Todoist OAuth';
    throw new Error(errorMessage);
  }

  return true;
}

export default class TodoistService implements ServiceDefinition {
  name = 'todoist';
  label = 'Todoist';
  color = '#E44332';
  logo = 'https://drivercentral.io/images/detailed/4/original_icon.png';
  mandatory_env_vars = ['TODOIST_CLIENT_ID', 'TODOIST_CLIENT_SECRET'];
  oauth_url = buildUrlParameters('https://todoist.com/oauth/authorize', {
    client_id: process.env.TODOIST_CLIENT_ID!,
    redirect_uri: buildServiceRedirectUrl('todoist'),
    scope: 'data:read_write',
  });
  oauth_callback = oauth_callback;
  description =
    'Todoist is a task management app that helps you organize work and life. Create tasks, set due dates, and collaborate with your team.';
  actions = [TodoistTaskCreated];
  reactions = [TodoistAddComment];
}
