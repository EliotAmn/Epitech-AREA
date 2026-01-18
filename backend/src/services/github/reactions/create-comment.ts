import axios from 'axios';

import {
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import type { ParameterDefinition } from '@/common/service.types';

export class GithubCreateComment extends ServiceReactionDefinition {
  name = 'github.create_comment';
  label = 'Create Comment';
  description = 'Creates a comment on an issue or pull request';

  input_params: ParameterDefinition[] = [
    {
      name: 'repository',
      type: ParameterType.STRING,
      label: 'Repository (owner/repo)',
      description: 'The repository where to create the comment',
      required: true,
    },
    {
      name: 'issue_number',
      type: ParameterType.STRING,
      label: 'Issue / PR Number',
      description: 'Issue or PR number to comment on',
      required: true,
    },
    {
      name: 'body',
      type: ParameterType.STRING,
      label: 'Comment Body',
      description: 'Comment text to post',
      required: true,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    let repo = params.repository?.value as string;
    if (repo && repo.endsWith('/')) repo = repo.slice(0, -1);
    const issueNumber = params.issue_number?.value as string;
    const body = params.body?.value as string;

    if (!accessToken) throw new Error('Missing GitHub access token');
    if (!repo || !issueNumber || !body)
      throw new Error('Missing parameters for creating comment');

    try {
      await axios.post(
        `https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`,
        { body },
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
