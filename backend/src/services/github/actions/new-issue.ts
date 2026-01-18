import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface GithubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  user: { login: string };
  html_url: string;
  labels?: Array<{ name: string }>;
}

export class GithubNewIssue extends ServiceActionDefinition {
  name = 'github.new_issue';
  label = 'New Issue on Repository';
  description = 'Triggers when a new issue is created in a specific repository';
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
      label: 'Issue state',
      description: 'Issue state to consider',
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
      name: 'issue_title',
      type: ParameterType.STRING,
      label: 'Title',
      description: 'Issue title',
      required: true,
    },
    {
      name: 'issue_body',
      type: ParameterType.STRING,
      label: 'Body',
      description: 'Issue body',
      required: false,
    },
    {
      name: 'issue_author',
      type: ParameterType.STRING,
      label: 'Author',
      description: 'Issue author login',
      required: true,
    },
    {
      name: 'issue_number',
      type: ParameterType.STRING,
      label: 'Issue Number',
      description: 'Issue number',
      required: true,
    },
    {
      name: 'issue_url',
      type: ParameterType.STRING,
      label: 'URL',
      description: 'Link to the issue',
      required: true,
    },
    {
      name: 'issue_labels',
      type: ParameterType.STRING,
      label: 'Labels',
      description: 'Comma separated labels',
      required: false,
    },
  ];

  async reload_cache(sconf: ServiceConfig): Promise<Record<string, unknown>> {
    const accessToken = sconf.config.access_token as string | undefined;
    let repo = sconf.config.repository as string;
    if (repo && repo.endsWith('/')) repo = repo.slice(0, -1);
    const state = (sconf.config.state as string) || 'open';

    if (!accessToken || !repo) return { lastIssueNumber: null };

    try {
      const resp = await axios.get<GithubIssue[]>(
        `https://api.github.com/repos/${repo}/issues`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params: { state, per_page: 1, sort: 'created', direction: 'desc' },
        },
      );

      if (resp.data && resp.data.length > 0) {
        return { lastIssueNumber: resp.data[0].number };
      }
    } catch (error) {
      console.warn(
        `[Github] Failed to fetch initial issues for ${repo}:`,
        error,
      );
    }
    return { lastIssueNumber: null };
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    let repo = sconf.config.repository as string;
    if (repo && repo.endsWith('/')) repo = repo.slice(0, -1);
    const state = (sconf.config.state as string) || 'open';

    if (!accessToken || !repo) return { triggered: false, parameters: {} };

    const lastNumber = sconf.cache?.lastIssueNumber as number | null;

    try {
      const resp = await axios.get<GithubIssue[]>(
        `https://api.github.com/repos/${repo}/issues`,
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
          cache: { lastIssueNumber: latest.number },
        };
      }

      const labels = (latest.labels || []).map((l) => l.name).join(',');

      return {
        triggered: true,
        parameters: {
          issue_title: { type: ParameterType.STRING, value: latest.title },
          issue_body: { type: ParameterType.STRING, value: latest.body || '' },
          issue_author: {
            type: ParameterType.STRING,
            value: latest.user.login,
          },
          issue_number: {
            type: ParameterType.STRING,
            value: String(latest.number),
          },
          issue_url: { type: ParameterType.STRING, value: latest.html_url },
          issue_labels: { type: ParameterType.STRING, value: labels },
        },
        cache: { lastIssueNumber: latest.number },
      };
    } catch (error) {
      console.error(`[Github] Error polling issues for ${repo}:`, error);
      return { triggered: false, parameters: {} };
    }
  }
}
