import axios from 'axios';

import {
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import type { ParameterDefinition } from '@/common/service.types';

export class GithubCreatePullRequest extends ServiceReactionDefinition {
  name = 'github.create_pull_request';
  label = 'Create Pull Request';
  description = 'Creates a pull request between branches';

  input_params: ParameterDefinition[] = [
    {
      name: 'repository',
      type: ParameterType.STRING,
      label: 'Repository (owner/repo)',
      description: 'The repository where to create the PR',
      required: true,
    },
    {
      name: 'title',
      type: ParameterType.STRING,
      label: 'Title',
      description: 'PR title',
      required: true,
    },
    {
      name: 'head',
      type: ParameterType.STRING,
      label: 'Head branch',
      description:
        'Branch name (or branch name with owner) that contains your changes',
      required: true,
    },
    {
      name: 'base',
      type: ParameterType.STRING,
      label: 'Base branch',
      description: 'Branch name you want to merge into',
      required: true,
    },
    {
      name: 'body',
      type: ParameterType.STRING,
      label: 'Body',
      description: 'PR description',
      required: false,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    let repo = params.repository?.value as string;
    if (repo && repo.endsWith('/')) repo = repo.slice(0, -1);
    const title = params.title?.value as string;
    const head = params.head?.value as string;
    const base = params.base?.value as string;
    const body = params.body?.value as string;

    if (!accessToken) throw new Error('Missing GitHub access token');
    if (!repo || !title || !head || !base)
      throw new Error('Missing parameters to create PR');

    try {
      await axios.post(
        `https://api.github.com/repos/${repo}/pulls`,
        { title, head, base, body: body || '' },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `GitHub API error: ${JSON.stringify(error.response?.data || error.message)}`,
        );
      }
      throw new Error(`GitHub API error: ${(error as Error).message}`);
    }
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
