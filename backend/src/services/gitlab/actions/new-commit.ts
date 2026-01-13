import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface GitlabCommit {
  id: string;
  short_id: string;
  title: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  web_url: string;
}

export class GitlabNewCommit extends ServiceActionDefinition {
  name = 'gitlab.new_commit';
  label = 'New Commit on Repository';
  description = 'Triggers when a new commit is pushed to a specific repository';
  poll_interval = 60;

  input_params: ParameterDefinition[] = [
    {
      name: 'repository',
      type: ParameterType.STRING,
      label: 'Project ID',
      description: 'The GitLab project ID (numeric, found in project settings)',
      required: true,
    },
    {
      name: 'branch',
      type: ParameterType.STRING,
      label: 'Branch',
      description: 'The branch to watch (defaults to main)',
      required: false,
    },
  ];

  output_params: ParameterDefinition[] = [
    {
      name: 'commit_message',
      type: ParameterType.STRING,
      label: 'Commit Message',
      description: 'The message of the new commit',
      required: true,
    },
    {
      name: 'commit_author',
      type: ParameterType.STRING,
      label: 'Author Name',
      description: 'The name of the author',
      required: true,
    },
    {
      name: 'commit_url',
      type: ParameterType.STRING,
      label: 'Commit URL',
      description: 'Link to the commit on GitLab',
      required: true,
    },
    {
      name: 'commit_sha',
      type: ParameterType.STRING,
      label: 'Commit SHA',
      description: 'The hash of the commit',
      required: true,
    },
  ];

  async reload_cache(sconf: ServiceConfig): Promise<Record<string, unknown>> {
    const accessToken = sconf.config.access_token as string | undefined;
    const projectId = sconf.config.repository as string;
    const branch = (sconf.config.branch as string) || 'main';

    if (!accessToken || !projectId) {
      return { lastCommitSha: null };
    }

    try {
      const resp = await axios.get<GitlabCommit[]>(
        `https://gitlab.com/api/v4/projects/${projectId}/repository/commits`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            ref_name: branch,
            per_page: 1,
          },
        },
      );

      if (resp.data && resp.data.length > 0) {
        return { lastCommitSha: resp.data[0].id };
      }
    } catch {
      return { triggered: false, parameters: {} };
    }
    return { lastCommitSha: null };
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    const projectId = sconf.config.repository as string;
    const branch = (sconf.config.branch as string) || 'main';

    if (!accessToken || !projectId) {
      return { triggered: false, parameters: {} };
    }

    const lastSha = sconf.cache?.lastCommitSha as string | null;

    try {
      const resp = await axios.get<GitlabCommit[]>(
        `https://gitlab.com/api/v4/projects/${projectId}/repository/commits`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            ref_name: branch,
            per_page: 1,
          },
        },
      );

      const latestCommit = resp.data[0];

      if (!latestCommit) {
        return { triggered: false, parameters: {} };
      }

      if (lastSha === latestCommit.id) {
        return { triggered: false, parameters: {} };
      }

      if (!lastSha) {
        return {
          triggered: false,
          parameters: {},
          cache: { lastCommitSha: latestCommit.id },
        };
      }

      return {
        triggered: true,
        parameters: {
          commit_message: {
            type: ParameterType.STRING,
            value: latestCommit.message,
          },
          commit_author: {
            type: ParameterType.STRING,
            value: latestCommit.author_name,
          },
          commit_url: {
            type: ParameterType.STRING,
            value: latestCommit.web_url,
          },
          commit_sha: {
            type: ParameterType.STRING,
            value: latestCommit.id,
          },
        },
        cache: { lastCommitSha: latestCommit.id },
      };
    } catch {
      return { triggered: false, parameters: {} };
    }
  }
}
