import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@prisma/client';
import axios, { AxiosError } from 'axios';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { GitlabNewCommit } from './actions/new-commit';
import { GitlabCreateIssue } from './reactions/create-issue'; // Import reaction

interface GitlabTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface GitlabErrorResponse {
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

  const redirectUri = buildServiceRedirectUrl('gitlab');

  const formData = new URLSearchParams();
  formData.append('code', authorizationCode);
  formData.append('redirect_uri', redirectUri);
  formData.append('client_id', process.env.GITLAB_CLIENT_ID!);
  formData.append('client_secret', process.env.GITLAB_CLIENT_SECRET!);
  formData.append('grant_type', 'authorization_code');

  try {
    const res = await axios.post<GitlabTokenResponse>(
      'https://gitlab.com/oauth/token',
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
    const refreshToken = tokens.refresh_token;
    const expiresIn = tokens.expires_in;

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
  } catch (err) {
    const axiosError = err as AxiosError<GitlabErrorResponse>;
    const errorMessage =
      axiosError.response?.data.error_description ||
      'Unknown error during GitLab OAuth';
    throw new Error(errorMessage);
  }

  return true;
}

export default class GitlabService implements ServiceDefinition {
  name = 'gitlab';
  label = 'GitLab';
  color = '#FC6D26';
  logo = 'https://about.gitlab.com/images/press/press-kit-icon.svg';
  mandatory_env_vars = ['GITLAB_CLIENT_ID', 'GITLAB_CLIENT_SECRET'];
  oauth_url = buildUrlParameters('https://gitlab.com/oauth/authorize', {
    client_id: process.env.GITLAB_CLIENT_ID!,
    redirect_uri: buildServiceRedirectUrl('gitlab'),
    response_type: 'code',
    scope: 'api read_api write_repository',
  });
  oauth_callback = oauth_callback;
  description =
    'GitLab is a complete DevOps platform delivered as a single application. It provides everything you need to manage, plan, create, verify, package, secure, release, configure, monitor, and defend your projects.';
  actions = [GitlabNewCommit];
  reactions = [GitlabCreateIssue];
}
