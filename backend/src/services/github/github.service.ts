import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@prisma/client';
import axios, { AxiosError } from 'axios';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { GithubNewCommit } from './actions/new-commit';
import { GithubCreateIssue } from './reactions/create-issue'; // Import reaction

interface GithubTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface GithubErrorResponse {
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

  const redirectUri = buildServiceRedirectUrl('github');

  const formData = new URLSearchParams();
  formData.append('code', authorizationCode);
  formData.append('redirect_uri', redirectUri);
  formData.append('client_id', process.env.GITHUB_CLIENT_ID!);
  formData.append('client_secret', process.env.GITHUB_CLIENT_SECRET!);

  try {
    const res = await axios.post<GithubTokenResponse>(
      'https://github.com/login/oauth/access_token',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      },
    );

    if (res.status != 200)
      throw new UnauthorizedException(
        'Failed to exchange authorization code for tokens',
      );

    const tokens = res.data;
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    userService.service_config = {
      ...((userService.service_config as object) || {}),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  } catch (err) {
    const axiosError = err as AxiosError<GithubErrorResponse>;
    const errorMessage =
      axiosError.response?.data.error_description ||
      'Unknown error during GitHub OAuth';
    throw new Error(errorMessage);
  }

  return true;
}

export default class GithubService implements ServiceDefinition {
  name = 'github';
  label = 'Github';
  color = '#181717';
  logo =
    'https://camo.githubusercontent.com/285c02f902be30b9fca74a05d71d8fbd45658be33c5b99fb340ff8f78b3d1e51/68747470733a2f2f6564656e742e6769746875622e696f2f537570657254696e7949636f6e732f696d616765732f7376672f6769746875622e737667';
  mandatory_env_vars = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'];
  oauth_url = buildUrlParameters('https://github.com/login/oauth/authorize', {
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: buildServiceRedirectUrl('github'),
    scope: 'admin:repo_hook repo user',
  });
  oauth_callback = oauth_callback;
  description =
    'GitHub is a development platform inspired by the way you work. From open source to business, you can host and review code, manage projects, and build software alongside millions of developers.';
  actions = [GithubNewCommit];
  reactions = [GithubCreateIssue];
}
