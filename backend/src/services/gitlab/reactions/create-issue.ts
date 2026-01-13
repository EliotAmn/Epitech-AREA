import axios from 'axios';

import {
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';
import type { ParameterDefinition } from '@/common/service.types';

interface GitLabIssueResponse {
  web_url: string;
  [key: string]: unknown;
}

export class GitlabCreateIssue extends ServiceReactionDefinition {
  name = 'gitlab.create_issue';
  label = 'Create new issue';
  description = 'Creates a new issue in a GitLab repository';

  input_params: ParameterDefinition[] = [
    {
      name: 'repository',
      type: ParameterType.STRING,
      label: 'Project ID',
      description: 'The GitLab project ID (numeric, found in project settings)',
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
    const projectId = params.repository?.value as string;
    const title = params.title?.value as string;
    const body = params.body?.value as string;

    if (!accessToken) {
      throw new Error('Missing GitLab access token');
    }
    if (!projectId || !title) {
      throw new Error('Missing project ID or title for GitLab issue');
    }

    try {
      console.log(`[GitLab] Creating issue in project ID: ${projectId}`);

      const response = await axios.post<GitLabIssueResponse>(
        `https://gitlab.com/api/v4/projects/${projectId}/issues`,
        {
          title: title,
          description: body || '',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log(
        `[GitLab] Issue created successfully in project ${projectId}:`,
        response.data.web_url,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData: unknown = error.response?.data;
        console.error(`[GitLab] API error for project '${projectId}':`, {
          status: error.response?.status,
          data: errorData,
          url: error.config?.url,
        });
        throw new Error(
          `GitLab API error: ${JSON.stringify(errorData || error.message)}`,
        );
      }
      throw new Error(
        `GitLab API error: ${JSON.stringify((error as Error).message || error)}`,
      );
    }
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
