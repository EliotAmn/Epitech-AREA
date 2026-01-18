import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface GithubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    url: string;
  };
  html_url: string;
}

export class GithubNewCommit extends ServiceActionDefinition {
  name = 'github.new_commit';
  label = 'New Commit on Repository';
  description = 'Triggers when a new commit is pushed to a specific repository';
  poll_interval = 60;

  input_params: ParameterDefinition[] = [
    {
      name: 'repository',
      type: ParameterType.STRING,
      label: 'Repository (owner/repo)',
      description: 'The repository to watch (e.g. facebook/react)',
      required: true,
    },
    {
      name: 'branch',
      type: ParameterType.SELECT,
      label: 'Branch',
      description:
        'The branch to watch (defaults to main). Select a common branch or enter a custom one in the repository field if not listed.',
      required: false,
      options: [
        { label: 'main', value: 'main' },
        { label: 'master', value: 'master' },
        { label: 'develop', value: 'develop' },
        { label: 'release', value: 'release' },
      ],
    },
    {
      name: 'branch_custom',
      type: ParameterType.STRING,
      label: 'Custom branch (optional)',
      description:
        'Specify a custom branch name if not listed in the Branch dropdown',
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
      description: 'Link to the commit on GitHub',
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
    let repo = sconf.config.repository as string;
    if (repo && repo.endsWith('/')) {
      repo = repo.slice(0, -1);
    }
    const branch = (sconf.config.branch as string) || 'main';

    if (!accessToken || !repo) {
      return { lastCommitSha: null };
    }

    try {
      const resp = await axios.get<GithubCommit[]>(
        `https://api.github.com/repos/${repo}/commits`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params: {
            sha: branch,
            per_page: 1,
          },
        },
      );

      if (resp.data && resp.data.length > 0) {
        return { lastCommitSha: resp.data[0].sha };
      }
    } catch (error) {
      console.warn(
        `[Github] Failed to fetch initial commit for ${repo}:`,
        error,
      );
    }
    return { lastCommitSha: null };
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    let repo = sconf.config.repository as string;
    if (repo && repo.endsWith('/')) {
      repo = repo.slice(0, -1);
    }
    const branch = (sconf.config.branch as string) || 'main';

    if (!accessToken || !repo) {
      return { triggered: false, parameters: {} };
    }

    const lastSha = sconf.cache?.lastCommitSha as string | null;

    try {
      const resp = await axios.get<GithubCommit[]>(
        `https://api.github.com/repos/${repo}/commits`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params: {
            sha: branch,
            per_page: 1,
          },
        },
      );

      const latestCommit = resp.data[0];

      if (!latestCommit) {
        return { triggered: false, parameters: {} };
      }

      if (lastSha === latestCommit.sha) {
        return { triggered: false, parameters: {} };
      }

      if (!lastSha) {
        return {
          triggered: false,
          parameters: {},
          cache: { lastCommitSha: latestCommit.sha },
        };
      }

      return {
        triggered: true,
        parameters: {
          commit_message: {
            type: ParameterType.STRING,
            value: latestCommit.commit.message,
          },
          commit_author: {
            type: ParameterType.STRING,
            value: latestCommit.commit.author.name,
          },
          commit_url: {
            type: ParameterType.STRING,
            value: latestCommit.html_url,
          },
          commit_sha: {
            type: ParameterType.STRING,
            value: latestCommit.sha,
          },
        },
        cache: { lastCommitSha: latestCommit.sha },
      };
    } catch (error) {
      console.error(`[Github] Error polling commits for ${repo}:`, error);
      return { triggered: false, parameters: {} };
    }
  }
}
