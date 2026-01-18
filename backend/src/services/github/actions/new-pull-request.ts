import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface GithubPR {
  id: number;
  number: number;
  title: string;
  body?: string;
  user: { login: string };
  html_url: string;
}

export class GithubNewPullRequest extends ServiceActionDefinition {
  name = 'github.new_pull_request';
  label = 'New Pull Request on Repository';
  description = 'Triggers when a new pull request is opened in a repository';
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
      name: 'state',
      type: ParameterType.SELECT,
      label: 'PR state',
      description: 'PR state to consider',
      required: false,
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
        { label: 'All', value: 'all' },
      ],
    },
  ];

  output_params: ParameterDefinition[] = [
    {
      name: 'pr_title',
      type: ParameterType.STRING,
      label: 'Title',
      description: 'PR title',
      required: true,
    },
    {
      name: 'pr_body',
      type: ParameterType.STRING,
      label: 'Body',
      description: 'PR body',
      required: false,
    },
    {
      name: 'pr_author',
      type: ParameterType.STRING,
      label: 'Author',
      description: 'PR author login',
      required: true,
    },
    {
      name: 'pr_number',
      type: ParameterType.STRING,
      label: 'PR Number',
      description: 'PR number',
      required: true,
    },
    {
      name: 'pr_url',
      type: ParameterType.STRING,
      label: 'URL',
      description: 'Link to the PR',
      required: true,
    },
  ];

  async reload_cache(sconf: ServiceConfig): Promise<Record<string, unknown>> {
    const accessToken = sconf.config.access_token as string | undefined;
    let repo = sconf.config.repository as string;
    if (repo && repo.endsWith('/')) repo = repo.slice(0, -1);
    const state = (sconf.config.state as string) || 'open';

    if (!accessToken || !repo) return { lastPRNumber: null };

    try {
      const resp = await axios.get<GithubPR[]>(
        `https://api.github.com/repos/${repo}/pulls`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params: { state, per_page: 1, sort: 'created', direction: 'desc' },
        },
      );

      if (resp.data && resp.data.length > 0) {
        return { lastPRNumber: resp.data[0].number };
      }
    } catch (error) {
      console.warn(`[Github] Failed to fetch initial PRs for ${repo}:`, error);
    }
    return { lastPRNumber: null };
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    let repo = sconf.config.repository as string;
    if (repo && repo.endsWith('/')) repo = repo.slice(0, -1);
    const state = (sconf.config.state as string) || 'open';

    if (!accessToken || !repo) return { triggered: false, parameters: {} };

    const lastNumber = sconf.cache?.lastPRNumber as number | null;

    try {
      const resp = await axios.get<GithubPR[]>(
        `https://api.github.com/repos/${repo}/pulls`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params: { state, per_page: 1, sort: 'created', direction: 'desc' },
        },
      );

      const latest = resp.data[0];
      if (!latest) return { triggered: false, parameters: {} };

      if (lastNumber === latest.number)
        return { triggered: false, parameters: {} };

      if (!lastNumber) {
        return {
          triggered: false,
          parameters: {},
          cache: { lastPRNumber: latest.number },
        };
      }

      return {
        triggered: true,
        parameters: {
          pr_title: { type: ParameterType.STRING, value: latest.title },
          pr_body: { type: ParameterType.STRING, value: latest.body || '' },
          pr_author: { type: ParameterType.STRING, value: latest.user.login },
          pr_number: {
            type: ParameterType.STRING,
            value: String(latest.number),
          },
          pr_url: { type: ParameterType.STRING, value: latest.html_url },
        },
        cache: { lastPRNumber: latest.number },
      };
    } catch (error) {
      console.error(`[Github] Error polling PRs for ${repo}:`, error);
      return { triggered: false, parameters: {} };
    }
  }
}
