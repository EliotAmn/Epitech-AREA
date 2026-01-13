import axios from 'axios';

import {
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import type { ParameterDefinition } from '@/common/service.types';

export class GithubCreateIssue extends ServiceReactionDefinition {
  name = 'github.create_issue';
  label = 'Create Issue';
  description = 'Creates a new issue in a GitHub repository';

  input_params: ParameterDefinition[] = [
    {
      name: 'repository',
      type: ParameterType.STRING,
      label: 'Repository (owner/repo)',
      description:
        'The repository where to create the issue (e.g. facebook/react)',
      required: true,
    },
    {
      name: 'title',
      type: ParameterType.STRING,
      label: 'Issue Title',
      description: 'The title of the issue',
      required: true,
    },
    {
      name: 'body',
      type: ParameterType.STRING,
      label: 'Issue Body',
      description: 'The content/description of the issue',
      required: false,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    let repo = params.repository?.value as string;
    if (repo && repo.endsWith('/')) {
      repo = repo.slice(0, -1);
    }
    const title = params.title?.value as string;
    const body = params.body?.value as string;

    if (!accessToken) {
      throw new Error('Missing GitHub access token');
    }
    if (!repo || !title) {
      throw new Error('Missing repository or title for GitHub issue');
    }

    try {
      await axios.post(
        `https://api.github.com/repos/${repo}/issues`,
        {
          title: title,
          body: body || '',
        },
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
      throw new Error(
        `GitHub API error: ${JSON.stringify((error as Error).message || error)}`,
      );
    }
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
